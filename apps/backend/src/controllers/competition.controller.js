import { supabase } from '../services/database.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * SINGLE COMPETITION SYSTEM
 * The system manages only ONE competition at a time.
 * This controller provides endpoints to get and update the current competition.
 */

/**
 * Get the current competition (singleton)
 * Returns the active competition, or the most recent one if none is active
 */
export const getCurrentCompetition = async (req, res, next) => {
  try {
    // First try to get active competition
    let { data, error } = await supabase
      .from('competitions')
      .select('*')
      .eq('status', 'active')
      .single();

    // If no active competition, get the most recent one
    if (error || !data) {
      const result = await supabase
        .from('competitions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      data = result.data;
      error = result.error;
    }

    res.status(200).json({
      success: true,
      data: data || null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update the current competition
 * If no competition exists, creates one. Otherwise updates the existing one.
 */
export const updateCurrentCompetition = async (req, res, next) => {
  try {
    // Get current competition
    const { data: existing } = await supabase
      .from('competitions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    let data, error;

    if (existing) {
      // Update existing competition
      const result = await supabase
        .from('competitions')
        .update(req.body)
        .eq('id', existing.id)
        .select();
      
      data = result.data;
      error = result.error;
    } else {
      // Create new competition if none exists
      const result = await supabase
        .from('competitions')
        .insert([{ ...req.body, status: 'active' }])
        .select();
      
      data = result.data;
      error = result.error;
    }

    if (error) throw new AppError(error.message, 400);

    // Emit socket event
    req.app.get('io').emit('competition:updated', data[0]);

    res.status(200).json({
      success: true,
      data: data[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Initialize competition - creates the first competition if none exists
 * If a competition already exists, this endpoint will fail and user must delete first
 */
export const initializeCompetition = async (req, res, next) => {
  try {
    // Check if any competition exists
    const { data: existing, error: selectError } = await supabase
      .from('competitions')
      .select('id')
      .limit(1)
      .single();

    // If we got data (existing = not null), a competition exists
    if (existing) {
      throw new AppError(
        'A competition already exists. Please delete the existing competition first or use the update endpoint to modify it.',
        409
      );
    }

    // Create initial competition
    const { data, error } = await supabase
      .from('competitions')
      .insert([{ ...req.body, status: 'active' }])
      .select();

    if (error) throw new AppError(error.message, 400);

    res.status(201).json({
      success: true,
      data: data[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a competition and all associated data
 * (sessions, athletes, attempts, etc.)
 */
export const deleteCompetition = async (req, res, next) => {
  try {
    const { competitionId } = req.params;

    if (!competitionId) {
      throw new AppError('Competition ID is required', 400);
    }

    // Delete the competition (cascading deletes will handle related records)
    const { error } = await supabase
      .from('competitions')
      .delete()
      .eq('id', competitionId);

    if (error) throw new AppError(error.message, 400);

    res.status(200).json({
      success: true,
      message: 'Competition deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
