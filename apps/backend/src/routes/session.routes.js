import express from 'express';
import { body } from 'express-validator';
import {
  getSessions,
  getSession,
  createSession,
  updateSession,
  deleteSession,
  startSession,
  endSession,
  clearSessionAttempts,
} from '../controllers/session.controller.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validator.js';

const router = express.Router();

router.get('/', getSessions);
router.get('/:id', getSession);

router.post(
  '/',
  protect,
  authorize('admin', 'technical'),
  [
    body('competition_id').optional().isUUID(),
    body('name').trim().notEmpty(),
    body('weight_category').notEmpty(),
    body('gender').isIn(['male', 'female']),
  ],
  validate,
  createSession
);

router.put('/:id', protect, authorize('admin', 'technical'), updateSession);
router.delete('/:id', protect, authorize('admin'), deleteSession);

router.post('/:id/start', protect, authorize('admin', 'technical'), startSession);
router.post('/:id/end', protect, authorize('admin', 'technical'), endSession);
router.delete('/:id/attempts/clear', protect, authorize('admin', 'technical'), clearSessionAttempts);

export default router;
