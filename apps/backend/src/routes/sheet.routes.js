const express = require('express');
const {
  getSessionSheet, updateSheetAttempt
} = require('../controllers/sheet.controller.js');
const {
  protect, authorize
} = require('../middleware/auth.js');

const router = express.Router();

// Get session sheet data with all athletes and attempts
router.get('/sessions/:sessionId/sheet', getSessionSheet);

// Update attempt in sheet
router.put('/sheet/attempt', protect, authorize('admin', 'technical'), updateSheetAttempt);

module.exports = router;
