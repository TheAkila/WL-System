import express from 'express';
import { body } from 'express-validator';
import {
  getAttempts,
  createAttempt,
  updateAttempt,
  validateAttempt,
} from '../controllers/attempt.controller.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validator.js';

const router = express.Router();

router.get('/', getAttempts);

router.post(
  '/',
  protect,
  authorize('admin', 'technical'),
  [
    body('athlete_id').notEmpty(),
    body('session_id').notEmpty(),
    body('lift_type').isIn(['snatch', 'clean_and_jerk']),
    body('weight').isFloat({ min: 0 }),
    body('attempt_number').isInt({ min: 1, max: 3 }),
  ],
  validate,
  createAttempt
);

router.put(
  '/:id',
  protect,
  authorize('admin', 'technical', 'referee'),
  updateAttempt
);

router.post(
  '/:id/validate',
  protect,
  authorize('admin', 'technical', 'referee'),
  [body('result').isIn(['good', 'no-lift'])],
  validate,
  validateAttempt
);

export default router;
