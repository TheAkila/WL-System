/**
 * Timer Service for Competition Clock Management
 * Manages session timers with real-time synchronization and IWF compliance
 */

class TimerService {
  constructor() {
    // sessionId -> timer state mapping
    this.timers = new Map();
    this.intervals = new Map();
    this.warningsEmitted = new Map(); // Track which warnings have been sent
  }

  /**
   * Initialize or get timer state for a session
   */
  getTimerState(sessionId) {
    if (!this.timers.has(sessionId)) {
      this.timers.set(sessionId, {
        sessionId,
        timeRemaining: 60, // Default 60 seconds
        maxTime: 60,
        isRunning: false,
        startedAt: null,
        pausedAt: null,
        mode: 'attempt', // attempt, break, jury
        warning30sent: false,
        warning10sent: false,
      });
    }
    return this.timers.get(sessionId);
  }

  /**
   * Start timer for a session
   */
  startTimer(sessionId, io, duration = null, mode = 'attempt') {
    const timer = this.getTimerState(sessionId);

    // If duration provided, reset timer with new duration
    if (duration !== null) {
      timer.timeRemaining = duration;
      timer.maxTime = duration;
      timer.mode = mode;
    }

    // Reset warning flags when starting fresh
    if (timer.timeRemaining === timer.maxTime) {
      timer.warning30sent = false;
      timer.warning10sent = false;
    }

    // If timer already running, don't restart
    if (timer.isRunning) {
      return timer;
    }

    timer.isRunning = true;
    timer.startedAt = Date.now();
    timer.pausedAt = null;

    // Clear existing interval if any
    if (this.intervals.has(sessionId)) {
      clearInterval(this.intervals.get(sessionId));
    }

    // Start countdown
    const intervalId = setInterval(() => {
      const timer = this.timers.get(sessionId);
      
      if (!timer || !timer.isRunning) {
        clearInterval(intervalId);
        this.intervals.delete(sessionId);
        return;
      }

      timer.timeRemaining--;

      // Check for warning thresholds (IWF rules)
      if (timer.timeRemaining === 30 && !timer.warning30sent) {
        timer.warning30sent = true;
        io.to(`session:${sessionId}`).emit('timer:warning', {
          sessionId,
          timeRemaining: 30,
          warningType: '30seconds',
          message: '30 seconds remaining',
        });
      }

      if (timer.timeRemaining === 10 && !timer.warning10sent) {
        timer.warning10sent = true;
        io.to(`session:${sessionId}`).emit('timer:warning', {
          sessionId,
          timeRemaining: 10,
          warningType: '10seconds',
          message: '10 seconds remaining',
        });
      }

      // Emit update to all clients in session
      io.to(`session:${sessionId}`).emit('timer:tick', {
        sessionId,
        timeRemaining: timer.timeRemaining,
        isRunning: timer.isRunning,
        mode: timer.mode,
        maxTime: timer.maxTime,
      });

      // Auto-stop when timer reaches 0
      if (timer.timeRemaining <= 0) {
        timer.timeRemaining = 0;
        timer.isRunning = false;
        clearInterval(intervalId);
        this.intervals.delete(sessionId);

        // Emit timer expired event
        io.to(`session:${sessionId}`).emit('timer:expired', {
          sessionId,
          mode: timer.mode,
        });
      }
    }, 1000);

    this.intervals.set(sessionId, intervalId);

    return timer;
  }

  /**
   * Pause timer for a session
   */
  pauseTimer(sessionId, io) {
    const timer = this.getTimerState(sessionId);

    if (!timer.isRunning) {
      return timer;
    }

    timer.isRunning = false;
    timer.pausedAt = Date.now();

    // Clear interval
    if (this.intervals.has(sessionId)) {
      clearInterval(this.intervals.get(sessionId));
      this.intervals.delete(sessionId);
    }

    // Emit pause event
    io.to(`session:${sessionId}`).emit('timer:paused', {
      sessionId,
      timeRemaining: timer.timeRemaining,
      isRunning: false,
    });

    return timer;
  }

  /**
   * Reset timer for a session
   */
  resetTimer(sessionId, io, duration = 60, mode = 'attempt') {
    const timer = this.getTimerState(sessionId);

    // Clear interval if running
    if (this.intervals.has(sessionId)) {
      clearInterval(this.intervals.get(sessionId));
      this.intervals.delete(sessionId);
    }

    timer.timeRemaining = duration;
    timer.maxTime = duration;
    timer.isRunning = false;
    timer.startedAt = null;
    timer.pausedAt = null;
    timer.mode = mode;
    timer.warning30sent = false;
    timer.warning10sent = false;

    // Emit reset event
    io.to(`session:${sessionId}`).emit('timer:reset', {
      sessionId,
      timeRemaining: duration,
      isRunning: false,
      mode: mode,
    });

    return timer;
  }

  /**
   * Quick preset timers (IWF standard times)
   */
  presets = {
    FIRST_ATTEMPT: 60,      // 60 seconds for first attempt
    SUBSEQUENT_ATTEMPT: 120, // 2 minutes for subsequent attempts
    BREAK: 600,             // 10 minutes for breaks
    JURY_DECISION: 600,     // 10 minutes for jury deliberation
    TECHNICAL_TIMEOUT: 180, // 3 minutes for technical issues
    WARM_UP: 300,           // 5 minutes for warm-up
  };

  /**
   * Set timer to a preset duration
   */
  setPreset(sessionId, io, presetName) {
    const duration = this.presets[presetName];
    if (!duration) {
      throw new Error(`Invalid preset: ${presetName}`);
    }

    const mode = presetName.includes('ATTEMPT') ? 'attempt' : 
                 presetName.includes('JURY') ? 'jury' : 'break';

    return this.resetTimer(sessionId, io, duration, mode);
  }

  /**
   * Stop and clear timer for a session
   */
  clearTimer(sessionId) {
    if (this.intervals.has(sessionId)) {
      clearInterval(this.intervals.get(sessionId));
      this.intervals.delete(sessionId);
    }
    this.timers.delete(sessionId);
  }

  /**
   * Clean up all timers
   */
  cleanup() {
    this.intervals.forEach((intervalId) => clearInterval(intervalId));
    this.intervals.clear();
    this.timers.clear();
  }
}

// Singleton instance
const timerService = new TimerService();

export default timerService;
