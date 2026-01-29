const db = require('../services/database.js');
const { AppError } = require('../middleware/errorHandler.js');

const getAttempts = async (req, res, next) => {
  try {
    const { sessionId, athleteId, liftType, limit = 50, offset = 0 } = req.query;

    // Use database service with pagination and relations
    const attempts = await db.getAttempts({
      sessionId,
      athleteId,
      liftType,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.status(200).json({
      success: true,
      count: attempts.length,
      data: attempts,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
      }
    });
  } catch (error) {
    next(error);
  }
};

const createAttempt = async (req, res, next) => {
  try {
    const attempt = await db.createAttempt(req.body);

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

const updateAttempt = async (req, res, next) => {
  try {
    const attempt = await db.updateAttempt(req.params.id, req.body);

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

const validateAttempt = async (req, res, next) => {
  try {
    const { result } = req.body;
    const { referee } = req.query; // 'left', 'center', or 'right'

    if (!referee || !['left', 'center', 'right'].includes(referee)) {
      throw new AppError('Invalid referee position', 400);
    }

    const attempt = await db.recordRefereeDecision(req.params.id, referee, result);

    if (!attempt) {
      throw new AppError('Attempt not found', 404);
    }

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
module.exports = { getAttempts,createAttempt,updateAttempt,validateAttempt };
