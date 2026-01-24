import express from 'express';
import { body, param } from 'express-validator';
import {
  sendAnnouncement,
  callAthlete,
  sendNotification,
} from '../controllers/notification.controller.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validator.js';

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

export default router;
