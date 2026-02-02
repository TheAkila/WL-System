import jwt from 'jsonwebtoken';
import db from '../services/database.js';
import { AppError } from '../middleware/errorHandler.js';

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// @desc    Handle Google OAuth callback
// @route   POST /api/auth/google/callback
// @access  Public
export const googleCallback = async (req, res, next) => {
  try {
    const { email, name, picture, googleId } = req.body;

    if (!email || !googleId) {
      throw new AppError('Missing required Google OAuth data', 400);
    }

    // Check if user exists
    let { data: user, error } = await db.supabase
      .from('wl_users')
      .select('*')
      .eq('email', email)
      .single();

    // If user doesn't exist, create new account
    if (!user) {
      const { data: newUser, error: createError } = await db.supabase
        .from('wl_users')
        .insert([
          {
            email,
            name: name || email.split('@')[0],
            avatar: picture,
            google_id: googleId,
            role: 'user',
            is_active: true,
            // For Google auth, we don't need password
          },
        ])
        .select()
        .single();

      if (createError || !newUser) {
        throw new AppError('Failed to create user account', 500);
      }

      user = newUser;
    } else if (!user.google_id) {
      // Update existing user with Google ID and avatar if not already set
      const { data: updatedUser, error: updateError } = await db.supabase
        .from('wl_users')
        .update({
          google_id: googleId,
          avatar: picture || user.avatar,
        })
        .eq('id', user.id)
        .select()
        .single();

      if (!updateError && updatedUser) {
        user = updatedUser;
      }
    }

    if (!user.is_active) {
      throw new AppError('Account is deactivated', 403);
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
          avatar: user.avatar,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate Google OAuth token for frontend
// @route   GET /api/auth/google/token
// @access  Public
export const getGoogleToken = async (req, res, next) => {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      throw new AppError('Google OAuth not configured', 500);
    }

    res.status(200).json({
      success: true,
      data: {
        clientId,
      },
    });
  } catch (error) {
    next(error);
  }
};
