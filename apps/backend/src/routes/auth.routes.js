import express from 'express';
import { body } from 'express-validator';
import { login, getMe, logout } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validator.js';

const router = express.Router();

router.post(
  '/login',
  [body('email').isEmail().normalizeEmail(), body('password').notEmpty()],
  validate,
  login
);

router.get('/me', protect, getMe);

router.post('/logout', protect, logout);

export default router;
