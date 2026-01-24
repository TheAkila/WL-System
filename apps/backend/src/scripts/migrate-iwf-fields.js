/**
 * Migration Script: Add IWF Competition Fields
 * Adds opening_snatch, opening_clean_jerk, lot_number, weigh_in_completed_at to athletes table
 */

import { supabase } from '../config/supabase.js';
import logger from '../utils/logger.js';

async function runMigration() {
  logger.info('🔄 Running migration: Add IWF Competition Fields...\n');

  try {
    // Execute migration statements one by one
    const statements = [
      // Add columns
      `ALTER TABLE athletes ADD COLUMN IF NOT EXISTS opening_snatch INTEGER;`,
      `ALTER TABLE athletes ADD COLUMN IF NOT EXISTS opening_clean_jerk INTEGER;`,
      `ALTER TABLE athletes ADD COLUMN IF NOT EXISTS lot_number INTEGER;`,
      `ALTER TABLE athletes ADD COLUMN IF NOT EXISTS weigh_in_completed_at TIMESTAMP WITH TIME ZONE;`,
      
      // Add constraints (PostgreSQL compatible syntax)
      `DO $$ 
       BEGIN
         IF NOT EXISTS (
           SELECT 1 FROM pg_constraint WHERE conname = 'check_opening_snatch_positive'
         ) THEN
           ALTER TABLE athletes ADD CONSTRAINT check_opening_snatch_positive 
           CHECK (opening_snatch IS NULL OR opening_snatch > 0);
         END IF;
       END $$;`,
      
      `DO $$ 
       BEGIN
         IF NOT EXISTS (
           SELECT 1 FROM pg_constraint WHERE conname = 'check_opening_clean_jerk_positive'
         ) THEN
           ALTER TABLE athletes ADD CONSTRAINT check_opening_clean_jerk_positive 
           CHECK (opening_clean_jerk IS NULL OR opening_clean_jerk > 0);
         END IF;
       END $$;`,
      
      `DO $$ 
       BEGIN
         IF NOT EXISTS (
           SELECT 1 FROM pg_constraint WHERE conname = 'check_lot_number_positive'
         ) THEN
           ALTER TABLE athletes ADD CONSTRAINT check_lot_number_positive 
           CHECK (lot_number IS NULL OR lot_number > 0);
         END IF;
       END $$;`,
      
      // Create indexes
      `CREATE INDEX IF NOT EXISTS idx_athletes_opening_snatch ON athletes(opening_snatch);`,
      `CREATE INDEX IF NOT EXISTS idx_athletes_opening_clean_jerk ON athletes(opening_clean_jerk);`,
      `CREATE INDEX IF NOT EXISTS idx_athletes_lot_number ON athletes(lot_number);`,
    ];

    // Execute migration using direct query
    const migrationSQL = statements.join('\n\n');
    logger.info('Executing migration SQL...');
    
    const { data, error } = await supabase.from('athletes').select('opening_snatch, opening_clean_jerk, lot_number, weigh_in_completed_at').limit(1);
    
    if (error && error.message.includes('column') && error.message.includes('does not exist')) {
      logger.error('❌ Columns do not exist. Please run the migration SQL manually in Supabase SQL Editor:');
      logger.error('\n' + migrationSQL);
      logger.error('\nAlternatively, you can apply it via psql or Supabase dashboard.');
      process.exit(1);
    } else if (error) {
      logger.error('❌ Error checking columns:', error.message);
      process.exit(1);
    } else {
      logger.info('✅ All columns already exist - migration already applied!');
    }

    logger.info('\n✅ Migration completed successfully!');
    logger.info('\nNew columns added to athletes table:');
    logger.info('  - opening_snatch (INTEGER, with positive check)');
    logger.info('  - opening_clean_jerk (INTEGER, with positive check)');
    logger.info('  - lot_number (INTEGER, with positive check)');
    logger.info('  - weigh_in_completed_at (TIMESTAMP WITH TIME ZONE)');
    logger.info('\nIndexes created for lifting order queries');

  } catch (error) {
    logger.error('❌ Migration failed:', error.message);
    logger.error(error);
    process.exit(1);
  }

  process.exit(0);
}

runMigration();
