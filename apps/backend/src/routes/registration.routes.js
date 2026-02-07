import express from 'express';
import { supabase } from '../config/supabase.js';
import { protect, authorize } from '../middleware/auth.js';
import { sendEmail } from '../services/email.js';

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
    console.log(`Fetching preliminary athletes for ${registrationIds.length} registrations`);
    
    const { data: preliminaryAthletes, error: athletesError } = await supabase
      .from('preliminary_entry_athletes')
      .select('*')
      .in('registration_id', registrationIds)
      .order('competitor_number', { ascending: true });
    
    if (athletesError) {
      console.error('Error fetching preliminary athletes:', athletesError);
    } else {
      console.log(`✅ Found ${preliminaryAthletes?.length || 0} preliminary athletes`);
    }
    
    // Group athletes by registration_id
    const athletesByRegistration = {};
    (preliminaryAthletes || []).forEach(athlete => {
      if (!athletesByRegistration[athlete.registration_id]) {
        athletesByRegistration[athlete.registration_id] = [];
      }
      athletesByRegistration[athlete.registration_id].push(athlete);
    });
    
    console.log('Athletes grouped by registration:', Object.keys(athletesByRegistration).length, 'registrations have athletes');
    
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
    
    console.log(`📊 Returning ${transformed.length} registrations`);
    console.log('Status breakdown:', transformed.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {}));
    
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
    const { registrationId, competitionId } = req.params;
    const updates = req.body;
    
    console.log('📝 Updating registration status:', {
      registrationId,
      competitionId,
      newStatus: updates.status,
      timestamp: new Date().toISOString()
    });
    
    // Fetch current registration before update
    const { data: currentReg, error: fetchError } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('id', registrationId)
      .single();
    
    if (fetchError || !currentReg) {
      console.error('❌ Registration not found:', registrationId, fetchError);
      return res.status(404).json({ success: false, error: { message: 'Registration not found' } });
    }
    
    console.log('✅ Registration found:', {
      id: currentReg.id,
      currentStatus: currentReg.status,
      newStatus: updates.status,
      userId: currentReg.user_id,
      competitionId: currentReg.competition_id
    });
    
    // Handle decline operations differently - clear data and reset status
    let data;
    if (updates.status === 'preliminary_declined') {
      // Clear preliminary data and reset to registered
      const { data: updatedData, error: updateError } = await supabase
        .from('event_registrations')
        .update({
          status: 'registered',
          entry_total: null,
          best_snatch: null,
          best_clean_jerk: null,
          preliminary_submitted_at: null,
          preliminary_approved_at: null
        })
        .eq('id', registrationId)
        .select()
        .single();
      
      if (updateError) throw updateError;
      data = updatedData;
      
      // Delete preliminary athletes
      await supabase
        .from('preliminary_entry_athletes')
        .delete()
        .eq('registration_id', registrationId);
        
      console.log('✅ Preliminary entry cleared, status reset to registered');
    } else if (updates.status === 'final_declined') {
      // Clear final data and reset to preliminary_approved
      const { data: updatedData, error: updateError } = await supabase
        .from('event_registrations')
        .update({
          status: 'preliminary_approved',
          snatch_opener: null,
          cnj_opener: null,
          final_submitted_at: null,
          final_approved_at: null
        })
        .eq('id', registrationId)
        .select()
        .single();
      
      if (updateError) throw updateError;
      data = updatedData;
      console.log('✅ Final entry cleared, status reset to preliminary_approved');
    } else {
      // Normal status update
      const { data: updatedData, error: updateError } = await supabase
        .from('event_registrations')
        .update(updates)
        .eq('id', registrationId)
        .select()
        .single();
      
      if (updateError) throw updateError;
      data = updatedData;
    }
    
    console.log('✅ Registration status updated successfully:', {
      id: data.id,
      status: data.status,
      timestamp: new Date().toISOString()
    });
    
    // Send email notifications - fetch user and competition data separately
    if (currentReg.user_id && currentReg.competition_id) {
      try {
        // Fetch user data
        const { data: user } = await supabase
          .from('website_users')
          .select('id, email, name')
          .eq('id', currentReg.user_id)
          .single();
        
        // Fetch competition data
        const { data: competition } = await supabase
          .from('competitions')
          .select('id, name, date, location, preliminary_entry_open, preliminary_entry_start, final_entry_open, final_entry_start')
          .eq('id', currentReg.competition_id)
          .single();
        
        if (user?.email && competition) {
          const userEmail = user.email;
          const athleteName = user.name || currentReg.athlete_name || 'Athlete';
          const competitionName = competition.name;
          const competitionDate = new Date(competition.date).toLocaleDateString('en-US', { 
            weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' 
          });
          
          // Dynamically import email service
          const { default: sendCompetitionEmail } = await import('../services/competitionEmailService.js');
          
          console.log('📧 Checking email notification conditions...');
          console.log('Current status:', currentReg.status, '→ New status:', updates.status);
          
          // Registration approved
          if (updates.status === 'registered' && currentReg.status === 'pending') {
            console.log('📧 Sending registration approval email...');
            const preliminaryStartDate = competition.preliminary_entry_start 
              ? new Date(competition.preliminary_entry_start).toLocaleDateString('en-US', { 
                  month: 'long', day: 'numeric', year: 'numeric' 
                })
              : undefined;
              
            await sendCompetitionEmail.sendRegistrationApproval({
              userEmail,
              athleteName,
              competitionName,
              competitionDate,
              preliminaryEntryOpen: competition.preliminary_entry_open || false,
              preliminaryStartDate
            });
            console.log('✅ Registration approval email sent to:', userEmail);
          }
          
          // Preliminary entry approved
          else if (updates.status === 'preliminary_approved' && currentReg.status === 'preliminary_pending') {
            console.log('📧 Sending preliminary approval email...');
            const finalStartDate = competition.final_entry_start 
              ? new Date(competition.final_entry_start).toLocaleDateString('en-US', { 
                  month: 'long', day: 'numeric', year: 'numeric' 
                })
              : undefined;
              
            await sendCompetitionEmail.sendPreliminaryApproval({
              userEmail,
              athleteName,
              competitionName,
              entryTotal: data.entry_total || currentReg.entry_total || 0,
              finalEntryOpen: competition.final_entry_open || false,
              finalStartDate
            });
            console.log('✅ Preliminary approval email sent to:', userEmail);
          }
          
          // Preliminary declined - send email (data already cleared above)
          else if (updates.status === 'preliminary_declined') {
            console.log('📧 Sending preliminary declined email...');
            await sendCompetitionEmail.sendEntryDeclined({
              userEmail,
              athleteName,
              competitionName,
              entryType: 'preliminary',
              reason: updates.admin_notes,
              canResubmit: true
            });
            console.log('✅ Preliminary declined email sent to:', userEmail);
          }
          
          // Final entry approved
          else if (updates.status === 'final_approved' && currentReg.status === 'final_pending') {
            console.log('📧 Sending final entry approval email...');
            await sendCompetitionEmail.sendFinalEntryApproval({
              userEmail,
              athleteName,
              competitionName,
              competitionDate
            });
            console.log('✅ Final entry approval email sent to:', userEmail);
          }
          
          // Final declined - send email (data already cleared above)
          else if (updates.status === 'final_declined') {
            console.log('📧 Sending final declined email...');
            await sendCompetitionEmail.sendEntryDeclined({
              userEmail,
              athleteName,
              competitionName,
              entryType: 'final',
              reason: updates.admin_notes,
              canResubmit: true
            });
            console.log('✅ Final declined email sent to:', userEmail);
          }
        }
      } catch (emailError) {
        console.error('❌ Failed to send email notification:', emailError);
        // Don't fail the status update if email fails
      }
    }
    
    res.json({ success: true, data });
  } catch (error) {
    console.error('❌ Error updating registration:', error);
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

    // Send emails to all approved registrations (registered, preliminary_pending, or preliminary_approved)
    try {
      console.log(`Fetching registrations for competition ${competitionId} with eligible statuses`);
      const { data: approvedRegistrations, error: fetchError } = await supabase
        .from('event_registrations')
        .select('*, website_users(name, email)')
        .eq('competition_id', competitionId)
        .in('status', ['registered', 'preliminary_pending', 'preliminary_approved']);

      if (fetchError) {
        console.error('Error fetching registrations:', fetchError);
      } else {
        console.log(`Found ${approvedRegistrations?.length || 0} registrations with statuses: ${approvedRegistrations?.map(r => r.status).join(', ')}`);
      }

      if (approvedRegistrations && approvedRegistrations.length > 0) {
        console.log(`Sending ${open ? 'opened' : 'closed'} emails to ${approvedRegistrations.length} users`);
        const emailPromises = approvedRegistrations.map(reg => {
          const html = open 
            ? getPreliminaryOpenedEmail({
                athleteName: reg.website_users?.name || 'Athlete',
                competitionName: data.name,
                dashboardUrl: `${process.env.FRONTEND_URL || 'https://www.theliftingsocial.com'}/dashboard`
              })
            : getPreliminaryClosedEmail({
                athleteName: reg.website_users?.name || 'Athlete',
                competitionName: data.name,
                dashboardUrl: `${process.env.FRONTEND_URL || 'https://www.theliftingsocial.com'}/dashboard`
              });

          return sendEmail({
            to: reg.website_users?.email,
            subject: open 
              ? `❗️Preliminary Entry Period is OPEN - ${data.name}`
              : `❗️Preliminary Entry Period is CLOSED - ${data.name}`,
            html
          });
        });

        await Promise.all(emailPromises);
        console.log(`✅ Sent preliminary entry ${open ? 'opened' : 'closed'} emails to ${emailPromises.length} users`);
      } else {
        console.log('⚠️ No registrations found to email');
      }
    } catch (emailError) {
      console.error('❌ Error sending emails:', emailError);
      // Don't fail the API call if email sending fails
    }
    
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

    // Send emails to all preliminary approved registrations
    try {
      console.log(`Fetching registrations for competition ${competitionId} with status 'preliminary_approved'`);
      const { data: preliminaryApprovedRegistrations, error: fetchError } = await supabase
        .from('event_registrations')
        .select('*, website_users(name, email)')
        .eq('competition_id', competitionId)
        .eq('status', 'preliminary_approved');

      if (fetchError) {
        console.error('Error fetching registrations:', fetchError);
      } else {
        console.log(`Found ${preliminaryApprovedRegistrations?.length || 0} registrations`);
      }

      if (preliminaryApprovedRegistrations && preliminaryApprovedRegistrations.length > 0) {
        console.log(`Sending ${open ? 'opened' : 'closed'} emails to ${preliminaryApprovedRegistrations.length} users`);
        const emailPromises = preliminaryApprovedRegistrations.map(reg => {
          const html = open 
            ? getFinalOpenedEmail({
                athleteName: reg.website_users?.name || 'Athlete',
                competitionName: data.name,
                dashboardUrl: `${process.env.FRONTEND_URL || 'https://www.theliftingsocial.com'}/dashboard`
              })
            : getFinalClosedEmail({
                athleteName: reg.website_users?.name || 'Athlete',
                competitionName: data.name,
                dashboardUrl: `${process.env.FRONTEND_URL || 'https://www.theliftingsocial.com'}/dashboard`
              });

          return sendEmail({
            to: reg.website_users?.email,
            subject: open 
              ? `❗️ Final Entry Period is OPEN - ${data.name}`
              : `❗️Final Entry Period is CLOSED - ${data.name}`,
            html
          });
        });

        await Promise.all(emailPromises);
        console.log(`✅ Sent final entry ${open ? 'opened' : 'closed'} emails to ${emailPromises.length} users`);
      } else {
        console.log('⚠️ No registrations found to email');
      }
    } catch (emailError) {
      console.error('❌ Error sending emails:', emailError);
      // Don't fail the API call if email sending fails
    }
    
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

// ==================== EMAIL TEMPLATES ====================

function getPreliminaryOpenedEmail(data) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px;">
              <tr>
                <td style="padding: 0 30px 30px; text-align: center;">
                  <h2 style="margin: 0 0 10px; color: #000000; font-size: 24px;">Preliminary Entry is NOW OPEN!</h2>
                  <p style="margin: 0; color: #6b7280; font-size: 16px;">${data.competitionName}</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 0 30px 30px;">
                  <p style="margin: 0 0 15px; color: #374151; font-size: 16px;">Hello ${data.athleteName},</p>
                  <p style="margin: 0 0 15px; color: #374151; font-size: 16px;">The preliminary entry period for <strong>${data.competitionName}</strong> is now open!</p>

                </td>
              </tr>
              <tr>
                <td style="padding: 0 30px 30px; text-align: center;">
                  <a href="${data.dashboardUrl}" style="display: inline-block; padding: 15px 40px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Submit Preliminary Entry</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 30px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0; color: #6b7280; font-size: 14px;">Lifting Social - Empowering Athletes</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

function getPreliminaryClosedEmail(data) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px;">
              <tr>
                <td style="padding: 0 30px 30px; text-align: center;">
                  <h2 style="margin: 0 0 10px; color: #000000; font-size: 24px;">Preliminary Entry Period Closed</h2>
                  <p style="margin: 0; color: #6b7280; font-size: 16px;">${data.competitionName}</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 0 30px 30px;">
                  <p style="margin: 0 0 15px; color: #374151; font-size: 16px;">Hello ${data.athleteName},</p>
                  <p style="margin: 0 0 15px; color: #374151; font-size: 16px;">The preliminary entry period for <strong>${data.competitionName}</strong> has now closed.</p>
                  <p style="margin: 0 0 15px; color: #374151; font-size: 16px;">Wait for preliminary approval before proceeding to final entry.</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 0 30px 30px; text-align: center;">
                  <a href="${data.dashboardUrl}" style="display: inline-block; padding: 15px 40px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">View Dashboard</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 30px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0; color: #6b7280; font-size: 14px;">Lifting Social</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

function getFinalOpenedEmail(data) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px;">
              <tr>
                <td style="padding: 0 30px 30px; text-align: center;">
                  <h2 style="margin: 0 0 10px; color: #000000; font-size: 24px;">Final Entry is NOW OPEN!</h2>
                  <p style="margin: 0; color: #6b7280; font-size: 16px;">${data.competitionName}</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 0 30px 30px;">
                  <p style="margin: 0 0 15px; color: #374151; font-size: 16px;">Hello ${data.athleteName},</p>
                  <p style="margin: 0 0 15px; color: #374151; font-size: 16px;">The final entry period for <strong>${data.competitionName}</strong> is now open!</p>

                </td>
              </tr>
              <tr>
                <td style="padding: 0 30px 30px; text-align: center;">
                  <a href="${data.dashboardUrl}" style="display: inline-block; padding: 15px 40px; background-color: #8b5cf6; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Submit Final Entry</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 30px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0; color: #6b7280; font-size: 14px;">Lifting Social</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

function getFinalClosedEmail(data) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px;">
              <tr>
                <td style="padding: 0 30px 30px; text-align: center;">
                  <h2 style="margin: 0 0 10px; color: #000000; font-size: 24px;">Final Entry Period Closed</h2>
                  <p style="margin: 0; color: #6b7280; font-size: 16px;">${data.competitionName}</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 0 30px 30px;">
                  <p style="margin: 0 0 15px; color: #374151; font-size: 16px;">Hello ${data.athleteName},</p>
                  <p style="margin: 0 0 15px; color: #374151; font-size: 16px;">The final entry period for <strong>${data.competitionName}</strong> has now closed.</p>
                  <p style="margin: 0 0 15px; color: #374151; font-size: 16px;">Your entries are locked in. Get ready for competition day!</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 0 30px 30px; text-align: center;">
                  <a href="${data.dashboardUrl}" style="display: inline-block; padding: 15px 40px; background-color: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">View Dashboard</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 30px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0; color: #6b7280; font-size: 14px;">Lifting Social</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

// Update preliminary athletes for a registration
router.put('/:competitionId/registrations/:registrationId/preliminary-athletes', protect, authorize('admin'), async (req, res) => {
  console.log('🎯 Preliminary athletes endpoint HIT!');
  console.log('Competition ID:', req.params.competitionId);
  console.log('Registration ID:', req.params.registrationId);
  console.log('Body:', req.body);
  
  try {
    const { registrationId } = req.params;
    const { athletes } = req.body;

    console.log('📝 Updating preliminary athletes for registration:', registrationId);
    console.log('Athletes data:', JSON.stringify(athletes, null, 2));

    // Delete existing preliminary athletes for this registration
    const { error: deleteError } = await supabase
      .from('preliminary_entry_athletes')
      .delete()
      .eq('registration_id', registrationId);

    if (deleteError) {
      console.error('Error deleting existing athletes:', deleteError);
      throw deleteError;
    }

    console.log('✅ Deleted existing athletes');

    // Insert new athletes
    if (athletes && athletes.length > 0) {
      const athletesToInsert = athletes.map(athlete => ({
        registration_id: registrationId,
        competitor_number: athlete.competitor_number ? parseInt(athlete.competitor_number) : null,
        name: athlete.name,
        weight_category: athlete.weight_category,
        date_of_birth: athlete.date_of_birth || null,
        id_number: athlete.id_number,
        best_total: athlete.best_total ? parseInt(athlete.best_total) : null,
        coach_name: athlete.coach_name
      }));

      console.log('Inserting athletes:', JSON.stringify(athletesToInsert, null, 2));

      const { error } = await supabase
        .from('preliminary_entry_athletes')
        .insert(athletesToInsert);

      if (error) {
        console.error('Error inserting athletes:', error);
        throw error;
      }

      console.log('✅ Successfully inserted', athletes.length, 'athletes');
    }

    res.json({ success: true, message: 'Preliminary athletes updated successfully' });
  } catch (error) {
    console.error('❌ Error updating preliminary athletes:', error);
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Update final athletes for a registration (opening attempts)
router.put('/:competitionId/registrations/:registrationId/final-athletes', protect, authorize('admin'), async (req, res) => {
  try {
    const { registrationId } = req.params;
    const { athletes } = req.body;

    // Update each athlete's opening attempts
    if (athletes && athletes.length > 0) {
      for (const athlete of athletes) {
        if (athlete.id) {
          await supabase
            .from('preliminary_entry_athletes')
            .update({
              snatch_opener: athlete.snatch_opener,
              cnj_opener: athlete.cnj_opener
            })
            .eq('id', athlete.id);
        }
      }
    }

    res.json({ success: true, message: 'Final athletes updated successfully' });
  } catch (error) {
    console.error('Error updating final athletes:', error);
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

export default router;
