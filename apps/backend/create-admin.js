#!/usr/bin/env node

import bcrypt from 'bcryptjs';
import db from './src/services/database.js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = db.supabase;

async function createAdminUser() {
  try {
    console.log('Creating admin user...');
    
    const email = 'admin@test.com';
    const password = 'password123';
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Check if user already exists
    const { data: existing, error: selectError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();
    
    if (existing) {
      console.log('✅ Admin user already exists');
      return;
    }
    
    if (selectError?.code !== 'PGRST116') {
      throw selectError;
    }
    
    // Create the admin user
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          email,
          name: 'Admin User',
          password_hash: passwordHash,
          role: 'admin',
          is_active: true,
          auth_provider: 'email',
        },
      ]);
    
    if (error) {
      console.error('❌ Error creating admin user:', error);
      process.exit(1);
    }
    
    console.log('✅ Admin user created successfully');
    console.log('Email: admin@test.com');
    console.log('Password: password123');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createAdminUser();
