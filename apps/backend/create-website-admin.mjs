import db from './src/services/database.js';
import bcrypt from 'bcryptjs';

async function createWebsiteAdmin() {
  const password = 'admin123';
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const { data, error } = await db.supabase
    .from('website_users')
    .insert([{
      email: 'admin@liftingsocial.com',
      password: hashedPassword,
      name: 'Website Admin',
      role: 'admin'
    }])
    .select();
  
  if (error) {
    if (error.code === '23505') {
      console.log('✓ Website admin already exists: admin@liftingsocial.com');
    } else {
      console.error('Error:', error.message);
    }
  } else {
    console.log('✅ Website admin created successfully!');
    console.log('Email: admin@liftingsocial.com');
    console.log('Password: admin123');
  }
  process.exit(0);
}

createWebsiteAdmin();
