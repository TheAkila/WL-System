import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler.js';
import db from '../services/database.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new AppError('Not authorized to access this route', 401);
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from database
      const { data: user, error } = await db.supabase
        .from('wl_users')
        .select('*')
        .eq('id', decoded.id)
        .single();

      if (error || !user) {
        throw new AppError('User not found', 404);
      }

      if (!user.is_active) {
        throw new AppError('User account is deactivated', 403);
      }

      req.user = user;
      next();
    } catch (err) {
      if (err.name === 'JsonWebTokenError') {
        throw new AppError('Invalid token', 401);
      }
      if (err.name === 'TokenExpiredError') {
        throw new AppError('Token expired', 401);
      }
      throw err;
    }
  } catch (error) {
    next(error);
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Not authenticated', 401));
    }
    
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(`User role '${req.user.role}' is not authorized to access this route`, 403)
      );
    }
    next();
  };
};
