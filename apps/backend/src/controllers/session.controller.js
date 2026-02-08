import { supabase } from '../services/database.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * Auto-assign athletes to a session based on weight category and gender
 * @param {string} sessionId - Session UUID
 * @returns {number} - Number of athletes assigned
 */
async function autoAssignAthletesToSession(sessionId) {
  try {
    // Get session details
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('id, weight_category, weight_classes, gender, competition_id')
      .eq('id', sessionId)
      .single();
    
    if (sessionError) {
      console.error('❌ Error fetching session:', sessionError);
      throw sessionError;
    }
    
    console.log('🔍 Session details:', {
      id: session.id,
      weight_category: session.weight_category,
      weight_classes: session.weight_classes,
      gender: session.gender
    });
    
    // Determine which weight categories to match
    let weightCategoriesToMatch = [];
    if (session.weight_classes && session.weight_classes.length > 0) {
      weightCategoriesToMatch = session.weight_classes;
    } else if (session.weight_category) {
      weightCategoriesToMatch = [session.weight_category];
    } else {
      console.warn('⚠️ Session has no weight categories defined');
      return 0;
    }
    
    console.log('🎯 Matching weight categories:', weightCategoriesToMatch);
    
    // Find all athletes matching the criteria who don't have a session assigned
    let query = supabase
      .from('athletes')
      .select('id, name, weight_category, gender, session_id')
      .in('weight_category', weightCategoriesToMatch)
      .is('session_id', null); // Only assign athletes without a session
    
    // Match gender if specified
    if (session.gender) {
      query = query.eq('gender', session.gender);
    }
    
    const { data: athletes, error: athletesError } = await query;
    
    if (athletesError) {
      console.error('❌ Error fetching athletes:', athletesError);
      throw athletesError;
    }
    
    if (!athletes || athletes.length === 0) {
      console.log('ℹ️ No athletes found matching criteria');
      return 0;
    }
    
    console.log(`📊 Found ${athletes.length} athletes to assign:`, 
      athletes.map(a => `${a.name} (${a.weight_category}kg, ${a.gender})`));
    
    // Update all matching athletes to assign them to this session
    const athleteIds = athletes.map(a => a.id);
    
    const { data: updatedAthletes, error: updateError } = await supabase
      .from('athletes')
      .update({ session_id: sessionId })
      .in('id', athleteIds)
      .select();
    
    if (updateError) {
      console.error('❌ Error updating athletes:', updateError);
      throw updateError;
    }
    
    console.log(`✅ Successfully assigned ${updatedAthletes.length} athletes to session ${sessionId}`);
    
    return updatedAthletes.length;
    
  } catch (error) {
    console.error('❌ Error in autoAssignAthletesToSession:', error);
    throw error;
  }
}

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

    const newSession = data[0];
    
    // 🤖 AUTO-ASSIGN ATHLETES TO SESSION
    try {
      console.log('🤖 Auto-assigning athletes to new session...');
      const assignedCount = await autoAssignAthletesToSession(newSession.id);
      console.log(`✅ Auto-assigned ${assignedCount} athletes to session`);
      
      // Add auto-assignment info to response
      newSession.auto_assigned_count = assignedCount;
    } catch (autoError) {
      console.error('❌ Error in auto-assignment:', autoError);
      // Don't fail session creation if auto-assignment fails
      newSession.auto_assignment_error = autoError.message;
    }

    res.status(201).json({
      success: true,
      data: newSession,
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

    const updatedSession = data[0];
    console.log('✅ Session updated successfully:', { sessionId: updatedSession.id, newStatus: updatedSession.status });
    
    // 🤖 AUTO-REASSIGN ATHLETES if weight category or gender changed
    if (req.body.weight_category || req.body.weight_classes || req.body.gender) {
      try {
        console.log('🤖 Weight category/gender updated, re-assigning athletes...');
        const assignedCount = await autoAssignAthletesToSession(updatedSession.id);
        console.log(`✅ Auto-assigned ${assignedCount} athletes after update`);
        updatedSession.auto_assigned_count = assignedCount;
      } catch (autoError) {
        console.error('❌ Error in auto-assignment:', autoError);
        updatedSession.auto_assignment_error = autoError.message;
      }
    }
    
    // Emit socket event
    req.app.get('io').emit('session:updated', updatedSession);
    console.log('📡 Emitted session:updated event');

    res.status(200).json({
      success: true,
      data: updatedSession,
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

