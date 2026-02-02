import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function listTables() {
  console.log('Fetching table list from Supabase...\n');
  
  try {
    // Try common table names
    const tables = ['users', 'wl_users', 'athletes', 'competitions', 'sessions', 'attempts', 'teams'];
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (!error) {
        console.log(`✅ Table '${table}' exists`);
      } else if (error.code === 'PGRST204' || error.code === 'PGRST205') {
        console.log(`❌ Table '${table}' NOT found`);
      } else {
        console.log(`⚠️  Table '${table}' error: ${error.message}`);
      }
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
  
  process.exit(0);
}

listTables();
