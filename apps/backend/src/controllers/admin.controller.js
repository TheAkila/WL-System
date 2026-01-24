import { supabase } from '../config/supabase.js';
import { AppError } from '../middleware/errorHandler.js';
import bcrypt from 'bcryptjs';

/**
 * Get all users
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, role, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      throw new AppError('Failed to fetch users', 500);
    }

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new user
 */
export const createUser = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      throw new AppError('User with this email already exists', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        email,
        password: hashedPassword,
        role: role || 'technical',
      })
      .select('id, email, role, created_at')
      .single();

    if (error) {
      throw new AppError('Failed to create user', 500);
    }

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user role
 */
export const updateUserRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    // Prevent self role change
    if (userId === req.user.id) {
      throw new AppError('Cannot change your own role', 400);
    }

    const { data: user, error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', userId)
      .select('id, email, role, created_at')
      .single();

    if (error) {
      throw new AppError('Failed to update user role', 500);
    }

    res.status(200).json({
      success: true,
      message: 'User role updated',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user
 */
export const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Prevent self deletion
    if (userId === req.user.id) {
      throw new AppError('Cannot delete your own account', 400);
    }

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) {
      throw new AppError('Failed to delete user', 500);
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Change user password
 */
export const changePassword = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const { error } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('id', userId);

    if (error) {
      throw new AppError('Failed to change password', 500);
    }

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get system statistics
 */
export const getSystemStats = async (req, res, next) => {
  try {
    // Get counts from various tables
    const [usersResult, competitionsResult, athletesResult, sessionsResult] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('competitions').select('id', { count: 'exact', head: true }),
      supabase.from('athletes').select('id', { count: 'exact', head: true }),
      supabase.from('sessions').select('id', { count: 'exact', head: true }),
    ]);

    const stats = {
      users: usersResult.count || 0,
      competitions: competitionsResult.count || 0,
      athletes: athletesResult.count || 0,
      sessions: sessionsResult.count || 0,
      uptime: process.uptime(),
      version: '1.0.0',
    };

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};
