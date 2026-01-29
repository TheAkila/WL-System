const express = require('express');
const {
  param
} = require('express-validator');
const {
  exportProtocolPDF, exportLeaderboardCSV, exportStartListCSV, exportCompetitionPDF,
} = require('../controllers/export.controller.js');
const {
  protect, authorize
} = require('../middleware/auth.js');
const {
  validate
} = require('../middleware/validator.js');

const router = express.Router();

// Session exports
router.get(
  '/sessions/:sessionId/protocol.pdf',
  protect,
  authorize('admin', 'technical'),
  [param('sessionId').isUUID()],
  validate,
  exportProtocolPDF
);

router.get(
  '/sessions/:sessionId/leaderboard.csv',
  protect,
  authorize('admin', 'technical'),
  [param('sessionId').isUUID()],
  validate,
  exportLeaderboardCSV
);

router.get(
  '/sessions/:sessionId/startlist.csv',
  protect,
  authorize('admin', 'technical'),
  [param('sessionId').isUUID()],
  validate,
  exportStartListCSV
);

// Competition exports
router.get(
  '/competitions/:competitionId/results.pdf',
  protect,
  authorize('admin'),
  [param('competitionId').isUUID()],
  validate,
  exportCompetitionPDF
);

module.exports = router;
