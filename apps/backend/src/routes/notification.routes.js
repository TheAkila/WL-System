const express = require('express');
const {
  body, param
} = require('express-validator');
const {
  sendAnnouncement, callAthlete, sendNotification,
} = require('../controllers/notification.controller.js');
const {
  protect, authorize
} = require('../middleware/auth.js');
const {
  validate
} = require('../middleware/validator.js');

const router = express.Router();

// All notification routes require authentication
router.post(
  '/:sessionId/announcement',
  protect,
  authorize('admin', 'technical'),
  [
    param('sessionId').isUUID(),
    body('message').trim().notEmpty(),
    body('type').optional().isIn(['info', 'warning', 'success', 'error']),
  ],
  validate,
  sendAnnouncement
);

router.post(
  '/:sessionId/call-athlete/:athleteId',
  protect,
  authorize('admin', 'technical'),
  [
    param('sessionId').isUUID(),
    param('athleteId').isUUID(),
    body('position').optional().isIn(['current', 'on-deck', 'in-hole']),
  ],
  validate,
  callAthlete
);

router.post(
  '/:sessionId/notify',
  protect,
  authorize('admin', 'technical'),
  [
    param('sessionId').isUUID(),
    body('title').trim().notEmpty(),
    body('message').trim().notEmpty(),
    body('priority').optional().isIn(['low', 'normal', 'high', 'urgent']),
  ],
  validate,
  sendNotification
);

module.exports = router;
