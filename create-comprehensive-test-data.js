import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://axhbgtkdvghjxtrcvbkc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4aGJndGtkdmdoanh0cmN2YmtjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODQxNzEwMCwiZXhwIjoyMDgzOTkzMTAwfQ.I5WYN7jVvEKT6wOGgA500Dya6W5u7wiIzU8UsUEvbLs'
);

// Realistic athlete names
const femaleNames = [
  'Alex Johnson', 'Maria Garcia', 'Sarah Chen', 'Emma Wilson', 'Lisa Martinez',
  'Kate Davis', 'Jessica Brown', 'Angela Rodriguez', 'Sophie Taylor', 'Rachel Lee',
  'Diana Prince', 'Laura Santos', 'Nina Petrov', 'Elena Volkova', 'Yuki Tanaka',
  'Mei Wang', 'Sophia Rossi', 'Amanda Foster', 'Nicole Scott', 'Victoria Hayes',
];

const maleNames = [
  'James Anderson', 'Michael Torres', 'David Kim', 'Robert Jackson', 'Chris Martin',
  'Kevin Lewis', 'Jason White', 'Marcus Davis', 'Brandon Holmes', 'Ryan Adams',
  'Ivan Petrov', 'Stefan Mueller', 'Giorgio Rossi', 'Miguel Santos', 'Hiroshi Tanaka',
  'Wei Chen', 'Carlos Rodriguez', 'Antonio Garcia', 'Luis Hernandez', 'Jorge Lopez',
];

const teams = [
  { name: 'Elite Strength', country: 'USA' },
  { name: 'Iron Warriors', country: 'CAN' },
  { name: 'Olympic Club', country: 'GBR' },
  { name: 'Central Academy', country: 'USA' },
  { name: 'Northern Force', country: 'CAN' },
  { name: 'Pacific Power', country: 'AUS' },
];

const womenCategories = [
  { weight: '49kg', name: '49kg Category' },
  { weight: '55kg', name: '55kg Category' },
  { weight: '59kg', name: '59kg Category' },
  { weight: '64kg', name: '64kg Category' },
];

const menCategories = [
  { weight: '61kg', name: '61kg Category' },
  { weight: '67kg', name: '67kg Category' },
  { weight: '73kg', name: '73kg Category' },
  { weight: '81kg', name: '81kg Category' },
];

async function createComprehensiveTestData() {
  try {
    console.log('🏋️ Creating comprehensive test data...');
    console.log('='.repeat(60));

    // Create competition
    const { data: competition, error: compError } = await supabase
      .from('competitions')
      .insert({
        name: 'National Weightlifting Championship 2026',
        date: '2026-02-15',
        location: 'National Sports Complex',
        organizer: 'National Weightlifting Federation',
        status: 'active',
      })
      .select()
      .single();

    if (compError) throw compError;
    console.log('✅ Competition:', competition.name);

    // Create teams
    const { data: createdTeams, error: teamError } = await supabase
      .from('teams')
      .insert(teams.map(t => ({ ...t, name: `${t.name} ${Date.now()}` })))
      .select();

    if (teamError) throw teamError;
    console.log(`✅ Teams created: ${createdTeams.length}`);

    // Create athletes for women's categories
    console.log('\n📋 Creating female athletes...');
    const femaleAthletes = [];
    let athleteCount = 1;

    for (const category of womenCategories) {
      const categoryAthletes = [];
      const baseWeight = parseInt(category.weight);
      
      for (let i = 0; i < 5; i++) {
        const weight = baseWeight - 2 + (i * 0.5);
        categoryAthletes.push({
          name: femaleNames[Math.floor(Math.random() * femaleNames.length)],
          country: 'USA',
          body_weight: weight,
          team_id: createdTeams[Math.floor(Math.random() * createdTeams.length)].id,
          start_number: athleteCount++,
          gender: 'female',
          weight_category: category.weight,
        });
      }
      
      const { data: athletes, error } = await supabase
        .from('athletes')
        .insert(categoryAthletes)
        .select();
      
      if (error) throw error;
      femaleAthletes.push(...athletes);
      console.log(`  ✓ ${category.weight}: ${athletes.length} athletes`);
    }

    // Create athletes for men's categories
    console.log('\n📋 Creating male athletes...');
    const maleAthletes = [];

    for (const category of menCategories) {
      const categoryAthletes = [];
      const baseWeight = parseInt(category.weight);
      
      for (let i = 0; i < 5; i++) {
        const weight = baseWeight - 2 + (i * 0.5);
        categoryAthletes.push({
          name: maleNames[Math.floor(Math.random() * maleNames.length)],
          country: 'CAN',
          body_weight: weight,
          team_id: createdTeams[Math.floor(Math.random() * createdTeams.length)].id,
          start_number: athleteCount++,
          gender: 'male',
          weight_category: category.weight,
        });
      }
      
      const { data: athletes, error } = await supabase
        .from('athletes')
        .insert(categoryAthletes)
        .select();
      
      if (error) throw error;
      maleAthletes.push(...athletes);
      console.log(`  ✓ ${category.weight}: ${athletes.length} athletes`);
    }

    const allAthletes = [...femaleAthletes, ...maleAthletes];
    console.log(`\n✅ Total athletes created: ${allAthletes.length}`);

    // Create sessions
    console.log('\n📅 Creating sessions...');
    const sessions = [];
    let sessionStartHour = 9;

    for (const category of womenCategories) {
      const { data: session, error } = await supabase
        .from('sessions')
        .insert({
          competition_id: competition.id,
          name: `Women - ${category.name}`,
          weight_category: category.weight,
          gender: 'female',
          start_time: new Date(2026, 1, 15, sessionStartHour, 0).toISOString(),
          status: 'scheduled',
          current_lift: 'snatch',
        })
        .select()
        .single();

      if (error) throw error;
      sessions.push(session);
      sessionStartHour += 2;
      console.log(`  ✓ ${session.name}`);
    }

    for (const category of menCategories) {
      const { data: session, error } = await supabase
        .from('sessions')
        .insert({
          competition_id: competition.id,
          name: `Men - ${category.name}`,
          weight_category: category.weight,
          gender: 'male',
          start_time: new Date(2026, 1, 15, sessionStartHour, 0).toISOString(),
          status: 'scheduled',
          current_lift: 'snatch',
        })
        .select()
        .single();

      if (error) throw error;
      sessions.push(session);
      sessionStartHour += 2;
      console.log(`  ✓ ${session.name}`);
    }

    console.log(`\n✅ Sessions created: ${sessions.length}`);

    // Create sample attempts for first session
    console.log('\n🏋️ Creating sample attempts for demo...');
    const firstSession = sessions[0];
    const sessionAthletes = femaleAthletes.filter(a => a.weight_category === womenCategories[0].weight);
    
    let attemptCount = 0;
    for (const athlete of sessionAthletes.slice(0, 3)) {
      // Snatch attempts
      const snatchAttempts = [
        { weight: 70, result: 'good' },
        { weight: 75, result: 'no-lift' },
        { weight: 73, result: 'good' },
      ];

      let attemptNumber = 1;
      for (const attempt of snatchAttempts) {
        const { error } = await supabase
          .from('attempts')
          .insert({
            session_id: firstSession.id,
            athlete_id: athlete.id,
            lift_type: 'snatch',
            attempt_number: attemptNumber,
            weight: attempt.weight,
            result: attempt.result,
            referee_left: attempt.result === 'good' ? 'good' : 'no-lift',
            referee_center: attempt.result === 'good' ? 'good' : 'no-lift',
            referee_right: attempt.result === 'good' ? 'good' : 'no-lift',
          });

        if (error) throw error;
        attemptNumber++;
        attemptCount++;
      }

      // Clean & Jerk attempts
      const cjAttempts = [
        { weight: 85, result: 'good' },
        { weight: 90, result: 'good' },
        { weight: 95, result: 'no-lift' },
      ];

      attemptNumber = 1;
      for (const attempt of cjAttempts) {
        const { error } = await supabase
          .from('attempts')
          .insert({
            session_id: firstSession.id,
            athlete_id: athlete.id,
            lift_type: 'clean_and_jerk',
            attempt_number: attemptNumber,
            weight: attempt.weight,
            result: attempt.result,
            referee_left: attempt.result === 'good' ? 'good' : 'no-lift',
            referee_center: attempt.result === 'good' ? 'good' : 'no-lift',
            referee_right: attempt.result === 'good' ? 'good' : 'no-lift',
          });

        if (error) throw error;
        attemptNumber++;
        attemptCount++;
      }
    }

    console.log(`✅ Sample attempts created: ${attemptCount}`);

    // Calculate results for demo
    console.log('\n📊 Calculating results...');
    for (const athlete of sessionAthletes.slice(0, 3)) {
      const { data: attempts } = await supabase
        .from('attempts')
        .select('*')
        .eq('athlete_id', athlete.id);

      const snatches = attempts.filter(a => a.lift_type === 'snatch' && a.result === 'good');
      const cj = attempts.filter(a => a.lift_type === 'clean_and_jerk' && a.result === 'good');

      const bestSnatch = snatches.length > 0 ? Math.max(...snatches.map(a => a.weight)) : 0;
      const bestCJ = cj.length > 0 ? Math.max(...cj.map(a => a.weight)) : 0;
      const total = bestSnatch + bestCJ;

      await supabase
        .from('athletes')
        .update({
          best_snatch: bestSnatch,
          best_clean_and_jerk: bestCJ,
          total: total,
        })
        .eq('id', athlete.id);
    }

    console.log('='.repeat(60));
    console.log('\n🎉 COMPREHENSIVE TEST DATA CREATED!\n');
    console.log('📊 Summary:');
    console.log(`  Competition: ${competition.name}`);
    console.log(`  Total Athletes: ${allAthletes.length}`);
    console.log(`    - Female: ${femaleAthletes.length} (4 categories × 5 athletes)`);
    console.log(`    - Male: ${maleAthletes.length} (4 categories × 5 athletes)`);
    console.log(`  Teams: ${createdTeams.length}`);
    console.log(`  Sessions: ${sessions.length} (8 total)`);
    console.log(`  Sample Attempts: ${attemptCount} (pre-populated for demo)`);
    console.log('\n✨ Ready for testing!\n');
    console.log('📱 Access Points:');
    console.log(`  Admin Panel: http://localhost:3003`);
    console.log(`  Display Screen: http://localhost:5174`);
    console.log(`  Scoreboard: http://localhost:5175`);
    console.log(`  Technical Panel: http://localhost:3003/technical\n`);

    console.log('🎯 Next Steps:');
    console.log('  1. Go to Dashboard: http://localhost:3003/dashboard');
    console.log('  2. Open Technical Panel: http://localhost:3003/technical');
    console.log('  3. Select a session to run');
    console.log('  4. Open Display Screen in another tab: http://localhost:5174');
    console.log('  5. Open Scoreboard in another tab: http://localhost:5175');
    console.log('  6. Start recording attempts and watch live updates!\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createComprehensiveTestData();
