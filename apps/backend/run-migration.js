import { supabase } from './src/config/supabase.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  try {
    console.log('🚀 Running migration: add-image-url-to-competitions.sql');
    
    const sqlPath = path.join(__dirname, 'migrations', 'add-image-url-to-competitions.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📝 SQL:', sql);
    
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      // If RPC doesn't exist, try direct query
      console.log('⚠️  RPC method not available, trying direct query...');
      
      const { data: alterData, error: alterError } = await supabase
        .from('competitions')
        .select('image_url')
        .limit(1);
      
      if (alterError && alterError.message.includes('column "image_url" does not exist')) {
        console.log('❌ Column does not exist. Please run the SQL manually in Supabase SQL Editor:');
        console.log('\n' + sql + '\n');
        console.log('Instructions:');
        console.log('1. Go to your Supabase Dashboard');
        console.log('2. Click on "SQL Editor" in the left menu');
        console.log('3. Paste the SQL above');
        console.log('4. Click "Run"');
        process.exit(1);
      } else if (!alterError) {
        console.log('✅ Column already exists!');
        process.exit(0);
      } else {
        throw alterError;
      }
    }
    
    console.log('✅ Migration completed successfully!');
    console.log('Result:', data);
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\nPlease run the following SQL in your Supabase SQL Editor:');
    console.error('\nALTER TABLE competitions ADD COLUMN IF NOT EXISTS image_url TEXT;\n');
    process.exit(1);
  }
}

runMigration();
