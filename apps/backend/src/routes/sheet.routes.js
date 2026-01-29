import express from 'express';
import { getSessionSheet, updateSheetAttempt } from '../controllers/sheet.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get session sheet data with all athletes and attempts
router.get('/sessions/:sessionId/sheet', getSessionSheet);

// Update attempt in sheet
router.put('/sheet/attempt', protect, authorize('admin', 'technical'), updateSheetAttempt);

export default router;
