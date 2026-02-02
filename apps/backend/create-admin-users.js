#!/usr/bin/env node

/**
 * Create admin users in Supabase
 * Run: node create-admin-users.js
 */

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminUsers() {
  console.log('🔧 Creating admin users...\n');

  // Hash password
  const password = 'password123';
  const passwordHash = await bcrypt.hash(password, 10);

  const users = [
    { email: 'admin@test.com', name: 'Admin User', role: 'admin' },
    { email: 'tech@test.com', name: 'Technical Official', role: 'technical' },
    { email: 'ref@test.com', name: 'Referee', role: 'referee' },
  ];

  for (const user of users) {
    try {
      // Try to insert
      const { data, error } = await supabase
        .from('wl_users')
        .upsert(
          {
            email: user.email,
            name: user.name,
            role: user.role,
            password_hash: passwordHash,
            is_active: true
          },
          {
            onConflict: 'email',
            ignoreDuplicates: false
          }
        )
        .select();

      if (error) {
        console.error(`❌ Error creating ${user.email}:`, error.message);
      } else {
        console.log(`✅ Created/Updated: ${user.email} (${user.role})`);
      }
    } catch (err) {
      console.error(`❌ Failed to create ${user.email}:`, err.message);
    }
  }

  console.log('\n📋 Verifying users...\n');

  // Verify users exist
  const { data: allUsers, error: listError } = await supabase
    .from('wl_users')
    .select('email, name, role, is_active')
    .order('role');

  if (listError) {
    console.error('❌ Error fetching users:', listError.message);
  } else {
    console.table(allUsers);
    console.log('\n✅ Setup complete!\n');
    console.log('📝 Login credentials:');
    console.log('   Email: admin@test.com');
    console.log('   Password: password123\n');
  }
}

createAdminUsers().catch(console.error);
