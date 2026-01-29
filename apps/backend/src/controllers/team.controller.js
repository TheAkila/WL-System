const db = require('../services/database.js');
const { AppError } = require('../middleware/errorHandler.js');

/**
 * Get all teams
 */
const getTeams = async (req, res, next) => {
  try {
    const { country } = req.query;

    let query = db.supabase
      .from('teams')
      .select('*')
      .order('name', { ascending: true });

    if (country) {
      query = query.eq('country', country);
    }

    const { data, error } = await query;

    if (error) throw new AppError(error.message, 400);

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single team
 */
const getTeam = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await db.supabase
      .from('teams')
      .select('*, athletes:athletes(count)')
      .eq('id', id)
      .single();

    if (error) throw new AppError(error.message, 404);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new team
 */
const createTeam = async (req, res, next) => {
  try {
    const { name, country, manager_phone } = req.body;

    if (!name || !country) {
      throw new AppError('Name and country are required', 400);
    }

    const { data, error } = await db.supabase
      .from('teams')
      .insert([{ name, country, manager_phone: manager_phone || null }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new AppError('Team with this name already exists in this country', 400);
      }
      throw new AppError(error.message, 400);
    }

    res.status(201).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update team
 */
const updateTeam = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, country, logo_url, manager_phone } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (country) updates.country = country;
    if (logo_url !== undefined) updates.logo_url = logo_url; // Allow null to clear logo
    if (manager_phone !== undefined) updates.manager_phone = manager_phone || null;

    const { data, error } = await db.supabase
      .from('teams')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete team
 */
const deleteTeam = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await db.supabase
      .from('teams')
      .delete()
      .eq('id', id);

    if (error) throw new AppError(error.message, 400);

    res.status(200).json({
      success: true,
      message: 'Team deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get team standings for a competition
 */
const getTeamStandings = async (req, res, next) => {
  try {
    const { competitionId } = req.params;

    const { data, error } = await db.supabase
      .from('team_standings')
      .select('*')
      .eq('competition_id', competitionId)
      .order('team_total', { ascending: false });

    if (error) throw new AppError(error.message, 400);

    res.status(200).json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    next(error);
  }
};
module.exports = { getTeams,getTeam,createTeam,updateTeam,deleteTeam,getTeamStandings };
