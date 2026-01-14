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
router.get('/:id', getAthlete);

router.post(
  '/',
  protect,
  authorize('admin', 'technical'),
  [
    body('name').trim().notEmpty(),
    body('country').trim().notEmpty(),
    body('weightCategory').notEmpty(),
    body('gender').isIn(['male', 'female']),
  ],
  validate,
  createAthlete
);

router.put('/:id', protect, authorize('admin', 'technical'), updateAthlete);
router.delete('/:id', protect, authorize('admin'), deleteAthlete);

export default router;
