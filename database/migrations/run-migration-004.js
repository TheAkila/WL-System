/**
 * Migration Script: Add Opening Attempts and Lot Numbers
 * Run this script to apply database changes for IWF competition flow
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log('🔄 Running migration: Add Opening Attempts and Lot Numbers...\n');

  try {
    // Execute the migration SQL
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Add opening attempts and lot number to athletes table
        ALTER TABLE athletes 
        ADD COLUMN IF NOT EXISTS opening_snatch INTEGER,
        ADD COLUMN IF NOT EXISTS opening_clean_jerk INTEGER,
        ADD COLUMN IF NOT EXISTS lot_number INTEGER,
        ADD COLUMN IF NOT EXISTS weigh_in_completed_at TIMESTAMP WITH TIME ZONE;

        -- Add constraints
        ALTER TABLE athletes 
        ADD CONSTRAINT IF NOT EXISTS check_opening_snatch_positive 
        CHECK (opening_snatch IS NULL OR opening_snatch > 0);

        ALTER TABLE athletes 
        ADD CONSTRAINT IF NOT EXISTS check_opening_clean_jerk_positive 
        CHECK (opening_clean_jerk IS NULL OR opening_clean_jerk > 0);

        ALTER TABLE athletes 
        ADD CONSTRAINT IF NOT EXISTS check_lot_number_positive 
        CHECK (lot_number IS NULL OR lot_number > 0);
      `
    });

    if (error) {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    }

    console.log('✅ Migration completed successfully!');
    console.log('\n📋 Changes applied:');
    console.log('   - Added opening_snatch column');
    console.log('   - Added opening_clean_jerk column');
    console.log('   - Added lot_number column');
    console.log('   - Added weigh_in_completed_at column');
    console.log('   - Added validation constraints\n');

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

runMigration();
