import express from 'express';
import multer from 'multer';
import { param } from 'express-validator';
import {
  uploadAthletePhoto,
  uploadCompetitionLogo,
  uploadTeamLogo,
  deleteAthletePhoto,
} from '../controllers/upload.controller.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validator.js';

const router = express.Router();

// Configure multer for memory storage with extended timeout
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// Athlete photo routes
router.post(
  '/athletes/:athleteId/photo',
  protect,
  authorize('admin'),
  upload.single('photo'),
  [param('athleteId').isUUID()],
  validate,
  uploadAthletePhoto
);

router.delete(
  '/athletes/:athleteId/photo',
  protect,
  authorize('admin'),
  [param('athleteId').isUUID()],
  validate,
  deleteAthletePhoto
);

// Competition logo routes
router.post(
  '/competitions/:competitionId/logo',
  protect,
  authorize('admin'),
  upload.single('logo'),
  [param('competitionId').isUUID()],
  validate,
  uploadCompetitionLogo
);

// Team logo routes
router.post(
  '/teams/:teamId/logo',
  protect,
  authorize('admin'),
  upload.single('logo'),
  [param('teamId').isUUID()],
  validate,
  uploadTeamLogo
);

export default router;
