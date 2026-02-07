import express from 'express';
import multer from 'multer';
import { param } from 'express-validator';
import {
  uploadAthletePhoto,
  uploadCompetitionLogo,
  uploadTeamLogo,
  deleteAthletePhoto,
  uploadGenericFile,
  uploadCompetitionImage,
  deleteCompetitionImage,
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

// Generic file upload route - for uploading files during entity creation
router.post(
  '/',
  protect,
  authorize('admin'),
  upload.single('file'),
  uploadGenericFile
);

// Competition image upload route
router.post(
  '/competitions/upload-image',
  protect,
  authorize('admin'),
  upload.single('logo'),
  uploadCompetitionImage
);

// Competition image delete route
router.delete(
  '/competitions/delete-image',
  protect,
  authorize('admin'),
  deleteCompetitionImage
);

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
