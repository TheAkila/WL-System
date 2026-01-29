const { supabase } = require('../services/database.js');
const { AppError } = require('../middleware/errorHandler.js');

/**
 * UNIFIED COMPETITION SYSTEM
 * This controller manages competitions that are shared between:
 * - WL-System (competition management for officials)
 * - Lifting Social Website (public registration for athletes)
 * 
 * Key features:
 * - Competition creation syncs to website
 * - Entry period controls (registration, preliminary, final)
 * - Registration management from website users
 */

/**
 * Get the current competition (singleton)
 * Returns the active competition, or the most recent one if none is active
 */
const getCurrentCompetition = async (req, res, next) => {
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
const updateCurrentCompetition = async (req, res, next) => {
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
const initializeCompetition = async (req, res, next) => {
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
const deleteCompetition = async (req, res, next) => {
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

// =====================================================
// ENTRY PERIOD CONTROLS
// =====================================================

/**
 * Open/close registration period
 * PUT /api/competitions/:competitionId/registration
 */
const toggleRegistration = async (req, res, next) => {
  try {
    const { competitionId } = req.params;
    const { open, start_date, end_date } = req.body;

    const updateData = {
      registration_open: open,
      updated_at: new Date().toISOString()
    };

    if (start_date) updateData.registration_start = start_date;
    if (end_date) updateData.registration_end = end_date;

    const { data, error } = await supabase
      .from('competitions')
      .update(updateData)
      .eq('id', competitionId)
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);

    // Emit socket event for real-time updates
    req.app.get('io').emit('competition:registration-updated', {
      competitionId,
      registrationOpen: open
    });

    res.status(200).json({
      success: true,
      message: `Registration ${open ? 'opened' : 'closed'} successfully`,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Open/close preliminary entry period
 * PUT /api/competitions/:competitionId/preliminary-entry
 */
const togglePreliminaryEntry = async (req, res, next) => {
  try {
    const { competitionId } = req.params;
    const { open, start_date, end_date } = req.body;

    const updateData = {
      preliminary_entry_open: open,
      updated_at: new Date().toISOString()
    };

    if (start_date) updateData.preliminary_entry_start = start_date;
    if (end_date) updateData.preliminary_entry_end = end_date;

    const { data, error } = await supabase
      .from('competitions')
      .update(updateData)
      .eq('id', competitionId)
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);

    // Emit socket event for real-time updates
    req.app.get('io').emit('competition:preliminary-entry-updated', {
      competitionId,
      preliminaryEntryOpen: open
    });

    res.status(200).json({
      success: true,
      message: `Preliminary entry ${open ? 'opened' : 'closed'} successfully`,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Open/close final entry period
 * PUT /api/competitions/:competitionId/final-entry
 */
const toggleFinalEntry = async (req, res, next) => {
  try {
    const { competitionId } = req.params;
    const { open, start_date, end_date } = req.body;

    const updateData = {
      final_entry_open: open,
      updated_at: new Date().toISOString()
    };

    if (start_date) updateData.final_entry_start = start_date;
    if (end_date) updateData.final_entry_end = end_date;

    const { data, error } = await supabase
      .from('competitions')
      .update(updateData)
      .eq('id', competitionId)
      .select()
      .single();

    if (error) throw new AppError(error.message, 400);

    // Emit socket event for real-time updates
    req.app.get('io').emit('competition:final-entry-updated', {
      competitionId,
      finalEntryOpen: open
    });

    res.status(200).json({
      success: true,
      message: `Final entry ${open ? 'opened' : 'closed'} successfully`,
      data,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// REGISTRATION MANAGEMENT (from Website)
// =====================================================

/**
 * Get all registrations for a competition
 * GET /api/competitions/:competitionId/registrations
 */
const getCompetitionRegistrations = async (req, res, next) => {
  try {
    const { competitionId } = req.params;
    const { status, gender, weight_category } = req.query;

    let query = supabase
      .from('event_registrations')
      .select(`
        *,
        user:website_users (id, name, email, phone, date_of_birth, avatar),
        session:sessions (id, name, session_number)
      `)
      .eq('competition_id', competitionId)
      .order('registered_at', { ascending: true });

    if (status) query = query.eq('status', status);
    if (gender) query = query.eq('gender', gender);
    if (weight_category) query = query.eq('weight_category', weight_category);

    const { data, error } = await query;

    if (error) throw new AppError(error.message, 400);

    res.status(200).json({
      success: true,
      count: data?.length || 0,
      data: data || [],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get registration statistics for a competition
 * GET /api/competitions/:competitionId/registrations/stats
 */
const getRegistrationStats = async (req, res, next) => {
  try {
    const { competitionId } = req.params;

    const { data: registrations, error } = await supabase
      .from('event_registrations')
      .select('status, gender, weight_category, payment_status')
      .eq('competition_id', competitionId);

    if (error) throw new AppError(error.message, 400);

    const stats = {
      total: registrations?.length || 0,
      byStatus: {},
      byGender: { male: 0, female: 0 },
      byCategory: {},
      byPayment: {},
      pendingApproval: 0,
      readyForCompetition: 0
    };

    registrations?.forEach(reg => {
      // By status
      stats.byStatus[reg.status] = (stats.byStatus[reg.status] || 0) + 1;
      
      // By gender
      if (reg.gender === 'male') stats.byGender.male++;
      if (reg.gender === 'female') stats.byGender.female++;
      
      // By weight category
      if (reg.weight_category) {
        stats.byCategory[reg.weight_category] = (stats.byCategory[reg.weight_category] || 0) + 1;
      }
      
      // By payment
      stats.byPayment[reg.payment_status] = (stats.byPayment[reg.payment_status] || 0) + 1;
      
      // Count pending approvals
      if (['preliminary_pending', 'final_pending'].includes(reg.status)) {
        stats.pendingApproval++;
      }
      
      // Count ready for competition
      if (['final_approved', 'confirmed', 'weighed_in'].includes(reg.status)) {
        stats.readyForCompetition++;
      }
    });

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update registration status (approve/reject)
 * PUT /api/competitions/registrations/:registrationId/status
 */
const updateRegistrationStatus = async (req, res, next) => {
  try {
    const { registrationId } = req.params;
    const { status, admin_notes, session_id, lot_number, group_number } = req.body;

    const updateData = {
      status,
      updated_at: new Date().toISOString()
    };

    if (admin_notes) updateData.admin_notes = admin_notes;
    if (session_id) updateData.session_id = session_id;
    if (lot_number) updateData.lot_number = lot_number;
    if (group_number) updateData.group_number = group_number;

    // Set approval timestamps based on status
    if (status === 'preliminary_approved') {
      updateData.preliminary_approved_at = new Date().toISOString();
    } else if (status === 'final_approved') {
      updateData.final_approved_at = new Date().toISOString();
    } else if (status === 'confirmed') {
      updateData.confirmed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('event_registrations')
      .update(updateData)
      .eq('id', registrationId)
      .select(`
        *,
        user:website_users (id, name, email)
      `)
      .single();

    if (error) throw new AppError(error.message, 400);

    res.status(200).json({
      success: true,
      message: `Registration status updated to ${status}`,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve final entry and create athlete
 * POST /api/competitions/registrations/:registrationId/create-athlete
 */
const approveAndCreateAthlete = async (req, res, next) => {
  try {
    const { registrationId } = req.params;
    const { session_id, lot_number, start_number } = req.body;

    // Get registration with user details
    const { data: registration, error: regError } = await supabase
      .from('event_registrations')
      .select(`
        *,
        user:website_users (id, name, email, date_of_birth, phone)
      `)
      .eq('id', registrationId)
      .single();

    if (regError || !registration) {
      throw new AppError('Registration not found', 404);
    }

    // Check if athlete already exists
    if (registration.wl_athlete_id) {
      throw new AppError('Athlete already created for this registration', 400);
    }

    // Find or create team if club name provided
    let team_id = null;
    if (registration.club_name) {
      const { data: existingTeam } = await supabase
        .from('teams')
        .select('id')
        .eq('name', registration.club_name)
        .limit(1)
        .single();

      if (existingTeam) {
        team_id = existingTeam.id;
      } else {
        const countryCode = registration.nationality ? 
          registration.nationality.substring(0, 3).toUpperCase() : 'UNK';
        
        const { data: newTeam, error: teamError } = await supabase
          .from('teams')
          .insert([{ 
            name: registration.club_name, 
            country: countryCode 
          }])
          .select()
          .single();
        
        if (!teamError && newTeam) {
          team_id = newTeam.id;
        }
      }
    }

    // Create athlete
    const athleteData = {
      registration_id: registrationId,
      website_user_id: registration.user_id,
      name: registration.user?.name || 'Unknown',
      country: registration.nationality ? 
        registration.nationality.substring(0, 3).toUpperCase() : 'UNK',
      birth_date: registration.date_of_birth || registration.user?.date_of_birth,
      gender: registration.gender,
      weight_category: registration.confirmed_weight_category || registration.weight_category,
      team_id,
      coach_name: registration.coach_name,
      session_id: session_id || registration.session_id,
      lot_number: lot_number || registration.lot_number,
      start_number: start_number || registration.start_number,
      snatch_opener: registration.snatch_opener,
      cnj_opener: registration.cnj_opener
    };

    const { data: athlete, error: athleteError } = await supabase
      .from('athletes')
      .insert([athleteData])
      .select()
      .single();

    if (athleteError) throw new AppError(athleteError.message, 400);

    // Update registration with athlete ID and status
    await supabase
      .from('event_registrations')
      .update({
        wl_athlete_id: athlete.id,
        status: 'final_approved',
        final_approved_at: new Date().toISOString(),
        session_id: session_id || registration.session_id,
        lot_number: lot_number || registration.lot_number,
        updated_at: new Date().toISOString()
      })
      .eq('id', registrationId);

    // Create opening attempts if openers are set
    if (registration.snatch_opener) {
      await supabase
        .from('attempts')
        .insert([{
          athlete_id: athlete.id,
          session_id: session_id || registration.session_id,
          lift_type: 'snatch',
          attempt_number: 1,
          weight: registration.snatch_opener,
          result: 'pending'
        }]);
    }

    if (registration.cnj_opener) {
      await supabase
        .from('attempts')
        .insert([{
          athlete_id: athlete.id,
          session_id: session_id || registration.session_id,
          lift_type: 'clean_and_jerk',
          attempt_number: 1,
          weight: registration.cnj_opener,
          result: 'pending'
        }]);
    }

    // Log the sync operation
    await supabase
      .from('sync_log')
      .insert([{
        registration_id: registrationId,
        athlete_id: athlete.id,
        competition_id: registration.competition_id,
        action: 'athlete_created',
        from_system: 'wl_system',
        to_system: 'wl_system',
        data: { registration, athlete },
        status: 'success'
      }]);

    // Emit socket event
    req.app.get('io').emit('athlete:created-from-registration', {
      registrationId,
      athleteId: athlete.id,
      athleteName: athlete.name
    });

    res.status(201).json({
      success: true,
      message: 'Athlete created successfully from registration',
      data: {
        athlete,
        registration_updated: true
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Bulk approve registrations
 * POST /api/competitions/:competitionId/registrations/bulk-approve
 */
const bulkApproveRegistrations = async (req, res, next) => {
  try {
    const { competitionId } = req.params;
    const { registration_ids, new_status, create_athletes } = req.body;

    if (!registration_ids || !Array.isArray(registration_ids)) {
      throw new AppError('registration_ids array is required', 400);
    }

    const results = {
      updated: 0,
      athletes_created: 0,
      errors: []
    };

    for (const regId of registration_ids) {
      try {
        // Update status
        const { data, error } = await supabase
          .from('event_registrations')
          .update({
            status: new_status,
            updated_at: new Date().toISOString(),
            ...(new_status === 'preliminary_approved' && { preliminary_approved_at: new Date().toISOString() }),
            ...(new_status === 'final_approved' && { final_approved_at: new Date().toISOString() })
          })
          .eq('id', regId)
          .eq('competition_id', competitionId)
          .select()
          .single();

        if (!error && data) {
          results.updated++;

          // Create athlete if requested and status is final_approved
          if (create_athletes && new_status === 'final_approved') {
            // Use the approveAndCreateAthlete logic
            // This is simplified - in production you'd refactor to share code
            const { data: reg } = await supabase
              .from('event_registrations')
              .select('*, user:website_users(*)')
              .eq('id', regId)
              .single();

            if (reg && !reg.wl_athlete_id) {
              const { data: athlete, error: athError } = await supabase
                .from('athletes')
                .insert([{
                  registration_id: regId,
                  website_user_id: reg.user_id,
                  name: reg.user?.name || 'Unknown',
                  country: reg.nationality?.substring(0, 3).toUpperCase() || 'UNK',
                  gender: reg.gender,
                  weight_category: reg.confirmed_weight_category || reg.weight_category,
                  session_id: reg.session_id,
                  snatch_opener: reg.snatch_opener,
                  cnj_opener: reg.cnj_opener
                }])
                .select()
                .single();

              if (!athError && athlete) {
                await supabase
                  .from('event_registrations')
                  .update({ wl_athlete_id: athlete.id })
                  .eq('id', regId);
                results.athletes_created++;
              }
            }
          }
        }
      } catch (err) {
        results.errors.push({ registration_id: regId, error: err.message });
      }
    }

    res.status(200).json({
      success: true,
      message: `Bulk operation completed`,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Assign lot numbers to approved registrations
 * POST /api/competitions/:competitionId/draw-lots
 */
const drawLotNumbers = async (req, res, next) => {
  try {
    const { competitionId } = req.params;
    const { session_id, shuffle } = req.body;

    let query = supabase
      .from('event_registrations')
      .select('id, weight_category, gender')
      .eq('competition_id', competitionId)
      .in('status', ['final_approved', 'confirmed']);

    if (session_id) {
      query = query.eq('session_id', session_id);
    }

    const { data: registrations, error } = await query;

    if (error) throw new AppError(error.message, 400);
    if (!registrations || registrations.length === 0) {
      throw new AppError('No eligible registrations found', 400);
    }

    // Shuffle if requested (random draw)
    let orderedRegs = [...registrations];
    if (shuffle !== false) {
      orderedRegs = orderedRegs.sort(() => Math.random() - 0.5);
    }

    // Assign lot numbers
    for (let i = 0; i < orderedRegs.length; i++) {
      await supabase
        .from('event_registrations')
        .update({ 
          lot_number: i + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderedRegs[i].id);

      // Also update athlete if exists
      await supabase
        .from('athletes')
        .update({ 
          lot_number: i + 1,
          start_number: i + 1,
          updated_at: new Date().toISOString()
        })
        .eq('registration_id', orderedRegs[i].id);
    }

    // Mark lot draw as completed
    await supabase
      .from('competitions')
      .update({ 
        lot_draw_completed: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', competitionId);

    res.status(200).json({
      success: true,
      message: `Lot numbers assigned to ${orderedRegs.length} athletes`,
      data: {
        count: orderedRegs.length,
        lots: orderedRegs.map((r, i) => ({ id: r.id, lot_number: i + 1 }))
      },
    });
  } catch (error) {
    next(error);
  }
};
module.exports = { getCurrentCompetition,updateCurrentCompetition,initializeCompetition,deleteCompetition,toggleRegistration,togglePreliminaryEntry,toggleFinalEntry,getCompetitionRegistrations,getRegistrationStats,updateRegistrationStatus,approveAndCreateAthlete,bulkApproveRegistrations,drawLotNumbers };
