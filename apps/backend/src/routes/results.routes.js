const express = require('express');
const {
  protect
} = require('../middleware/auth.js');
const {
  processSessionResults, getSessionResults, getCompetitionResults,
} = require('../controllers/results.controller.js');

const router = express.Router();

// Process session results and calculate rankings
router.post('/sessions/:sessionId/process', protect, processSessionResults);

// Get session results
router.get('/sessions/:sessionId', protect, getSessionResults);

// Get competition results (all sessions)
router.get('/competitions/:competitionId', protect, getCompetitionResults);

module.exports = router;
