import supabase from './src/config/supabase.js';
import { createAthletesFromPreliminary, createTeamFromRegistration } from './src/services/athleteService.js';

async function manuallyCreateAthletes() {
  const registrationId = 'b47d464e-5962-42d4-a279-aa76a9fc2006';
  const competitionId = '90ceb33f-47fe-4af2-bbb7-9beadd1fb64e'; // You may need to verify this
  
  try {
    console.log('🔧 Manually creating athletes for registration:', registrationId);
    
    // Get registration data
    const { data: registration, error: regError } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('id', registrationId)
      .single();
    
    if (regError) throw regError;
    
    console.log('📋 Registration:', {
      club_name: registration.club_name,
      nationality: registration.nationality,
      team_code: registration.team_code,
      team_manager_name: registration.team_manager_name,
      age_category: registration.age_category
    });
    
    // 1. Create team
    console.log('\n1️⃣ Creating team...');
    const team = await createTeamFromRegistration(
      registration.club_name || 'Unknown Club',
      registration.nationality || registration.team_code || 'LKA',
      registration.team_manager_name,
      registration.team_manager_phone,
      registration.age_category
    );
    
    console.log('✅ Team created/found:', team.name, team.id);
    
    // 2. Create athletes
    console.log('\n2️⃣ Creating athletes...');
    const athletes = await createAthletesFromPreliminary(
      registrationId,
      team.id,
      registration.competition_id // Use actual competition_id from registration
    );
    
    console.log(`✅ Created ${athletes.length} athletes:`);
    athletes.forEach((a, i) => {
      console.log(`   ${i + 1}. ${a.name} | ${a.weight_category} | ID: ${a.id_number || 'N/A'}`);
    });
    
    console.log('\n✅ Manual athlete creation complete!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

manuallyCreateAthletes();
