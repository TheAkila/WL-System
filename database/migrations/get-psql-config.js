require('dotenv').config({ path: '../../apps/backend/.env' });

const url = process.env.SUPABASE_URL;
if (!url) {
  console.log('❌ SUPABASE_URL not found in .env');
  process.exit(1);
}

// Extract project reference from URL
const match = url.match(/https:\/\/([a-z0-9]+)\.supabase\.co/);
if (match) {
  const projectRef = match[1];
  console.log('✅ Supabase Project Reference:', projectRef);
  console.log('');
  console.log('📋 PostgreSQL Connection String Format:');
  console.log('');
  console.log(`postgresql://postgres:[YOUR-PASSWORD]@db.${projectRef}.supabase.co:5432/postgres`);
  console.log('');
  console.log('⚠️  You need your Supabase DATABASE PASSWORD');
  console.log('');
  console.log('📍 How to get your database password:');
  console.log('  1. Go to: https://supabase.com/dashboard');
  console.log('  2. Select your project');
  console.log('  3. Click: Settings > Database');
  console.log('  4. Look for: "Connection string" or "Database password"');
  console.log('  5. Copy the password');
  console.log('');
  console.log('💾 To save in .env, add this line:');
  console.log('');
  console.log(`DATABASE_URL=postgresql://postgres:[PASSWORD]@db.${projectRef}.supabase.co:5432/postgres`);
} else {
  console.log('❌ Could not parse Supabase URL');
}
