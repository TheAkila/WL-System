/**
 * Weight Change Routes
 * API endpoints for managing athlete weight changes during competition
 */

const express = require('express');
const {
  AppError
} = require('../middleware/errorHandler.js');
const weightChangeService = require('../services/weightChange.service.js');

const router = express.Router();

/**
 * POST /api/weight-changes
 * Request a weight change for an athlete
 * Body: { athleteId, sessionId, liftType, attemptNumber, oldWeight, newWeight, requestedBy, notes }
 */
router.post('/', async (req, res, next) => {
  try {
    const {
      athleteId,
      sessionId,
      liftType,
      attemptNumber,
      oldWeight,
      newWeight,
      requestedBy,
      notes
    } = req.body;

    // Validate required fields
    if (!athleteId || !sessionId || !liftType || !attemptNumber || !oldWeight || !newWeight) {
      throw new AppError('Missing required fields', 400);
    }

    // Validate lift type
    if (!['snatch', 'clean_jerk'].includes(liftType)) {
      throw new AppError('Invalid lift type. Must be "snatch" or "clean_jerk"', 400);
    }

    // Validate attempt number
    if (attemptNumber < 1 || attemptNumber > 3) {
      throw new AppError('Attempt number must be between 1 and 3', 400);
    }

    // Validate weights are positive
    if (oldWeight <= 0 || newWeight <= 0) {
      throw new AppError('Weights must be positive numbers', 400);
    }

    const weightChange = await weightChangeService.requestWeightChange({
      athleteId,
      sessionId,
      liftType,
      attemptNumber,
      oldWeight,
      newWeight,
      requestedBy,
      notes
    });

    res.status(201).json({
      success: true,
      data: weightChange,
      message: 'Weight change request created successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/sessions/:sessionId/weight-changes
 * Get all weight changes for a session
 * Query params: liftType (optional)
 */
router.get('/sessions/:sessionId/weight-changes', async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { liftType } = req.query;

    if (!sessionId) {
      throw new AppError('Session ID is required', 400);
    }

    // Validate lift type if provided
    if (liftType && !['snatch', 'clean_jerk'].includes(liftType)) {
      throw new AppError('Invalid lift type. Must be "snatch" or "clean_jerk"', 400);
    }

    const weightChanges = await weightChangeService.getWeightChanges(sessionId, liftType);

    res.json({
      success: true,
      data: weightChanges,
      count: weightChanges.length
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/athletes/:athleteId/weight-changes
 * Get all weight changes for a specific athlete
 * Query params: liftType (optional)
 */
router.get('/athletes/:athleteId/weight-changes', async (req, res, next) => {
  try {
    const { athleteId } = req.params;
    const { liftType } = req.query;

    if (!athleteId) {
      throw new AppError('Athlete ID is required', 400);
    }

    // Validate lift type if provided
    if (liftType && !['snatch', 'clean_jerk'].includes(liftType)) {
      throw new AppError('Invalid lift type. Must be "snatch" or "clean_jerk"', 400);
    }

    const weightChanges = await weightChangeService.getAthleteWeightChanges(athleteId, liftType);

    res.json({
      success: true,
      data: weightChanges,
      count: weightChanges.length
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/athletes/:athleteId/weight-change-count
 * Get count of weight changes for an athlete
 * Query params: liftType (required)
 */
router.get('/athletes/:athleteId/weight-change-count', async (req, res, next) => {
  try {
    const { athleteId } = req.params;
    const { liftType } = req.query;

    if (!athleteId) {
      throw new AppError('Athlete ID is required', 400);
    }

    if (!liftType || !['snatch', 'clean_jerk'].includes(liftType)) {
      throw new AppError('Valid lift type is required', 400);
    }

    const count = await weightChangeService.getWeightChangeCount(athleteId, liftType);

    res.json({
      success: true,
      data: { count },
      canChangeWeight: count < 2 // IWF allows max 2 changes
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/athletes/:athleteId/current-weight
 * Get current effective weight for an athlete's next attempt
 * Query params: liftType (required)
 */
router.get('/athletes/:athleteId/current-weight', async (req, res, next) => {
  try {
    const { athleteId } = req.params;
    const { liftType } = req.query;

    if (!athleteId) {
      throw new AppError('Athlete ID is required', 400);
    }

    if (!liftType || !['snatch', 'clean_jerk'].includes(liftType)) {
      throw new AppError('Valid lift type is required', 400);
    }

    const currentWeight = await weightChangeService.getCurrentEffectiveWeight(athleteId, liftType);

    res.json({
      success: true,
      data: {
        athleteId,
        liftType,
        currentWeight
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/weight-changes/:id
 * Cancel a weight change request
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new AppError('Weight change ID is required', 400);
    }

    const canceledChange = await weightChangeService.cancelWeightChange(id);

    res.json({
      success: true,
      data: canceledChange,
      message: 'Weight change request canceled successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
