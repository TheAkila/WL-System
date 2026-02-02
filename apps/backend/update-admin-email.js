#!/usr/bin/env node

import db from './src/services/database.js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = db.supabase;

async function updateAdminEmail() {
  try {
    console.log('Updating admin email...');
    
    const oldEmail = 'admin@test.com';
    const newEmail = 'nishanakila10@gmail.com';
    
    // Check if old admin exists
    const { data: oldAdmin, error: selectError } = await supabase
      .from('users')
      .select('*')
      .eq('email', oldEmail)
      .single();
    
    if (selectError?.code === 'PGRST116') {
      console.log('❌ Admin user not found at:', oldEmail);
      process.exit(1);
    }
    
    if (selectError) {
      throw selectError;
    }
    
    // Check if new email already exists
    const { data: existingEmail } = await supabase
      .from('users')
      .select('*')
      .eq('email', newEmail)
      .single();
    
    if (existingEmail) {
      console.log('❌ Email already exists:', newEmail);
      process.exit(1);
    }
    
    // Update admin email
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ email: newEmail })
      .eq('id', oldAdmin.id)
      .select()
      .single();
    
    if (updateError) {
      throw updateError;
    }
    
    console.log('✅ Admin email updated successfully!');
    console.log('Old email:', oldEmail);
    console.log('New email:', newEmail);
    console.log('Role:', updatedUser.role);
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateAdminEmail();
