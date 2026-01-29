const express = require('express');
const {
  body, param
} = require('express-validator');
const {
  getAllUsers, createUser, updateUserRole, deleteUser, changePassword, getSystemStats,
} = require('../controllers/admin.controller.js');
const {
  protect, authorize
} = require('../middleware/auth.js');
const {
  validate
} = require('../middleware/validator.js');

const router = express.Router();

// All admin routes require admin role
router.use(protect);
router.use(authorize('admin'));

// User management
router.get('/users', getAllUsers);

router.post(
  '/users',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('role').isIn(['admin', 'technical', 'viewer']),
  ],
  validate,
  createUser
);

router.put(
  '/users/:userId/role',
  [
    param('userId').isUUID(),
    body('role').isIn(['admin', 'technical', 'viewer']),
  ],
  validate,
  updateUserRole
);

router.put(
  '/users/:userId/password',
  [
    param('userId').isUUID(),
    body('newPassword').isLength({ min: 6 }),
  ],
  validate,
  changePassword
);

router.delete(
  '/users/:userId',
  [param('userId').isUUID()],
  validate,
  deleteUser
);

// System stats
router.get('/stats', getSystemStats);

module.exports = router;
