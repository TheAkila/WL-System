import supabase from '../config/supabase.js';

/**
 * Create or find team from registration data
 * @param {string} clubName - Name of the club/team
 * @param {string} country - Country code or name
 * @param {string} managerName - Manager name from registration
 * @param {string} managerPhone - Manager phone number from registration
 * @param {string} ageCategory - Age category from registration
 * @returns {Promise<Object>} Team object with id
 */
export async function createTeamFromRegistration(clubName, country = 'LKA', managerName = null, managerPhone = null, ageCategory = null) {
  if (!clubName || clubName.trim() === '') {
    throw new Error('Club name is required');
  }

  const trimmedName = clubName.trim();
  
  // Check if team already exists
  const { data: existingTeam, error: findError } = await supabase
    .from('teams')
    .select('*')
    .ilike('name', trimmedName)
    .limit(1)
    .single();
  
  if (existingTeam) {
    console.log('✅ Team already exists:', existingTeam.name, '(ID:', existingTeam.id + ')');
    return existingTeam;
  }
  
  // Create new team with all registration data
  console.log('➕ Creating new team:', trimmedName);
  const { data: newTeam, error: createError } = await supabase
    .from('teams')
    .insert({
      name: trimmedName,
      country: country || 'LKA',
      manager_name: managerName,
      manager_phone: managerPhone,
      age_category: ageCategory
    })
    .select()
    .single();
  
  if (createError) {
    console.error('❌ Error creating team:', createError);
    throw createError;
  }
  
  console.log('✅ Team created:', newTeam.name, '(ID:', newTeam.id + ')');
  return newTeam;
}

/**
 * Update team information from registration (for final entry)
 * @param {number} registrationId - Registration ID
 * @param {string} clubName - Updated club name
 * @param {string} country - Updated country
 * @param {string} managerName - Updated manager name
 * @param {string} managerPhone - Updated manager phone
 * @param {string} ageCategory - Updated age category
 * @returns {Promise<Object>} Updated team object
 */
export async function updateTeamFromRegistration(registrationId, clubName, country = 'LKA', managerName = null, managerPhone = null, ageCategory = null) {
  try {
    // Find team by registration_id through athletes table
    const { data: athlete } = await supabase
      .from('athletes')
      .select('team_id')
      .eq('registration_id', registrationId)
      .limit(1)
      .single();
    
    if (!athlete || !athlete.team_id) {
      console.log('⚠️ No team found for this registration');
      return null;
    }
    
    // Update team information including all fields
    const { data: updatedTeam, error } = await supabase
      .from('teams')
      .update({
        name: clubName.trim(),
        country: country || 'LKA',
        manager_name: managerName,
        manager_phone: managerPhone,
        age_category: ageCategory
      })
      .eq('id', athlete.team_id)
      .select()
      .single();
    
    if (error) throw error;
    
    console.log(`✅ Updated team: ${clubName} (ID: ${athlete.team_id})`);
    return updatedTeam;
    
  } catch (error) {
    console.error('❌ Error updating team:', error);
    throw error;
  }
}

/**
 * Create athletes from preliminary entry athletes
 * @param {string} registrationId - Registration ID
 * @param {string} teamId - Team ID to assign athletes to
 * @param {string} competitionId - Competition ID
 * @returns {Promise<Array>} Created athletes
 */
export async function createAthletesFromPreliminary(registrationId, teamId, competitionId) {
  console.log('📝 Creating athletes from preliminary entry:', registrationId);
  console.log('Team ID:', teamId);
  console.log('Competition ID:', competitionId);
  
  // Get registration details
  const { data: registration, error: regError } = await supabase
    .from('event_registrations')
    .select('*, preliminary_entry_athletes(*)')
    .eq('id', registrationId)
    .single();
  
  if (regError || !registration) {
    console.error('❌ Registration not found:', regError);
    throw new Error('Registration not found');
  }
  
  console.log('📋 Registration found:', registration.club_name);
  
  // Get preliminary athletes
  const { data: preliminaryAthletes, error: athletesError } = await supabase
    .from('preliminary_entry_athletes')
    .select('*')
    .eq('registration_id', registrationId)
    .order('competitor_number', { ascending: true });
  
  if (athletesError) {
    console.error('❌ Error fetching preliminary athletes:', athletesError);
    throw athletesError;
  }
  
  console.log('📊 Raw preliminary athletes data:', JSON.stringify(preliminaryAthletes, null, 2));
  
  if (!preliminaryAthletes || preliminaryAthletes.length === 0) {
    console.log('⚠️ No preliminary athletes found for registration:', registrationId);
    console.log('⚠️ This means the preliminary_entry_athletes table is empty for this registration');
    return [];
  }
  
  console.log(`📋 Found ${preliminaryAthletes.length} preliminary athletes to create`);
  
  const createdAthletes = [];
  
  for (const prelim of preliminaryAthletes) {
    console.log(`🔍 Processing athlete:`, prelim);
    
    // Check if athlete already exists for this registration
    const { data: existing } = await supabase
      .from('athletes')
      .select('id')
      .eq('registration_id', registrationId)
      .eq('competitor_number', prelim.competitor_number)
      .single();
    
    if (existing) {
      console.log(`⏭️ Athlete ${prelim.name} already exists, skipping`);
      continue;
    }
    
    // Parse name (simple split on first space)
    const nameParts = (prelim.name || '').trim().split(' ');
    const firstName = nameParts[0] || 'Unknown';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    // Prepare athlete data - aligned with actual Supabase schema
    const athleteData = {
      name: `${firstName} ${lastName}`.trim(),
      gender: registration.gender === 'Men' || registration.gender === 'men' || registration.gender === 'male' ? 'male' : 'female',
      weight_category: prelim.weight_category?.toString().replace(/kg$/i, '').trim(),
      birth_date: prelim.date_of_birth || null,
      id_number: prelim.id_number || null,
      country: registration.nationality || 'LKA',
      coach_name: prelim.coach_name || registration.coach_name || null,
      best_total: prelim.best_total || null,
      team_id: teamId,
      registration_id: registrationId,
      // Opening attempts - note: column names are opening_snatch/opening_clean_jerk in actual schema
      opening_snatch: prelim.snatch_opener || null,
      opening_clean_jerk: prelim.cnj_opener || null,
      session_id: null // Will be assigned when sessions are created
    };
    
    console.log(`➕ Creating athlete: ${prelim.name} (${athleteData.weight_category}kg)`, athleteData);
    
    const { data: newAthlete, error: createError } = await supabase
      .from('athletes')
      .insert(athleteData)
      .select()
      .single();
    
    if (createError) {
      console.error(`❌ Error creating athlete ${prelim.name}:`, createError);
      // Continue with other athletes even if one fails
      continue;
    }
    
    console.log(`✅ Created athlete: ${newAthlete.name} (ID: ${newAthlete.id})`);
    createdAthletes.push(newAthlete);
  }
  
  console.log(`✅ Successfully created ${createdAthletes.length} athletes`);
  return createdAthletes;
}

/**
 * Update athletes from final entry data
 * @param {string} registrationId - Registration ID
 * @param {Array} finalAthletes - Final entry athletes data
 * @returns {Promise<Array>} Updated athletes
 */
export async function updateAthletesFromFinal(registrationId, finalAthletes) {
  console.log('🔄 Updating athletes from final entry:', registrationId);
  
  if (!finalAthletes || finalAthletes.length === 0) {
    console.log('⚠️ No final athletes data provided');
    return [];
  }
  
  const updatedAthletes = [];
  
  // Get all athletes for this registration first
  const { data: allRegistrationAthletesRaw, error: allError } = await supabase
    .from('athletes')
    .select('*')
    .eq('registration_id', registrationId);
  
  if (allError) {
    console.error('❌ Error fetching athletes:', allError);
    return [];
  }
  
  let allRegistrationAthletes = allRegistrationAthletesRaw || [];

  // Legacy fallback: some older athletes may not be linked by registration_id.
  if (allRegistrationAthletes.length === 0) {
    try {
      const { data: registration } = await supabase
        .from('event_registrations')
        .select('club_name, competition_id')
        .eq('id', registrationId)
        .single();

      if (registration?.club_name) {
        const { data: team } = await supabase
          .from('teams')
          .select('id, name')
          .ilike('name', registration.club_name.trim())
          .limit(1)
          .single();

        if (team?.id) {
          const { data: teamAthletes } = await supabase
            .from('athletes')
            .select('*')
            .eq('team_id', team.id)
            .order('created_at', { ascending: true });

          const filteredTeamAthletes = (teamAthletes || []).filter((a) => {
            if (!registration.competition_id) return true;
            return !a.competition_id || a.competition_id === registration.competition_id;
          });

          if (filteredTeamAthletes.length > 0) {
            console.log(`ℹ️ Using team-based fallback athletes for registration ${registrationId}: ${filteredTeamAthletes.length} found`);
            allRegistrationAthletes = filteredTeamAthletes;
          }
        }
      }
    } catch (fallbackError) {
      console.warn('Team fallback lookup failed:', fallbackError?.message || fallbackError);
    }
  }

  console.log(`Found ${allRegistrationAthletes.length || 0} existing athletes for registration`);

  const normalizeName = (value) => (value || '').toString().trim().toLowerCase();
  const normalizeNameStrict = (value) => normalizeName(value).replace(/[^a-z0-9]/g, '');
  const usedAthleteIds = new Set();
  const sortedExistingAthletes = [...(allRegistrationAthletes || [])].sort((a, b) => {
    const aNum = a.competitor_number ?? Number.MAX_SAFE_INTEGER;
    const bNum = b.competitor_number ?? Number.MAX_SAFE_INTEGER;
    if (aNum !== bNum) return aNum - bNum;
    return normalizeName(a.name).localeCompare(normalizeName(b.name));
  });
  
  for (const finalAthlete of finalAthletes) {
    // Try to match by competitor_number first
    let existingAthlete = null;
    
    if (finalAthlete.competitor_number) {
      existingAthlete = allRegistrationAthletes?.find(a => 
        !usedAthleteIds.has(a.id) && (
        a.competitor_number === parseInt(finalAthlete.competitor_number) ||
        a.competitor_number === finalAthlete.competitor_number
        )
      );
    }
    
    // If not found by competitor number, try by normalized full name.
    if (!existingAthlete && finalAthlete.name) {
      const normalizedFinalName = normalizeName(finalAthlete.name);
      existingAthlete = allRegistrationAthletes?.find(a => 
        !usedAthleteIds.has(a.id) && (
        normalizeName(a.name) === normalizedFinalName ||
        normalizeName(`${a.first_name || ''} ${a.last_name || ''}`) === normalizedFinalName
        )
      );
    }

    // Fallback for formatted initials/names (e.g. A.B.C Perera vs A B C Perera)
    if (!existingAthlete && finalAthlete.name) {
      const strictFinalName = normalizeNameStrict(finalAthlete.name);
      existingAthlete = allRegistrationAthletes?.find(a =>
        !usedAthleteIds.has(a.id) && (
          normalizeNameStrict(a.name) === strictFinalName ||
          normalizeNameStrict(`${a.first_name || ''} ${a.last_name || ''}`) === strictFinalName
        )
      );
    }

    // Final fallback: map by row order among remaining athletes for this registration.
    if (!existingAthlete) {
      existingAthlete = sortedExistingAthletes.find((a) => !usedAthleteIds.has(a.id)) || null;
      if (existingAthlete) {
        console.log(`⚠️ Fallback match by order: final athlete "${finalAthlete.name}" -> ${existingAthlete.name || existingAthlete.id}`);
      }
    }
    
    if (!existingAthlete) {
      console.log(`⚠️ Athlete not found for data:`, finalAthlete);
      continue;
    }
    
    // Prepare update data from final entry (no openers - they're set at weigh-in)
    const normalizedWeightCategory = finalAthlete.weight_category
      ? finalAthlete.weight_category.toString().replace(/kg$/i, '').trim()
      : existingAthlete.weight_category;

    const parsedBestTotal = finalAthlete.best_total === null || finalAthlete.best_total === undefined || finalAthlete.best_total === ''
      ? existingAthlete.best_total
      : parseFloat(finalAthlete.best_total);

    const updateData = {
      weight_category: normalizedWeightCategory,
      body_weight: finalAthlete.body_weight ?? existingAthlete.body_weight,
      best_total: Number.isNaN(parsedBestTotal) ? existingAthlete.best_total : parsedBestTotal,
      id_number: finalAthlete.id_number || existingAthlete.id_number,
      coach_name: finalAthlete.coach_name || existingAthlete.coach_name,
    };
    
    console.log(`🔄 Updating athlete ${existingAthlete.name || `${existingAthlete.first_name || ''} ${existingAthlete.last_name || ''}`.trim()}:`, updateData);
    
    const { data: updated, error: updateError } = await supabase
      .from('athletes')
      .update(updateData)
      .eq('id', existingAthlete.id)
      .select()
      .single();
    
    if (updateError) {
      console.error(`❌ Error updating athlete:`, updateError);
      continue;
    }
    
    console.log(`✅ Updated athlete: ${updated.name || `${updated.first_name || ''} ${updated.last_name || ''}`.trim()}`);
    updatedAthletes.push(updated);
    usedAthleteIds.add(existingAthlete.id);
    
    // Check if weight category changed - trigger session reassignment
    if (existingAthlete.weight_category !== updateData.weight_category) {
      console.log(`🔄 Weight category changed, attempting to reassign session...`);
      await reassignAthleteSession(updated.id);
    }
  }
  
  console.log(`✅ Successfully updated ${updatedAthletes.length} athletes`);
  return updatedAthletes;
}

/**
 * Auto-assign athletes to a session based on gender and weight classes
 * @param {string} sessionId - Session ID
 * @returns {Promise<number>} Number of athletes assigned
 */
export async function autoAssignAthletesToSession(sessionId) {
  console.log('🎯 Auto-assigning athletes to session:', sessionId);
  
  // Get session details
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .single();
  
  if (sessionError || !session) {
    throw new Error('Session not found');
  }
  
  console.log(`📋 Session: ${session.name}, Gender: ${session.gender}, Weight Classes:`, session.weight_classes);
  
  // Find unassigned athletes matching gender and weight category
  const { data: matchingAthletes, error: athletesError } = await supabase
    .from('athletes')
    .select('*')
    .eq('gender', session.gender)
    .in('weight_category', session.weight_classes || [session.weight_category])
    .is('session_id', null)
    .eq('competition_id', session.competition_id);
  
  if (athletesError) {
    console.error('❌ Error finding matching athletes:', athletesError);
    throw athletesError;
  }
  
  if (!matchingAthletes || matchingAthletes.length === 0) {
    console.log('ℹ️ No unassigned athletes found matching this session');
    return 0;
  }
  
  console.log(`📋 Found ${matchingAthletes.length} athletes to assign`);
  
  let assignedCount = 0;
  
  for (const athlete of matchingAthletes) {
    const { error: updateError } = await supabase
      .from('athletes')
      .update({ session_id: sessionId })
      .eq('id', athlete.id);
    
    if (updateError) {
      console.error(`❌ Error assigning athlete ${athlete.first_name}:`, updateError);
      continue;
    }
    
    console.log(`✅ Assigned ${athlete.first_name} ${athlete.last_name} (${athlete.weight_category}kg) to session`);
    assignedCount++;
  }
  
  console.log(`✅ Successfully assigned ${assignedCount} athletes to session`);
  return assignedCount;
}

/**
 * Reassign athlete to appropriate session when weight category changes
 * @param {string} athleteId - Athlete ID
 * @returns {Promise<Object|null>} New session if reassigned, null if no match
 */
export async function reassignAthleteSession(athleteId) {
  console.log('🔄 Attempting to reassign athlete:', athleteId);
  
  // Get athlete details
  const { data: athlete, error: athleteError } = await supabase
    .from('athletes')
    .select('*')
    .eq('id', athleteId)
    .single();
  
  if (athleteError || !athlete) {
    throw new Error('Athlete not found');
  }
  
  // Find matching session
  const { data: sessions, error: sessionsError } = await supabase
    .from('sessions')
    .select('*')
    .eq('gender', athlete.gender)
    .eq('competition_id', athlete.competition_id);
  
  if (sessionsError) {
    console.error('❌ Error finding sessions:', sessionsError);
    throw sessionsError;
  }
  
  // Find session that includes this weight category
  const matchingSession = sessions?.find(session => {
    const weightClasses = session.weight_classes || [session.weight_category];
    return weightClasses.includes(athlete.weight_category);
  });
  
  if (!matchingSession) {
    console.log(`ℹ️ No matching session found for ${athlete.first_name} (${athlete.weight_category}kg)`);
    // Unassign from current session if no match
    await supabase
      .from('athletes')
      .update({ session_id: null })
      .eq('id', athleteId);
    return null;
  }
  
  // Check if already assigned to this session
  if (athlete.session_id === matchingSession.id) {
    console.log(`ℹ️ Athlete already assigned to correct session`);
    return matchingSession;
  }
  
  // Reassign to new session
  const { error: updateError } = await supabase
    .from('athletes')
    .update({ session_id: matchingSession.id })
    .eq('id', athleteId);
  
  if (updateError) {
    console.error('❌ Error reassigning athlete:', updateError);
    throw updateError;
  }
  
  console.log(`✅ Reassigned ${athlete.first_name} ${athlete.last_name} to ${matchingSession.name}`);
  return matchingSession;
}

/**
 * Try to auto-assign an athlete to any matching session
 * Used when athletes are created before sessions exist
 * @param {string} athleteId - Athlete ID
 * @returns {Promise<boolean>} True if assigned, false if no match
 */
export async function tryAutoAssignToSession(athleteId) {
  try {
    const session = await reassignAthleteSession(athleteId);
    return session !== null;
  } catch (error) {
    console.error('Error in tryAutoAssignToSession:', error);
    return false;
  }
}
