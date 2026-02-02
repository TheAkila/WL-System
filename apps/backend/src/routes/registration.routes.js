import express from 'express';
import { supabase } from '../config/supabase.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get registrations for a competition
router.get('/:competitionId/registrations', protect, async (req, res) => {
  try {
    const { competitionId } = req.params;
    
    const { data: registrations, error } = await supabase
      .from('event_registrations')
      .select(`
        *,
        website_users(name, email, date_of_birth)
      `)
      .eq('competition_id', competitionId)
      .order('registered_at', { ascending: false });
    
    if (error) throw error;
    
    // Get all preliminary athletes for these registrations
    const registrationIds = (registrations || []).map(r => r.id);
    const { data: preliminaryAthletes } = await supabase
      .from('preliminary_entry_athletes')
      .select('*')
      .in('registration_id', registrationIds)
      .order('competitor_number', { ascending: true });
    
    // Group athletes by registration_id
    const athletesByRegistration = {};
    (preliminaryAthletes || []).forEach(athlete => {
      if (!athletesByRegistration[athlete.registration_id]) {
        athletesByRegistration[athlete.registration_id] = [];
      }
      athletesByRegistration[athlete.registration_id].push(athlete);
    });
    
    // Transform data for admin panel
    const transformed = (registrations || []).map(reg => ({
      id: reg.id,
      user_id: reg.user_id,
      competition_id: reg.competition_id,
      is_team_registration: reg.is_team_registration || false,
      parent_registration_id: reg.parent_registration_id,
      athlete_name: reg.athlete_name || reg.website_users?.name || 'Unknown',
      email: reg.website_users?.email || '',
      date_of_birth: reg.website_users?.date_of_birth,
      gender: reg.gender,
      weight_category: reg.weight_category,
      confirmed_weight_category: reg.confirmed_weight_category,
      age_category: reg.age_category,
      status: reg.status,
      entry_total: reg.entry_total,
      best_snatch: reg.best_snatch,
      best_clean_jerk: reg.best_clean_jerk,
      snatch_opener: reg.snatch_opener,
      cnj_opener: reg.cnj_opener,
      club_name: reg.club_name || reg.team_manager_name,
      team_manager_name: reg.team_manager_name,
      team_manager_phone: reg.team_manager_phone,
      team_manager_email: reg.team_manager_email,
      team_size: reg.team_size,
      registered_athletes_count: reg.registered_athletes_count,
      coach_name: reg.coach_name,
      coach_phone: reg.coach_phone,
      coach_email: reg.coach_email,
      session_id: reg.session_id,
      lot_number: reg.lot_number,
      start_number: reg.start_number,
      wl_athlete_id: reg.wl_athlete_id,
      payment_status: reg.payment_status,
      registered_at: reg.registered_at,
      preliminary_submitted_at: reg.preliminary_submitted_at,
      preliminary_approved_at: reg.preliminary_approved_at,
      final_submitted_at: reg.final_submitted_at,
      final_approved_at: reg.final_approved_at,
      preliminary_athletes: athletesByRegistration[reg.id] || []
    }));
    
    res.json({ success: true, data: transformed });
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Get registration statistics
router.get('/:competitionId/registrations/stats', protect, async (req, res) => {
  try {
    const { competitionId } = req.params;
    
    const { data: registrations, error } = await supabase
      .from('event_registrations')
      .select('status, gender, weight_category')
      .eq('competition_id', competitionId);
    
    if (error) throw error;
    
    const stats = {
      total: registrations?.length || 0,
      by_status: {},
      by_gender: { male: 0, female: 0 },
      by_weight_category: {},
    };
    
    (registrations || []).forEach(reg => {
      // By status
      stats.by_status[reg.status] = (stats.by_status[reg.status] || 0) + 1;
      // By gender - only count if gender is not null
      if (reg.gender === 'male' || reg.gender === 'Male' || reg.gender === 'm') {
        stats.by_gender.male = (stats.by_gender.male || 0) + 1;
      } else if (reg.gender === 'female' || reg.gender === 'Female' || reg.gender === 'f') {
        stats.by_gender.female = (stats.by_gender.female || 0) + 1;
      }
      // By weight category - only if gender is not null
      if (reg.gender && reg.weight_category) {
        const key = `${reg.gender}_${reg.weight_category}`;
        stats.by_weight_category[key] = (stats.by_weight_category[key] || 0) + 1;
      }
    });
    
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching registration stats:', error);
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Update registration status
router.put('/:competitionId/registrations/:registrationId', protect, authorize('admin', 'technical'), async (req, res) => {
  try {
    const { registrationId } = req.params;
    const updates = req.body;
    
    const { data, error } = await supabase
      .from('event_registrations')
      .update(updates)
      .eq('id', registrationId)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error updating registration:', error);
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Delete registration (admin only)
router.delete('/:registrationId', protect, authorize('admin'), async (req, res) => {
  try {
    const { registrationId } = req.params;
    
    console.log('🗑️ Delete registration request:', registrationId);
    
    // Check if registration exists
    const { data: registration, error: fetchError } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('id', registrationId)
      .single();
    
    if (fetchError || !registration) {
      console.log('❌ Registration not found:', registrationId);
      return res.status(404).json({ success: false, error: { message: 'Registration not found' } });
    }
    
    console.log('✅ Registration found, deleting...');
    
    // Delete the registration
    const { error: deleteError } = await supabase
      .from('event_registrations')
      .delete()
      .eq('id', registrationId);
    
    if (deleteError) {
      console.error('❌ Error deleting registration:', deleteError);
      return res.status(500).json({ success: false, error: { message: 'Failed to delete registration' } });
    }
    
    console.log('✅ Registration deleted successfully');
    
    // Update competition participant count
    if (registration.competition_id) {
      const { data: competition } = await supabase
        .from('competitions')
        .select('current_participants')
        .eq('id', registration.competition_id)
        .single();
      
      if (competition && competition.current_participants > 0) {
        await supabase
          .from('competitions')
          .update({ current_participants: competition.current_participants - 1 })
          .eq('id', registration.competition_id);
      }
    }
    
    res.json({ success: true, message: 'Registration deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting registration:', error);
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Bulk approve preliminary entries
router.post('/:competitionId/registrations/approve-preliminary', protect, authorize('admin', 'technical'), async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, error: { message: 'No registration IDs provided' } });
    }
    
    const { error } = await supabase
      .from('event_registrations')
      .update({ 
        status: 'preliminary_approved',
        preliminary_approved_at: new Date().toISOString()
      })
      .in('id', ids)
      .eq('status', 'preliminary_pending');
    
    if (error) throw error;
    
    res.json({ success: true, message: `Approved ${ids.length} registrations` });
  } catch (error) {
    console.error('Error approving preliminary entries:', error);
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Bulk approve final entries
router.post('/:competitionId/registrations/approve-final', protect, authorize('admin', 'technical'), async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, error: { message: 'No registration IDs provided' } });
    }
    
    const { error } = await supabase
      .from('event_registrations')
      .update({ 
        status: 'final_approved',
        final_approved_at: new Date().toISOString()
      })
      .in('id', ids)
      .eq('status', 'final_pending');
    
    if (error) throw error;
    
    res.json({ success: true, message: `Approved ${ids.length} final entries` });
  } catch (error) {
    console.error('Error approving final entries:', error);
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Toggle entry periods
router.put('/:competitionId/registration', protect, authorize('admin'), async (req, res) => {
  try {
    const { competitionId } = req.params;
    const { open } = req.body;
    
    const { data, error } = await supabase
      .from('competitions')
      .update({ registration_open: open })
      .eq('id', competitionId)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error updating registration status:', error);
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.put('/:competitionId/preliminary-entry', protect, authorize('admin'), async (req, res) => {
  try {
    const { competitionId } = req.params;
    const { open } = req.body;
    
    const { data, error } = await supabase
      .from('competitions')
      .update({ preliminary_entry_open: open })
      .eq('id', competitionId)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error updating preliminary entry status:', error);
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.put('/:competitionId/final-entry', protect, authorize('admin'), async (req, res) => {
  try {
    const { competitionId } = req.params;
    const { open } = req.body;
    
    const { data, error } = await supabase
      .from('competitions')
      .update({ final_entry_open: open })
      .eq('id', competitionId)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error updating final entry status:', error);
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Create athlete from registration
router.post('/:competitionId/registrations/:registrationId/create-athlete', protect, authorize('admin', 'technical'), async (req, res) => {
  try {
    const { registrationId } = req.params;
    const { session_id } = req.body;
    
    // Get registration
    const { data: reg, error: regError } = await supabase
      .from('event_registrations')
      .select('*, website_users(name, date_of_birth)')
      .eq('id', registrationId)
      .single();
    
    if (regError) throw regError;
    
    // Parse name
    const fullName = reg.website_users?.name || 'Unknown';
    const nameParts = fullName.split(' ');
    const firstName = nameParts[0] || 'Unknown';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    // Create athlete
    const athlete = {
      first_name: firstName,
      last_name: lastName,
      gender: reg.gender,
      body_weight: reg.actual_bodyweight,
      weight_category: reg.confirmed_weight_category || reg.weight_category,
      date_of_birth: reg.website_users?.date_of_birth,
      nationality: reg.nationality,
      club: reg.club_name,
      coach: reg.coach_name,
      competition_id: reg.competition_id,
      session_id: session_id,
      registration_id: registrationId,
      lot_number: reg.lot_number,
      start_number: reg.start_number,
      snatch_first_attempt: reg.snatch_opener,
      cnj_first_attempt: reg.cnj_opener,
      entry_total: reg.entry_total,
      status: 'registered',
    };
    
    const { data: newAthlete, error: athleteError } = await supabase
      .from('athletes')
      .insert(athlete)
      .select()
      .single();
    
    if (athleteError) throw athleteError;
    
    // Update registration with athlete link
    await supabase
      .from('event_registrations')
      .update({ 
        wl_athlete_id: newAthlete.id,
        status: 'confirmed'
      })
      .eq('id', registrationId);
    
    res.json({ success: true, data: newAthlete });
  } catch (error) {
    console.error('Error creating athlete:', error);
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Draw lot numbers
router.post('/:competitionId/registrations/draw-lots', protect, authorize('admin'), async (req, res) => {
  try {
    const { competitionId } = req.params;
    
    // Get all final approved registrations
    const { data: registrations, error: regError } = await supabase
      .from('event_registrations')
      .select('id')
      .eq('competition_id', competitionId)
      .eq('status', 'final_approved');
    
    if (regError) throw regError;
    
    if (!registrations || registrations.length === 0) {
      return res.status(400).json({ success: false, error: { message: 'No approved registrations to draw lots for' } });
    }
    
    // Shuffle and assign lot numbers
    const shuffled = registrations.sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < shuffled.length; i++) {
      await supabase
        .from('event_registrations')
        .update({ lot_number: i + 1 })
        .eq('id', shuffled[i].id);
    }
    
    res.json({ success: true, message: `Assigned lot numbers to ${shuffled.length} registrations` });
  } catch (error) {
    console.error('Error drawing lots:', error);
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

export default router;
