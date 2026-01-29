const express = require('express');
const {
  body
} = require('express-validator');
const {
  getAthletes, getAthlete, createAthlete, updateAthlete, deleteAthlete,
} = require('../controllers/athlete.controller.js');
const {
  protect, authorize
} = require('../middleware/auth.js');
const {
  validate
} = require('../middleware/validator.js');

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

module.exports = router;
