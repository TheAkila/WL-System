import { supabase } from '../services/database.js';
import { AppError } from '../middleware/errorHandler.js';

export const getSessions = async (req, res, next) => {
  try {
    const { competitionId, status, limit = 50, offset = 0 } = req.query;
    
    // Include competition data and athlete count
    let query = supabase.from('sessions').select('*, competition:competitions(*)', { count: 'exact' });

    if (competitionId) query = query.eq('competition_id', competitionId);
    if (status) query = query.eq('status', status);

    // Add pagination
    query = query.order('start_time', { ascending: true })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    const { data, error, count } = await query;

    if (error) throw new AppError(error.message, 400);

    res.status(200).json({
      success: true,
      count: count || data?.length || 0,
      data: data || [],
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + parseInt(limit)) < (count || 0)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getSession = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('sessions')
      .select('*, competition:competitions(*)')
      .eq('id', req.params.id)
      .single();

    if (error) throw new AppError('Session not found', 404);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const createSession = async (req, res, next) => {
  try {
    // Auto-assign competition_id if not provided (single competition system)
    let sessionData = { ...req.body };
    
    // Ensure weight_classes is an array
    if (sessionData.weight_classes && !Array.isArray(sessionData.weight_classes)) {
      sessionData.weight_classes = [sessionData.weight_classes];
    }
    
    // If no weight_classes provided, use weight_category as fallback
    if (!sessionData.weight_classes || sessionData.weight_classes.length === 0) {
      sessionData.weight_classes = [sessionData.weight_category];
    }
    
    if (!sessionData.competition_id) {
      // Get the current active competition
      const { data: competition } = await supabase
        .from('competitions')
        .select('id')
        .eq('status', 'active')
        .single();
      
      if (competition) {
        sessionData.competition_id = competition.id;
      } else {
        // If no active competition, get the most recent one
        const { data: recentComp } = await supabase
          .from('competitions')
          .select('id')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (recentComp) {
          sessionData.competition_id = recentComp.id;
        } else {
          throw new AppError('No competition found. Please create a competition first.', 400);
        }
      }
    }

    const { data, error } = await supabase
      .from('sessions')
      .insert([sessionData])
      .select();

    if (error) throw new AppError(error.message, 400);

    res.status(201).json({
      success: true,
      data: data[0],
    });
  } catch (error) {
    next(error);
  }
};

export const updateSession = async (req, res, next) => {
  try {
    console.log('📝 updateSession called:', { sessionId: req.params.id, body: req.body, userId: req.user?.id });
    
    const { data, error } = await supabase
      .from('sessions')
      .update(req.body)
      .eq('id', req.params.id)
      .select();

    if (error) {
      console.error('❌ Database error updating session:', error);
      throw new AppError(error.message, 400);
    }
    if (!data || data.length === 0) {
      console.error('❌ Session not found:', req.params.id);
      throw new AppError('Session not found', 404);
    }

    console.log('✅ Session updated successfully:', { sessionId: data[0].id, newStatus: data[0].status });
    
    // Emit socket event
    req.app.get('io').emit('session:updated', data[0]);
    console.log('📡 Emitted session:updated event');

    res.status(200).json({
      success: true,
      data: data[0],
    });
  } catch (error) {
    console.error('🔴 updateSession error:', error.message);
    next(error);
  }
};

export const deleteSession = async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', req.params.id);

    if (error) throw new AppError(error.message, 400);

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

export const startSession = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('sessions')
      .update({ 
        status: 'in-progress',
        start_time: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .select();

    if (error) throw new AppError(error.message, 400);
    if (!data || data.length === 0) throw new AppError('Session not found', 404);

    // Emit socket event
    req.app.get('io').emit('session:started', data[0]);

    res.status(200).json({
      success: true,
      data: data[0],
    });
  } catch (error) {
    next(error);
  }
};

export const endSession = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('sessions')
      .update({ 
        status: 'completed',
        end_time: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .select();

    if (error) throw new AppError(error.message, 400);
    if (!data || data.length === 0) throw new AppError('Session not found', 404);

    // Emit socket event
    req.app.get('io').emit('session:ended', data[0]);

    res.status(200).json({
      success: true,
      data: data[0],
    });
  } catch (error) {
    next(error);
  }
};

export const clearSessionAttempts = async (req, res, next) => {
  try {
    const sessionId = req.params.id;

    // First, verify session exists
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('id')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      throw new AppError('Session not found', 404);
    }

    // Delete all attempts for this session
    const { error: deleteError } = await supabase
      .from('attempts')
      .delete()
      .eq('session_id', sessionId);

    if (deleteError) {
      throw new AppError(deleteError.message, 400);
    }

    // Emit socket event to update all connected clients
    req.app.get('io').emit('attempts:cleared', { sessionId });

    res.status(200).json({
      success: true,
      message: 'All attempts cleared successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getSessionAthletes = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    console.log('📋 getSessionAthletes called:', { sessionId: id });

    // Get session details to see weight classes
    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .select('name, weight_classes, weight_category')
      .eq('id', id)
      .single();

    if (sessionError) {
      console.error('❌ Error fetching session:', sessionError);
    } else {
      console.log('📌 Session details:', {
        sessionId: id,
        sessionName: sessionData?.name,
        weight_classes: sessionData?.weight_classes,
        weight_category: sessionData?.weight_category
      });
    }

    const { data, error } = await supabase
      .from('athletes')
      .select('*, team:teams(*)')
      .eq('session_id', id)
      .order('weight_category', { ascending: true })
      .order('start_number', { ascending: true });

    if (error) {
      console.error('❌ Error fetching session athletes:', error);
      throw new AppError(error.message, 400);
    }

    console.log('✅ Session athletes fetched:', {
      sessionId: id,
      count: data?.length || 0,
      groupedByClass: data?.reduce((acc, a) => {
        if (!acc[a.weight_category]) acc[a.weight_category] = 0;
        acc[a.weight_category]++;
        return acc;
      }, {})
    });

    res.status(200).json({
      success: true,
      athletes: data || [],
    });
  } catch (error) {
    next(error);
  }
};

