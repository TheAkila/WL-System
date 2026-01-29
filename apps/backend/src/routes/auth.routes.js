import express from 'express';
import { body } from 'express-validator';
import { login, signup, getMe, logout } from '../controllers/auth.controller.js';
import { googleCallback, getGoogleToken } from '../controllers/google.controller.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validator.js';

const router = express.Router();

router.post(
  '/login',
  [body('email').isEmail().normalizeEmail(), body('password').notEmpty()],
  validate,
  login
);

router.post(
  '/signup',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('name').trim().notEmpty(),
  ],
  validate,
  signup
);

// Google OAuth
router.post(
  '/google/callback',
  [
    body('email').isEmail().normalizeEmail(),
    body('googleId').notEmpty(),
  ],
  validate,
  googleCallback
);

router.get('/google/token', getGoogleToken);

router.get('/me', protect, getMe);

router.post('/logout', protect, logout);

export default router;
