const express = require('express');
const {
  body
} = require('express-validator');
const {
  login, getMe, logout
} = require('../controllers/auth.controller.js');
const {
  protect
} = require('../middleware/auth.js');
const {
  validate
} = require('../middleware/validator.js');

const router = express.Router();

router.post(
  '/login',
  [body('email').isEmail().normalizeEmail(), body('password').notEmpty()],
  validate,
  login
);

router.get('/me', protect, getMe);

router.post('/logout', protect, logout);

module.exports = router;
