import db from '../services/database.js';
import { AppError } from '../middleware/errorHandler.js';

// Get all active sessions
export const getActiveSessions = async (req, res, next) => {
  try {
    const { data, error } = await db.supabase
      .from('sessions')
      .select('*, competition:competitions(*)')
      .in('status', ['scheduled', 'in-progress'])
      .order('start_time', { ascending: true });

    if (error) throw new AppError(error.message, 400);

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// Get lifting order for a session
export const getLiftingOrder = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const { data, error } = await db.supabase.rpc('get_lifting_order', {
      p_session_id: sessionId,
    });

    if (error) throw new AppError(error.message, 400);

    res.status(200).json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    next(error);
  }
};

// Declare an attempt for an athlete
export const declareAttempt = async (req, res, next) => {
  try {
    const { athleteId, weight } = req.body;

    if (!athleteId || !weight) {
      throw new AppError('Athlete ID and weight are required', 400);
    }

    // Use the stored procedure to create attempt
    const { data: attemptId, error: rpcError } = await db.supabase.rpc(
      'declare_attempt',
      {
        p_athlete_id: athleteId,
        p_weight: weight,
      }
    );

    if (rpcError) throw new AppError(rpcError.message, 400);

    // Get the full attempt details
    const { data: attempt, error } = await db.supabase
      .from('attempts')
      .select('*, athlete:athletes(*), session:sessions(*)')
      .eq('id', attemptId)
      .single();

    if (error) throw new AppError(error.message, 400);

    // Emit socket event
    req.app.get('io').emit('attempt:created', attempt);

    res.status(201).json({
      success: true,
      data: attempt,
    });
  } catch (error) {
    next(error);
  }
};

// Record referee decision
export const recordRefereeDecision = async (req, res, next) => {
  try {
    const { attemptId } = req.params;
    const { position, decision } = req.body;

    if (!position || !decision) {
      throw new AppError('Position and decision are required', 400);
    }

    if (!['left', 'center', 'right'].includes(position)) {
      throw new AppError('Position must be left, center, or right', 400);
    }

    if (!['good', 'no-lift'].includes(decision)) {
      throw new AppError('Decision must be good or no-lift', 400);
    }

    // Update the referee decision
    const field = `referee_${position}`;
    const { data: attempt, error } = await db.supabase
      .from('attempts')
      .update({ [field]: decision })
      .eq('id', attemptId)
      .select('*, athlete:athletes(*), session:sessions(*)')
      .single();

    if (error) throw new AppError(error.message, 400);

    // Emit socket event
    req.app.get('io').emit('attempt:updated', attempt);

    // If result is finalized, emit additional event
    if (attempt.result !== 'pending') {
      req.app.get('io').emit('attempt:validated', attempt);
    }

    res.status(200).json({
      success: true,
      data: attempt,
    });
  } catch (error) {
    next(error);
  }
};

// Quick decision - automatically record all 3 referee decisions
export const recordQuickDecision = async (req, res, next) => {
  try {
    const { attemptId } = req.params;
    const { decision } = req.body;

    if (!decision) {
      throw new AppError('Decision is required', 400);
    }

    if (!['good', 'no-lift'].includes(decision)) {
      throw new AppError('Decision must be good or no-lift', 400);
    }

    // Record all 3 referee decisions at once
    const { data: attempt, error } = await db.supabase
      .from('attempts')
      .update({
        referee_left: decision,
        referee_center: decision,
        referee_right: decision,
      })
      .eq('id', attemptId)
      .select('*, athlete:athletes(*), session:sessions(*)')
      .single();

    if (error) throw new AppError(error.message, 400);

    // Emit socket events
    req.app.get('io').emit('attempt:updated', attempt);
    req.app.get('io').emit('attempt:validated', attempt);

    res.status(200).json({
      success: true,
      data: attempt,
    });
  } catch (error) {
    next(error);
  }
};

// Get current attempt in progress
export const getCurrentAttempt = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const { data, error } = await db.supabase
      .from('attempts')
      .select('*, athlete:athletes(*), session:sessions(*)')
      .eq('session_id', sessionId)
      .eq('result', 'pending')
      .order('timestamp', { ascending: false })
      .limit(1);

    if (error) throw new AppError(error.message, 400);

    res.status(200).json({
      success: true,
      data: data[0] || null,
    });
  } catch (error) {
    next(error);
  }
};

// Get session leaderboard
export const getSessionLeaderboard = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const { data, error } = await db.supabase
      .from('leaderboard')
      .select('*')
      .eq('session_id', sessionId)
      .order('rank', { ascending: true });

    if (error) throw new AppError(error.message, 400);

    res.status(200).json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    next(error);
  }
};

// Update session status
export const updateSessionStatus = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { status } = req.body;

    if (!status) {
      throw new AppError('Status is required', 400);
    }

    const updates = { status };

    if (status === 'in-progress' && !req.body.skipStartTime) {
      updates.start_time = new Date().toISOString();
    } else if (status === 'completed') {
      updates.end_time = new Date().toISOString();
    }

    const { data, error } = await db.supabase
      .from('sessions')
      .update(updates)
      .eq('id', sessionId)
      .select('*, competition:competitions(*)')
      .single();

    if (error) throw new AppError(error.message, 400);

    // Emit socket event
    req.app.get('io').emit('session:updated', data);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// Change current lift (snatch to clean & jerk)
export const changeCurrentLift = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { liftType } = req.body;

    if (!liftType || !['snatch', 'clean_and_jerk'].includes(liftType)) {
      throw new AppError('Valid lift type is required', 400);
    }

    const { data, error } = await db.supabase
      .from('sessions')
      .update({ current_lift: liftType })
      .eq('id', sessionId)
      .select('*, competition:competitions(*)')
      .single();

    if (error) throw new AppError(error.message, 400);

    // Emit socket event
    req.app.get('io').emit('session:updated', data);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// Update athlete medal (manual override)
export const updateAthleteMedal = async (req, res, next) => {
  try {
    const { athleteId } = req.params;
    const { medal } = req.body;

    // Validate medal value
    if (medal !== null && !['gold', 'silver', 'bronze'].includes(medal)) {
      throw new AppError('Medal must be gold, silver, bronze, or null', 400);
    }

    const { data, error } = await db.supabase
      .from('athletes')
      .update({ 
        medal,
        medal_manual_override: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', athleteId)
      .select('*, team:teams(*), session:sessions(*)')
      .single();

    if (error) throw new AppError(error.message, 400);

    // Emit socket event to notify all clients
    const io = req.app.get('io');
    io.emit('athlete:updated', data);
    
    // Also emit leaderboard update for the session
    if (data.session_id) {
      const { data: leaderboard } = await db.supabase
        .from('athletes')
        .select('*')
        .eq('session_id', data.session_id)
        .order('rank', { ascending: true, nullsFirst: false });
      
      io.to(`session:${data.session_id}`).emit('leaderboard:updated', leaderboard);
    }

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};
