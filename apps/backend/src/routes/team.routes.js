import express from 'express';
import { body, param } from 'express-validator';
import {
  getTeams,
  getTeam,
  createTeam,
  updateTeam,
  deleteTeam,
  getTeamStandings,
} from '../controllers/team.controller.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validator.js';

const router = express.Router();

// Public routes
router.get('/', getTeams);
router.get('/:id', [param('id').isUUID()], validate, getTeam);
router.get('/standings/:competitionId', [param('competitionId').isUUID()], validate, getTeamStandings);

// Protected routes (admin/technical only)
router.post(
  '/',
  protect,
  authorize('admin', 'technical'),
  [
    body('name').trim().notEmpty().withMessage('Team name is required'),
    body('country').trim().isLength({ min: 3, max: 3 }).withMessage('Country code must be 3 characters (ISO 3166-1 alpha-3)'),
  ],
  validate,
  createTeam
);

router.put(
  '/:id',
  protect,
  authorize('admin', 'technical'),
  [param('id').isUUID()],
  validate,
  updateTeam
);

router.delete(
  '/:id',
  protect,
  authorize('admin'),
  [param('id').isUUID()],
  validate,
  deleteTeam
);

export default router;
