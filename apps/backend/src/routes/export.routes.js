import express from 'express';
import { param } from 'express-validator';
import {
  exportProtocolPDF,
  exportLeaderboardCSV,
  exportStartListCSV,
  exportCompetitionPDF,
} from '../controllers/export.controller.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validator.js';

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

export default router;
