const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../services/database.js');
const { AppError } = require('../middleware/errorHandler.js');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('Please provide email and password', 400);
    }

    // Get user from database
    const { data: user, error } = await db.supabase
      .from('wl_users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      throw new AppError('Invalid credentials', 401);
    }

    if (!user.is_active) {
      throw new AppError('Account is deactivated', 403);
    }

    // Verify password
    let validPassword = false;
    
    if (user.password_hash) {
      // Production: Use bcrypt to verify password hash
      validPassword = await bcrypt.compare(password, user.password_hash);
    } else {
      // Development: Simple password check (TEMPORARY - for demo only!)
      // In production, all users must have password_hash
      validPassword = password === 'password123';
    }

    if (!validPassword) {
      throw new AppError('Invalid credentials', 401);
    }

    // Generate token
    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const { data: user, error } = await db.supabase
      .from('wl_users')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) {
      throw new AppError('User not found', 404);
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { generateToken, login, getMe, logout };
