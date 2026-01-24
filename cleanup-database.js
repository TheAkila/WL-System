#!/usr/bin/env node

/**
 * Database Cleanup Script
 * Removes all test data and competitions from the database
 * 
 * Usage:
 *   node cleanup-database.js              # Show menu
 *   node cleanup-database.js cleanup      # Clean specific test data
 *   node cleanup-database.js purge        # Delete all competitions and related data
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend directory
dotenv.config({ path: path.join(__dirname, 'apps/backend/.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
);

const command = process.argv[2] || 'menu';

async function showMenu() {
  console.log('\n🗑️  Database Cleanup Options:\n');
  console.log('1. cleanup   - Remove specific test data (John Smith, Mike Johnson, etc.)');
  console.log('2. purge     - DELETE ALL competitions and related data (⚠️  DESTRUCTIVE)');
  console.log('3. exit      - Exit without changes\n');
  console.log('Run: node cleanup-database.js [option]\n');
}

async function cleanupTestData() {
  try {
    console.log('\n🧹 Cleaning up test data...\n');

    // Get session IDs for test data
    const { data: sessions, error: sessionError } = await supabase
      .from('sessions')
      .select('id')
      .eq('name', 'Men 81kg Session');

    if (sessionError) throw sessionError;

    const sessionIds = sessions.map(s => s.id);

    // Delete athletes
    if (sessionIds.length > 0) {
      const { error: athleteError } = await supabase
        .from('athletes')
        .delete()
        .in('session_id', sessionIds);

      if (athleteError) throw athleteError;
      console.log('✅ Deleted test athletes');
    }

    // Delete sessions
    const { error: deleteSessionError } = await supabase
      .from('sessions')
      .delete()
      .eq('name', 'Men 81kg Session');

    if (deleteSessionError) throw deleteSessionError;
    console.log('✅ Deleted test sessions');

    // Delete teams
    const { error: teamError } = await supabase
      .from('teams')
      .delete()
      .in('name', ['USA Weightlifting', 'Canadian Weightlifting']);

    if (teamError) throw teamError;
    console.log('✅ Deleted test teams');

    // Delete competitions
    const { error: compError } = await supabase
      .from('competitions')
      .delete()
      .eq('name', 'National Championships 2026');

    if (compError) throw compError;
    console.log('✅ Deleted test competitions');

    console.log('\n✨ Test data cleanup complete!\n');
  } catch (error) {
    console.error('\n❌ Error during cleanup:', error.message);
    process.exit(1);
  }
}

async function purgeAllData() {
  console.log('\n⚠️  WARNING: This will DELETE ALL competitions and related data!');
  console.log('This action CANNOT be undone.\n');

  // In a real scenario, you'd prompt for confirmation
  // For now, we'll proceed with the purge
  
  try {
    console.log('🧹 Purging all competitions and related data...\n');

    // Get all competition IDs
    const { data: competitions, error: compError } = await supabase
      .from('competitions')
      .select('id');

    if (compError) throw compError;

    if (competitions.length === 0) {
      console.log('✅ No competitions found to delete');
      return;
    }

    const compIds = competitions.map(c => c.id);

    // Delete cascading data
    // Note: Cascading is handled by database foreign keys

    const { error: deleteError } = await supabase
      .from('competitions')
      .delete()
      .in('id', compIds);

    if (deleteError) throw deleteError;

    console.log(`✅ Deleted ${competitions.length} competition(s) and all related data`);
    console.log('   (sessions, athletes, attempts, etc.)\n');
  } catch (error) {
    console.error('\n❌ Error during purge:', error.message);
    process.exit(1);
  }
}

async function main() {
  try {
    // Test connection
    const { data, error } = await supabase.from('competitions').select('count');
    if (error) throw error;

    switch (command.toLowerCase()) {
      case 'cleanup':
        await cleanupTestData();
        break;
      case 'purge':
        await purgeAllData();
        break;
      case 'menu':
      case 'help':
        await showMenu();
        break;
      default:
        console.log(`\n❌ Unknown command: ${command}`);
        await showMenu();
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.log('\nMake sure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env');
    process.exit(1);
  }
}

main();
