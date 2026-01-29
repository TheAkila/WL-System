const express = require('express');
const {
  param, body
} = require('express-validator');
const {
  getTimerState, startTimer, pauseTimer, resetTimer, setPreset,
} = require('../controllers/timer.controller.js');
const {
  protect, authorize
} = require('../middleware/auth.js');
const {
  validate
} = require('../middleware/validator.js');

const router = express.Router();

// Get timer state (public for displays)
router.get('/:sessionId', [param('sessionId').isUUID()], validate, getTimerState);

// Protected timer controls (technical officials only)
router.post(
  '/:sessionId/start',
  protect,
  authorize('admin', 'technical'),
  [param('sessionId').isUUID(), body('duration').optional().isInt({ min: 1, max: 300 })],
  validate,
  startTimer
);

router.post(
  '/:sessionId/pause',
  protect,
  authorize('admin', 'technical'),
  [param('sessionId').isUUID()],
  validate,
  pauseTimer
);

router.post(
  '/:sessionId/reset',
  protect,
  authorize('admin', 'technical'),
  [param('sessionId').isUUID(), body('duration').optional().isInt({ min: 1, max: 600 })],
  validate,
  resetTimer
);

router.post(
  '/:sessionId/preset',
  protect,
  authorize('admin', 'technical'),
  [param('sessionId').isUUID(), body('preset').isString().notEmpty()],
  validate,
  setPreset
);

module.exports = router;
