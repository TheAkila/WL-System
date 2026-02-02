import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function checkColumns() {
  console.log('Fetching sample wl_users record to see columns...\n');
  
  const { data, error } = await supabase
    .from('wl_users')
    .select('*')
    .limit(1)
    .single();
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Columns in wl_users table:');
    console.log(Object.keys(data));
    console.log('\nSample record:');
    console.log(data);
  }
  
  process.exit(0);
}

checkColumns();
