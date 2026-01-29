import express from 'express';
import { body, param } from 'express-validator';
import {
  getCurrentCompetition,
  updateCurrentCompetition,
  initializeCompetition,
  deleteCompetition,
} from '../controllers/competition.controller.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validator.js';

const router = express.Router();

/**
 * SINGLE COMPETITION ROUTES
 * The system manages only one competition at a time
 */

// Get current competition (public)
router.get('/current', getCurrentCompetition);

// Update current competition (admin/technical only)
router.put(
  '/current',
  protect,
  authorize('admin', 'technical'),
  [
    body('name').optional().trim().notEmpty(),
    body('date').optional().isISO8601(),
    body('location').optional().trim().notEmpty(),
  ],
  validate,
  updateCurrentCompetition
);

// Initialize competition (admin only - one-time setup)
router.post(
  '/initialize',
  protect,
  authorize('admin'),
  [
    body('name').trim().notEmpty(),
    body('date').isISO8601(),
    body('location').trim().notEmpty(),
  ],
  validate,
  initializeCompetition
);

// Delete competition (admin only - deletes all associated data)
router.delete(
  '/:competitionId',
  protect,
  authorize('admin'),
  [param('competitionId').isUUID()],
  validate,
  deleteCompetition
);

export default router;
