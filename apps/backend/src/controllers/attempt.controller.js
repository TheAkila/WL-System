import Attempt from '../models/Attempt.js';
import { AppError } from '../middleware/errorHandler.js';

export const getAttempts = async (req, res, next) => {
  try {
    const { sessionId, athleteId, liftType } = req.query;
    
    const filter = {};
    if (sessionId) filter.session = sessionId;
    if (athleteId) filter.athlete = athleteId;
    if (liftType) filter.liftType = liftType;

    const attempts = await Attempt.find(filter)
      .populate('athlete')
      .populate('session')
      .sort('-timestamp');

    res.status(200).json({
      success: true,
      count: attempts.length,
      data: attempts,
    });
  } catch (error) {
    next(error);
  }
};

export const createAttempt = async (req, res, next) => {
  try {
    const attempt = await Attempt.create(req.body);
    await attempt.populate('athlete session');

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

export const updateAttempt = async (req, res, next) => {
  try {
    const attempt = await Attempt.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('athlete session');

    if (!attempt) {
      throw new AppError('Attempt not found', 404);
    }

    // Emit socket event
    req.app.get('io').emit('attempt:updated', attempt);

    res.status(200).json({
      success: true,
      data: attempt,
    });
  } catch (error) {
    next(error);
  }
};

export const validateAttempt = async (req, res, next) => {
  try {
    const { result } = req.body;
    const { referee } = req.query; // 'left', 'center', or 'right'

    if (!referee || !['left', 'center', 'right'].includes(referee)) {
      throw new AppError('Invalid referee position', 400);
    }

    const attempt = await Attempt.findById(req.params.id);

    if (!attempt) {
      throw new AppError('Attempt not found', 404);
    }

    attempt.refereeDecisions[referee] = result;
    attempt.calculateResult();
    await attempt.save();
    await attempt.populate('athlete session');

    // Emit socket event
    req.app.get('io').emit('attempt:validated', attempt);

    res.status(200).json({
      success: true,
      data: attempt,
    });
  } catch (error) {
    next(error);
  }
};
