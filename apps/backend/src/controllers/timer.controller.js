const timerService = require('../services/timerService.js');
const { AppError } = require('../middleware/errorHandler.js');

/**
 * Get current timer state for a session
 */
const getTimerState = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const timer = timerService.getTimerState(sessionId);

    res.status(200).json({
      success: true,
      data: timer,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Start timer for a session
 */
const startTimer = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { duration, mode } = req.body; // optional: duration and mode

    const io = req.app.get('io');
    const timer = timerService.startTimer(sessionId, io, duration, mode);

    res.status(200).json({
      success: true,
      message: 'Timer started',
      data: timer,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Pause timer for a session
 */
const pauseTimer = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const io = req.app.get('io');
    const timer = timerService.pauseTimer(sessionId, io);

    res.status(200).json({
      success: true,
      message: 'Timer paused',
      data: timer,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset timer for a session
 */
const resetTimer = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { duration, mode } = req.body; // optional: duration and mode

    const io = req.app.get('io');
    const timer = timerService.resetTimer(sessionId, io, duration || 60, mode || 'attempt');

    res.status(200).json({
      success: true,
      message: 'Timer reset',
      data: timer,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Set timer to a preset duration
 */
const setPreset = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { preset } = req.body; // FIRST_ATTEMPT, SUBSEQUENT_ATTEMPT, BREAK, JURY_DECISION, etc.

    if (!preset) {
      throw new AppError('Preset name is required', 400);
    }

    const io = req.app.get('io');
    const timer = timerService.setPreset(sessionId, io, preset);

    res.status(200).json({
      success: true,
      message: `Timer set to ${preset}`,
      data: timer,
    });
  } catch (error) {
    next(error);
  }
};
module.exports = { getTimerState,startTimer,pauseTimer,resetTimer,setPreset };
