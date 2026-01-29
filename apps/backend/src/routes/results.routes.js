import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  processSessionResults,
  getSessionResults,
  getCompetitionResults,
} from '../controllers/results.controller.js';

const router = express.Router();

// Process session results and calculate rankings
router.post('/sessions/:sessionId/process', protect, processSessionResults);

// Get session results
router.get('/sessions/:sessionId', protect, getSessionResults);

// Get competition results (all sessions)
router.get('/competitions/:competitionId', protect, getCompetitionResults);

export default router;
