import express from 'express';
import { body, param } from 'express-validator';
import {
  getActiveSessions,
  getLiftingOrder,
  declareAttempt,
  recordRefereeDecision,
  recordQuickDecision,
  getCurrentAttempt,
  getSessionLeaderboard,
  updateSessionStatus,
  changeCurrentLift,
} from '../controllers/technical.controller.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validator.js';

const router = express.Router();

// Public routes (for display screens)
router.get('/sessions/active', getActiveSessions);
router.get('/sessions/:sessionId/lifting-order', getLiftingOrder);
router.get('/sessions/:sessionId/current-attempt', getCurrentAttempt);
router.get('/sessions/:sessionId/leaderboard', getSessionLeaderboard);

// Protected routes (for technical officials)
router.post(
  '/attempts/declare',
  protect,
  authorize('admin', 'technical'),
  [body('athleteId').isUUID(), body('weight').isInt({ min: 1 })],
  validate,
  declareAttempt
);

router.post(
  '/attempts/:attemptId/decision',
  protect,
  authorize('admin', 'technical', 'referee'),
  [
    param('attemptId').isUUID(),
    body('position').isIn(['left', 'center', 'right']),
    body('decision').isIn(['good', 'no-lift']),
  ],
  validate,
  recordRefereeDecision
);

router.post(
  '/attempts/:attemptId/quick-decision',
  protect,
  authorize('admin', 'technical'),
  [param('attemptId').isUUID(), body('decision').isIn(['good', 'no-lift'])],
  validate,
  recordQuickDecision
);

router.put(
  '/sessions/:sessionId/status',
  protect,
  authorize('admin', 'technical'),
  [param('sessionId').isUUID(), body('status').notEmpty()],
  validate,
  updateSessionStatus
);

router.put(
  '/sessions/:sessionId/lift-type',
  protect,
  authorize('admin', 'technical'),
  [param('sessionId').isUUID(), body('liftType').isIn(['snatch', 'clean_and_jerk'])],
  validate,
  changeCurrentLift
);

export default router;
