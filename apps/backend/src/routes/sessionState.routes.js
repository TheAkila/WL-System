/**
 * Session State Management Routes
 * Handles all session state transitions and workflow operations
 */

import express from 'express';
import SessionStateMachine from '../services/sessionStateMachine.service.js';

const router = express.Router();

/**
 * GET /api/sessions/:sessionId/state-config
 * Get current session state and button configuration
 */
router.get('/:sessionId/state-config', async (req, res) => {
  try {
    const result = await SessionStateMachine.getSessionStateConfig(
      req.params.sessionId
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/sessions/:sessionId/transitions/weigh-in
 * Start weigh-in process: scheduled → weighing
 */
router.post('/:sessionId/transitions/weigh-in', async (req, res) => {
  try {
    const userId = req.user?.id; // From auth middleware

    const result = await SessionStateMachine.startWeighIn(
      req.params.sessionId,
      userId
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/sessions/:sessionId/transitions/complete-weigh-in
 * Complete weigh-in: weighing → ready_to_start
 */
router.post('/:sessionId/transitions/complete-weigh-in', async (req, res) => {
  try {
    const userId = req.user?.id;

    const result = await SessionStateMachine.completeWeighIn(
      req.params.sessionId,
      userId
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/sessions/:sessionId/transitions/start-competition
 * Start competition: ready_to_start → active
 */
router.post(
  '/:sessionId/transitions/start-competition',
  async (req, res) => {
    try {
      const userId = req.user?.id;

      const result = await SessionStateMachine.startCompetition(
        req.params.sessionId,
        userId
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

/**
 * POST /api/sessions/:sessionId/transitions/start-snatch
 * Start snatch phase: active/snatch_complete → snatch_active
 */
router.post('/:sessionId/transitions/start-snatch', async (req, res) => {
  try {
    const userId = req.user?.id;

    const result = await SessionStateMachine.startSnatchPhase(
      req.params.sessionId,
      userId
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/sessions/:sessionId/transitions/complete-snatch
 * Complete snatch phase: snatch_active → snatch_complete
 */
router.post('/:sessionId/transitions/complete-snatch', async (req, res) => {
  try {
    const userId = req.user?.id;

    const result = await SessionStateMachine.completeSnatchPhase(
      req.params.sessionId,
      userId
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/sessions/:sessionId/transitions/start-clean-jerk
 * Start C&J phase: snatch_complete → clean_jerk_active
 */
router.post(
  '/:sessionId/transitions/start-clean-jerk',
  async (req, res) => {
    try {
      const userId = req.user?.id;

      const result = await SessionStateMachine.startCleanJerkPhase(
        req.params.sessionId,
        userId
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

/**
 * POST /api/sessions/:sessionId/transitions/complete-clean-jerk
 * Complete C&J phase: clean_jerk_active → complete
 */
router.post(
  '/:sessionId/transitions/complete-clean-jerk',
  async (req, res) => {
    try {
      const userId = req.user?.id;

      const result = await SessionStateMachine.completeCleanJerkPhase(
        req.params.sessionId,
        userId
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

/**
 * GET /api/sessions/:sessionId/weigh-in-summary
 * Get weigh-in progress
 */
router.get('/:sessionId/weigh-in-summary', async (req, res) => {
  try {
    const result = await SessionStateMachine.getWeighInSummary(
      req.params.sessionId
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/sessions/:sessionId/weigh-in-athlete
 * Mark athlete as weighed in
 * Body: { athleteId, bodyWeightKg, startWeightKg? }
 */
router.post('/:sessionId/weigh-in-athlete', async (req, res) => {
  try {
    const { athleteId, bodyWeightKg, startWeightKg } = req.body;

    if (!athleteId || bodyWeightKg === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: athleteId, bodyWeightKg',
      });
    }

    const result = await SessionStateMachine.markAthleteWeighedIn(
      athleteId,
      bodyWeightKg,
      startWeightKg
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/sessions/:sessionId/next-lifter?phase=snatch|clean_jerk
 * Get next lifter for current phase
 */
router.get('/:sessionId/next-lifter', async (req, res) => {
  try {
    const { phase } = req.query;

    if (!phase) {
      return res.status(400).json({
        success: false,
        error: 'Missing required query parameter: phase (snatch or clean_jerk)',
      });
    }

    const result = await SessionStateMachine.getNextLifter(
      req.params.sessionId,
      phase
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/sessions/:sessionId/state-history?limit=50
 * Get session state transition history (audit trail)
 */
router.get('/:sessionId/state-history', async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const result = await SessionStateMachine.getSessionStateHistory(
      req.params.sessionId,
      parseInt(limit)
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
