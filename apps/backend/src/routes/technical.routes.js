const express = require('express');
const {
  body, param
} = require('express-validator');
const {
  getActiveSessions, getSessionSheet, getLiftingOrder, declareAttempt, recordRefereeDecision, recordQuickDecision, recordJuryOverride, getCurrentAttempt, getSessionLeaderboard, updateSessionStatus, changeCurrentLift, updateAthleteMedal, requestWeightChange,
} = require('../controllers/technical.controller.js');
const {
  protect, authorize
} = require('../middleware/auth.js');
const {
  validate
} = require('../middleware/validator.js');

const router = express.Router();

// Public routes (for display screens)
router.get('/sessions/active', getActiveSessions);
router.get('/sessions/:sessionId/sheet', getSessionSheet);
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

// Jury override - IWF Rule 3.3.5
router.post(
  '/attempts/:attemptId/jury-override',
  protect,
  authorize('admin'), // Only admins can override
  [
    param('attemptId').isUUID(),
    body('decision').isIn(['good', 'no-lift']),
    body('reason').notEmpty(),
  ],
  validate,
  recordJuryOverride
);

router.put(
  '/sessions/:sessionId/status',
  protect,
  authorize('admin', 'technical'),
  [
    param('sessionId').isUUID().withMessage('Invalid session ID'),
    body('status')
      .isIn(['scheduled', 'in-progress', 'completed', 'cancelled'])
      .withMessage('Invalid status. Must be scheduled, in-progress, completed, or cancelled')
  ],
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

router.put(
  '/athletes/:athleteId/medal',
  protect,
  authorize('admin', 'technical'),
  [
    param('athleteId').isUUID(),
    body('medal').custom((value) => {
      if (value !== null && !['gold', 'silver', 'bronze'].includes(value)) {
        throw new Error('Medal must be gold, silver, bronze, or null');
      }
      return true;
    })
  ],
  validate,
  updateAthleteMedal
);

// Weight change request (IWF Rule 6.5.1)
router.post(
  '/attempts/weight-change',
  protect,
  authorize('admin', 'technical'),
  [
    body('athleteId').isUUID(),
    body('weight').isInt({ min: 1 }),
    body('liftType').isIn(['snatch', 'clean_and_jerk']),
  ],
  validate,
  requestWeightChange
);

module.exports = router;
