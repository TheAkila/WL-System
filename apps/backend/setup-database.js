import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function setupDatabase() {
  console.log('🔧 Setting up WL-System database...\n');

  try {
    // Check if users table exists
    const { data: existingUsers, error: checkError } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (checkError && checkError.code === 'PGRST204') {
      console.log('❌ Users table does not exist!');
      console.log('📋 Please run the database schema first:');
      console.log('   1. Open Supabase Dashboard: https://supabase.com/dashboard');
      console.log('   2. Go to SQL Editor');
      console.log('   3. Run the schema from: WL-System/database/schema.sql');
      console.log('   4. Then run: WL-System/database/migrations/003_add_password_auth.sql\n');
      return;
    }

    console.log('✅ Users table exists\n');

    // Hash password
    const password = 'password123';
    const passwordHash = await bcrypt.hash(password, 10);

    // Default users
    const defaultUsers = [
      {
        email: 'admin@test.com',
        name: 'Admin User',
        role: 'admin',
        password_hash: passwordHash,
        is_active: true,
      },
      {
        email: 'tech@test.com',
        name: 'Technical Official',
        role: 'technical',
        password_hash: passwordHash,
        is_active: true,
      },
      {
        email: 'ref@test.com',
        name: 'Referee',
        role: 'referee',
        password_hash: passwordHash,
        is_active: true,
      },
    ];

    console.log('👥 Creating default users...\n');

    for (const user of defaultUsers) {
      // Check if user exists
      const { data: existing } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', user.email)
        .single();

      if (existing) {
        console.log(`   ℹ️  User already exists: ${user.email}`);
        // Update password hash in case it's missing
        await supabase
          .from('users')
          .update({ password_hash: passwordHash })
          .eq('email', user.email);
      } else {
        const { error: insertError } = await supabase
          .from('users')
          .insert([user]);

        if (insertError) {
          console.log(`   ❌ Failed to create ${user.email}: ${insertError.message}`);
        } else {
          console.log(`   ✅ Created user: ${user.email} (${user.role})`);
        }
      }
    }

    console.log('\n✅ Database setup complete!\n');
    console.log('📝 Login credentials:');
    console.log('   Email: admin@test.com');
    console.log('   Password: password123\n');
    console.log('   Email: tech@test.com');
    console.log('   Password: password123\n');
    console.log('   Email: ref@test.com');
    console.log('   Password: password123\n');

  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
  }
}

setupDatabase();
