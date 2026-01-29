import express from 'express';
import { body } from 'express-validator';
import {
  getAthletes,
  getAthlete,
  createAthlete,
  updateAthlete,
  deleteAthlete,
} from '../controllers/athlete.controller.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validator.js';

const router = express.Router();

router.get('/', getAthletes);
router.get('/session/:sessionId', getAthletes); // Convenience route for session athletes
router.get('/:id', getAthlete);

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('weight_category').notEmpty().withMessage('Weight category is required'),
    body('gender').isIn(['male', 'female']).withMessage('Gender must be male or female'),
    body('session_id').notEmpty().withMessage('Session is required'),
  ],
  validate,
  createAthlete
);

router.put('/:id', protect, authorize('admin', 'technical'), updateAthlete);
router.delete('/:id', protect, authorize('admin'), deleteAthlete);

export default router;
