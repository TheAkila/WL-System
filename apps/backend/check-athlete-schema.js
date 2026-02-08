import supabase from './src/config/supabase.js';

async function checkAthleteSchema() {
  try {
    // Try to get any athlete to see what columns exist
    const { data, error } = await supabase
      .from('athletes')
      .select('*')
      .limit(1);
    
    if (data && data.length > 0) {
      console.log('✅ Athlete table columns:', Object.keys(data[0]));
    } else {
      console.log('No athletes exist yet. Creating a minimal test athlete to discover schema...');
      
      // Try inserting with just required fields
      const { data: testData, error: testError } = await supabase
        .from('athletes')
        .insert({
          name: 'TEST_SCHEMA_CHECK',
          gender: 'male',
          weight_category: '60',
          country: 'LKA'
        })
        .select()
        .single();
      
      if (testError) {
        console.error('❌ Insert error (shows what\'s required):', testError);
      } else {
        console.log('✅ Minimal athlete created. Schema:', Object.keys(testData));
        
        // Delete test athlete
        await supabase.from('athletes').delete().eq('id', testData.id);
        console.log('🗑️ Test athlete deleted');
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkAthleteSchema();
