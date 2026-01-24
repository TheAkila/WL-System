import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axhbgtkdvghjxtrcvbkc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4aGJndGtkdmdoanh0cmN2YmtjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODQxNzEwMCwiZXhwIjoyMDgzOTkzMTAwfQ.I5WYN7jVvEKT6wOGgA500Dya6W5u7wiIzU8UsUEvbLs'
);

async function createTestData() {
  try {
    console.log('Creating test competition data...');
    console.log('='.repeat(50));

    // Create competition
    const { data: competition, error: compError } = await supabase
      .from('competitions')
      .insert({
        name: 'Test Regional Championship 2026',
        date: '2026-01-25',
        location: 'Central Arena',
        status: 'active'
      })
      .select()
      .single();

    if (compError) throw compError;
    console.log('✅ Competition created:', competition.id);

    // Create teams
    const timestamp = Date.now();
    const { data: teams, error: teamError } = await supabase
      .from('teams')
      .insert([
        { name: `Team Alpha ${timestamp}`, country: 'USA' },
        { name: `Team Beta ${timestamp}`, country: 'CAN' }
      ])
      .select();

    if (teamError) throw teamError;
    console.log('✅ Teams created:', teams.map(t => t.name));

    // Create athletes
    const athletes = [
      { name: 'Alex Johnson', country: 'USA', body_weight: 67, team_id: teams[0].id, start_number: 1, gender: 'female', weight_category: '55kg' },
      { name: 'Maria Garcia', country: 'USA', body_weight: 55, team_id: teams[0].id, start_number: 2, gender: 'female', weight_category: '55kg' },
      { name: 'Sarah Chen', country: 'CAN', body_weight: 58, team_id: teams[1].id, start_number: 3, gender: 'female', weight_category: '55kg' },
      { name: 'Emma Wilson', country: 'CAN', body_weight: 63, team_id: teams[1].id, start_number: 4, gender: 'female', weight_category: '55kg' },
      { name: 'Lisa Martinez', country: 'USA', body_weight: 71, team_id: teams[0].id, start_number: 5, gender: 'female', weight_category: '55kg' },
      { name: 'Kate Davis', country: 'CAN', body_weight: 60, team_id: teams[1].id, start_number: 6, gender: 'female', weight_category: '55kg' }
    ];

    const { data: athleteData, error: athleteError } = await supabase
      .from('athletes')
      .insert(athletes)
      .select();

    if (athleteError) throw athleteError;
    console.log('✅ Athletes created:', athleteData.map(a => a.name));

    // Create session
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .insert({
        competition_id: competition.id,
        name: 'Women 55kg Category',
        weight_category: '55kg',
        gender: 'female',
        start_time: '2026-01-25T14:00:00',
        status: 'scheduled',
        current_lift: 'snatch'
      })
      .select()
      .single();

    if (sessionError) throw sessionError;
    console.log('✅ Session created:', session.id);

    console.log('='.repeat(50));
    console.log('\n🎉 TEST DATA CREATED SUCCESSFULLY!\n');
    console.log('Competition:', competition.name);
    console.log('  ID:', competition.id);
    console.log('  Date:', competition.date);
    console.log('  Location:', competition.location);
    console.log('\nSession:', session.name);
    console.log('  ID:', session.id);
    console.log('  Category:', session.weight_category + 'kg');
    console.log('  Gender:', session.gender);
    console.log('\nTeams:', teams.length);
    teams.forEach(t => console.log(`  - ${t.name} (${t.country})`));
    console.log('\nAthletes:', athleteData.length);
    athleteData.forEach(a => console.log(`  - ${a.name} (${a.body_weight}kg, #${a.start_number})`));
    console.log('\n✨ Ready for testing at http://localhost:3003\n');
  } catch (error) {
    console.error('❌ Error creating test data:', error.message);
    process.exit(1);
  }
}

createTestData();
