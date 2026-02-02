#!/usr/bin/env node

import db from './src/services/database.js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = db.supabase;

async function checkUser() {
  try {
    console.log('Checking admin user...');
    
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin@test.com')
      .single();
    
    if (error) {
      console.error('Error:', error);
      process.exit(1);
    }
    
    console.log('User found:');
    console.log('  Email:', user.email);
    console.log('  Name:', user.name);
    console.log('  Role:', user.role);
    console.log('  Is Active:', user.is_active);
    console.log('  Has Password Hash:', !!user.password_hash);
    console.log('  Auth Provider:', user.auth_provider);
    console.log('  ID:', user.id);
    
    process.exit(0);
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUser();
