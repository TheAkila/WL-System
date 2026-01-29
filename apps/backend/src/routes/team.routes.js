const express = require('express');
const {
  body, param
} = require('express-validator');
const {
  getTeams, getTeam, createTeam, updateTeam, deleteTeam, getTeamStandings,
} = require('../controllers/team.controller.js');
const {
  protect, authorize
} = require('../middleware/auth.js');
const {
  validate
} = require('../middleware/validator.js');

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

module.exports = router;
