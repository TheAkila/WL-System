import express from 'express';
import { body } from 'express-validator';
import {
  getCompetitions,
  getCompetition,
  createCompetition,
  updateCompetition,
  deleteCompetition,
  getActiveCompetition,
} from '../controllers/competition.controller.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validator.js';

const router = express.Router();

router.get('/', getCompetitions);
router.get('/active', getActiveCompetition);
router.get('/:id', getCompetition);

router.post(
  '/',
  protect,
  authorize('admin', 'technical'),
  [
    body('name').trim().notEmpty(),
    body('date').isISO8601(),
    body('location').trim().notEmpty(),
  ],
  validate,
  createCompetition
);

router.put('/:id', protect, authorize('admin', 'technical'), updateCompetition);
router.delete('/:id', protect, authorize('admin'), deleteCompetition);

export default router;
