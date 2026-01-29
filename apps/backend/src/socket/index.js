const logger = require('../utils/logger.js');
const db = require('../services/database.js');
const { supabase } = require('../services/database.js');

let ioInstance = null;
const realtimeSubscriptions = new Map();

const setupSocketIO = (io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    logger.info(`🔌 New client connected: ${socket.id}`);

    // Join competition room
    socket.on('join:competition', (competitionId) => {
      socket.join(`competition:${competitionId}`);
      logger.info(`Socket ${socket.id} joined competition:${competitionId}`);
    });

    // Join session room
    socket.on('join:session', (sessionId) => {
      socket.join(`session:${sessionId}`);
      logger.info(`Socket ${socket.id} joined session:${sessionId}`);
      
      // Set up realtime subscription for this session if not already subscribed
      setupSessionRealtimeSubscription(sessionId, io);
    });

    // Leave competition room
    socket.on('leave:competition', (competitionId) => {
      socket.leave(`competition:${competitionId}`);
      logger.info(`Socket ${socket.id} left competition:${competitionId}`);
    });

    // Leave session room
    socket.on('leave:session', (sessionId) => {
      socket.leave(`session:${sessionId}`);
      logger.info(`Socket ${socket.id} left session:${sessionId}`);
    });

    // Display screen control - broadcast to all clients
    socket.on('display:switch', (data) => {
      logger.info(`📺 Display screen switch requested for session: ${data.sessionId}`);
      io.emit('display:switch', data); // Broadcast to all connected clients
    });

    // Timer events
    socket.on('timer:start', (data) => {
      io.to(`session:${data.sessionId}`).emit('timer:started', data);
    });

    socket.on('timer:pause', (data) => {
      io.to(`session:${data.sessionId}`).emit('timer:paused', data);
    });

    socket.on('timer:reset', (data) => {
      io.to(`session:${data.sessionId}`).emit('timer:reset', data);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  // Set up global Supabase realtime subscriptions
  setupGlobalRealtimeSubscriptions(io);

  logger.info('✅ Socket.IO handlers registered');
};

// Set up global realtime subscriptions for all tables
const setupGlobalRealtimeSubscriptions = (io) => {
  // Subscribe to attempts table changes
  const attemptsChannel = supabase
    .channel('attempts-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'attempts',
      },
      async (payload) => {
        logger.info(`📡 Attempt change detected: ${payload.eventType}`);
        
        // Fetch full attempt details with athlete info
        const { data: attempt, error } = await supabase
          .from('attempts')
          .select('*, athlete:athletes(*), session:sessions(*)')
          .eq('id', payload.new?.id || payload.old?.id)
          .single();

        if (error) {
          logger.error('Error fetching attempt details:', error);
          return;
        }

        const sessionId = attempt?.session_id || payload.new?.session_id || payload.old?.session_id;
        
        if (payload.eventType === 'INSERT') {
          io.to(`session:${sessionId}`).emit('attempt:created', attempt);
          logger.info(`✅ Emitted attempt:created to session:${sessionId}`);
        } else if (payload.eventType === 'UPDATE') {
          io.to(`session:${sessionId}`).emit('attempt:updated', attempt);
          
          // If result changed from pending to good/no-lift, emit validation event
          if (payload.old?.result === 'pending' && payload.new?.result !== 'pending') {
            io.to(`session:${sessionId}`).emit('attempt:validated', attempt);
            logger.info(`✅ Emitted attempt:validated to session:${sessionId} - Result: ${attempt.result}`);
            
            // Trigger leaderboard refresh after validation
            await broadcastLeaderboardUpdate(sessionId, io);
            
            // Trigger lifting order update for both lifts
            await broadcastLiftingOrderUpdate(sessionId, 'snatch');
            await broadcastLiftingOrderUpdate(sessionId, 'clean_jerk');
          }
        } else if (payload.eventType === 'INSERT') {
          // When new attempt is declared, update lifting order
          await broadcastLiftingOrderUpdate(sessionId, attempt.lift_type);
        }
      }
    )
    .subscribe();

  // Subscribe to athletes table changes (for best lifts, totals, rankings)
  const athletesChannel = supabase
    .channel('athletes-changes')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'athletes',
      },
      async (payload) => {
        logger.info(`📡 Athlete change detected - ID: ${payload.new?.id}`);
        
        // Check if best lifts, totals, or rankings changed
        const oldData = payload.old;
        const newData = payload.new;
        
        const hasSignificantChange = 
          oldData.best_snatch !== newData.best_snatch ||
          oldData.best_clean_and_jerk !== newData.best_clean_and_jerk ||
          oldData.total !== newData.total ||
          oldData.rank !== newData.rank;

        if (hasSignificantChange && newData.session_id) {
          logger.info(`📊 Rankings updated for athlete ${newData.name}`);
          await broadcastLeaderboardUpdate(newData.session_id, io);
        }
      }
    )
    .subscribe();

  // Subscribe to sessions table changes
  const sessionsChannel = supabase
    .channel('sessions-changes')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'sessions',
      },
      async (payload) => {
        logger.info(`📡 Session change detected - ID: ${payload.new?.id}`);
        
        const { data: session, error } = await supabase
          .from('sessions')
          .select('*, competition:competitions(*)')
          .eq('id', payload.new?.id)
          .single();

        if (!error && session) {
          io.to(`session:${session.id}`).emit('session:updated', session);
          logger.info(`✅ Emitted session:updated to session:${session.id}`);
        }
      }
    )
    .subscribe();

  // Subscribe to weight_change_requests table changes
  const weightChangesChannel = supabase
    .channel('weight-changes-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'weight_change_requests',
      },
      async (payload) => {
        logger.info(`📡 Weight change detected: ${payload.eventType}`);
        
        const weightChangeId = payload.new?.id || payload.old?.id;
        const sessionId = payload.new?.session_id || payload.old?.session_id;
        const liftType = payload.new?.lift_type || payload.old?.lift_type;
        
        // Fetch full weight change details
        const { data: weightChange, error } = await supabase
          .from('weight_change_requests')
          .select(`
            *,
            athlete:athletes(
              id,
              name,
              start_number,
              country_code,
              team:teams(name, logo_url)
            )
          `)
          .eq('id', weightChangeId)
          .single();

        if (error) {
          logger.error('Error fetching weight change details:', error);
          return;
        }

        if (payload.eventType === 'INSERT') {
          io.to(`session:${sessionId}`).emit('weightChange:created', weightChange);
          logger.info(`✅ Emitted weightChange:created to session:${sessionId}`);
          
          // Trigger lifting order update for the affected lift type
          await broadcastLiftingOrderUpdate(sessionId, liftType);
        } else if (payload.eventType === 'UPDATE') {
          io.to(`session:${sessionId}`).emit('weightChange:updated', weightChange);
          logger.info(`✅ Emitted weightChange:updated to session:${sessionId}`);
          
          // Trigger lifting order update
          await broadcastLiftingOrderUpdate(sessionId, liftType);
        } else if (payload.eventType === 'DELETE') {
          io.to(`session:${sessionId}`).emit('weightChange:deleted', { id: weightChangeId });
          logger.info(`✅ Emitted weightChange:deleted to session:${sessionId}`);
          
          // Trigger lifting order update
          await broadcastLiftingOrderUpdate(sessionId, liftType);
        }
      }
    )
    .subscribe();

  realtimeSubscriptions.set('attempts', attemptsChannel);
  realtimeSubscriptions.set('athletes', athletesChannel);
  realtimeSubscriptions.set('sessions', sessionsChannel);
  realtimeSubscriptions.set('weight_changes', weightChangesChannel);

  logger.info('✅ Supabase realtime subscriptions established');
};

// Set up session-specific realtime subscription
const setupSessionRealtimeSubscription = (sessionId, io) => {
  const subscriptionKey = `session:${sessionId}`;
  
  // Don't create duplicate subscriptions
  if (realtimeSubscriptions.has(subscriptionKey)) {
    return;
  }

  logger.info(`🔔 Setting up realtime subscription for session: ${sessionId}`);
};

// Broadcast leaderboard update to all clients in a session
const broadcastLeaderboardUpdate = async (sessionId, io) => {
  try {
    const { data: leaderboard, error } = await supabase
      .from('leaderboard')
      .select('*')
      .eq('session_id', sessionId)
      .order('rank', { ascending: true });

    if (error) {
      logger.error('Error fetching leaderboard:', error);
      return;
    }

    io.to(`session:${sessionId}`).emit('leaderboard:updated', leaderboard);
    logger.info(`📊 Emitted leaderboard:updated to session:${sessionId} - ${leaderboard?.length || 0} athletes`);
  } catch (error) {
    logger.error('Error broadcasting leaderboard update:', error);
  }
};

// Broadcast lifting order update to all clients in a session
const broadcastLiftingOrderUpdate = async (sessionId, liftType = 'snatch') => {
  if (!ioInstance) return;
  
  try {
    // Import dynamically to avoid circular dependency
    const { getCurrentLiftingPositions } = await import('../services/liftingOrder.service.js');
    
    const positions = await getCurrentLiftingPositions(sessionId, liftType);
    
    ioInstance.to(`session:${sessionId}`).emit('liftingOrder:updated', {
      liftType,
      ...positions
    });
    
    logger.info(`🏋️ Emitted liftingOrder:updated to session:${sessionId} - ${liftType}: ${positions.fullOrder?.length || 0} athletes`);
  } catch (error) {
    logger.error('Error broadcasting lifting order update:', error);
  }
};

// Export function to emit events from controllers
const emitToSession = (sessionId, event, data) => {
  if (ioInstance) {
    ioInstance.to(`session:${sessionId}`).emit(event, data);
    logger.info(`✅ Emitted ${event} to session:${sessionId}`);
  }
};

// Cleanup function for graceful shutdown
const cleanupRealtimeSubscriptions = () => {
  realtimeSubscriptions.forEach((channel, key) => {
    channel.unsubscribe();
    logger.info(`🔕 Unsubscribed from ${key}`);
  });
  realtimeSubscriptions.clear();
};

module.exports = { setupSocketIO };
