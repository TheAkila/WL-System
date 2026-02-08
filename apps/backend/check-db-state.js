import supabase from './src/config/supabase.js';

async function checkRegistrationData() {
  try {
    console.log('🔍 Checking database for final approved registrations...\n');

    // Check final approved registrations
    const { data: registrations, error: regError } = await supabase
      .from('event_registrations')
      .select('id, user_id, status, is_team_registration, created_at')
      .eq('status', 'final_approved')
      .order('created_at', { ascending: false })
      .limit(5);

    if (regError) throw regError;

    console.log(`📋 Final Approved Registrations (${registrations?.length || 0}):`);
    registrations?.forEach(reg => {
      console.log(`  - ID: ${reg.id} | User ID: ${reg.user_id} | Team: ${reg.is_team_registration ? 'Yes' : 'No'} | Created: ${reg.created_at}`);
    });
    console.log('');

    // Check preliminary entry athletes for these registrations
    if (registrations && registrations.length > 0) {
      const regIds = registrations.map(r => r.id);
      
      const { data: prelimAthletes, error: prelimError } = await supabase
        .from('preliminary_entry_athletes')
        .select('registration_id, name')
        .in('registration_id', regIds);

      if (prelimError) throw prelimError;

      // Group by registration_id
      const athleteCounts = {};
      prelimAthletes?.forEach(pa => {
        athleteCounts[pa.registration_id] = (athleteCounts[pa.registration_id] || 0) + 1;
      });

      console.log(`👤 Preliminary Entry Athletes:`);
      if (!prelimAthletes || prelimAthletes.length === 0) {
        console.log('  ⚠️  NO ATHLETES FOUND IN preliminary_entry_athletes table!');
        console.log('  → This means athletes were never added during preliminary entry');
      } else {
        Object.entries(athleteCounts).forEach(([regId, count]) => {
          console.log(`  - Registration ${regId}: ${count} athletes`);
        });
      }
      console.log('');

      // Check athletes table
      const { data: athletes, error: athletesError } = await supabase
        .from('athletes')
        .select('registration_id, name')
        .in('registration_id', regIds);

      if (athletesError) throw athletesError;

      // Group by registration_id
      const createdAthleteCounts = {};
      athletes?.forEach(a => {
        createdAthleteCounts[a.registration_id] = (createdAthleteCounts[a.registration_id] || 0) + 1;
      });

      console.log(`🏋️ Athletes Table:`);
      if (!athletes || athletes.length === 0) {
        console.log('  ⚠️  NO ATHLETES FOUND IN athletes table!');
        console.log('  → Athletes were not auto-created during approval');
      } else {
        Object.entries(createdAthleteCounts).forEach(([regId, count]) => {
          console.log(`  - Registration ${regId}: ${count} athletes`);
        });
      }
      console.log('');

      // Detailed check for first registration
      const firstRegId = registrations[0].id;
      console.log(`\n🔬 Detailed Check for Registration ${firstRegId}:`);
      
      const { data: prelimDetail, error: prelimDetailError } = await supabase
        .from('preliminary_entry_athletes')
        .select('name, weight_category, id_number, coach_name, best_total')
        .eq('registration_id', firstRegId);

      if (prelimDetailError) throw prelimDetailError;

      console.log(`\n  Preliminary Athletes (${prelimDetail?.length || 0}):`);
      if (!prelimDetail || prelimDetail.length === 0) {
        console.log('    ⚠️  EMPTY - No preliminary athlete data exists!');
        console.log('    → User submitted entry without filling in preliminary athlete data');
        console.log('    → Athletes cannot be auto-created without source data');
      } else {
        prelimDetail.forEach((pa, i) => {
          console.log(`    ${i + 1}. ${pa.name} | ${pa.weight_category} | ID: ${pa.id_number || 'N/A'} | Coach: ${pa.coach_name || 'N/A'} | Best: ${pa.best_total || 'N/A'}`);
        });
      }

      const { data: athleteDetail, error: athleteDetailError } = await supabase
        .from('athletes')
        .select('name, weight_category, id_number, coach_name, best_total')
        .eq('registration_id', firstRegId);

      if (athleteDetailError) throw athleteDetailError;

      console.log(`\n  Athletes Table (${athleteDetail?.length || 0}):`);
      if (!athleteDetail || athleteDetail.length === 0) {
        console.log('    ⚠️  EMPTY - Athletes were not created!');
      } else {
        athleteDetail.forEach((a, i) => {
          console.log(`    ${i + 1}. ${a.name} | ${a.weight_category} | ID: ${a.id_number || 'N/A'} | Coach: ${a.coach_name || 'N/A'} | Best: ${a.best_total || 'N/A'}`);
        });
      }
    }

    console.log('\n✅ Check complete!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkRegistrationData();
