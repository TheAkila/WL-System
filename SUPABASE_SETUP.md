# Supabase Setup Guide for Lifting Live Arena

## Overview

This guide will help you set up Supabase for your weightlifting competition management system.

## Prerequisites

- A Supabase account (free tier works)
- Node.js 18+ installed
- Git installed

## Step-by-Step Setup

### 1. Create a Supabase Project

1. **Sign up/Login** to [Supabase](https://supabase.com)
2. **Click "New Project"**
   - Organization: Select or create
   - Name: `lifting-live-arena` (or your preferred name)
   - Database Password: Create a strong password (save this!)
   - Region: Choose closest to your location
   - Pricing Plan: Free tier is sufficient for testing
3. **Wait for project creation** (takes ~2 minutes)

### 2. Get Your Supabase Credentials

Once your project is ready:

1. **Go to Project Settings** (gear icon in sidebar)
2. **Click "API" section**
3. **Copy the following values:**

   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (⚠️ Keep secret!)

### 3. Configure Environment Variables

#### Backend Configuration

Create `.env` file in `apps/backend/`:

```bash
cd apps/backend
cp .env.example .env
```

Edit `apps/backend/.env`:

```dotenv
# Supabase Configuration
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
SUPABASE_ANON_KEY=your_anon_key_here

# Server Configuration
PORT=5000
NODE_ENV=development

# Socket.IO Configuration
SOCKET_IO_CORS_ORIGIN=http://localhost:3000,http://localhost:3001,http://localhost:3002

# JWT Configuration
JWT_SECRET=your_random_secret_key_here_min_32_chars
JWT_EXPIRE=7d

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
```

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Admin Panel Configuration

Create `apps/admin-panel/.env`:

```dotenv
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

#### Display Screen Configuration

Create `apps/display-screen/.env`:

```dotenv
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

#### Scoreboard Configuration

Create `apps/scoreboard/.env`:

```dotenv
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 4. Run Database Migrations

#### Option A: Using Supabase SQL Editor (Recommended)

1. **Open SQL Editor** in Supabase Dashboard (left sidebar)
2. **Click "New Query"**
3. **Copy and paste** the entire contents of `database/schema.sql`
4. **Click "Run"** (or press Cmd/Ctrl + Enter)
5. **Wait for completion** - should see "Success" message
6. **Run migration** for ranking/medals:
   - Create another new query
   - Copy contents of `database/migrations/002_official_ranking_medals.sql`
   - Click "Run"
7. **Run migration** for lifting order functions:
   - Create another new query
   - Copy contents of `database/migrations/001_lifting_order.sql`
   - Click "Run"

#### Option B: Using psql Command Line

If you have `psql` installed:

```bash
# Get your database URL from Supabase Dashboard > Project Settings > Database
# Connection string format: postgresql://postgres:[PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres

# Run schema
psql "postgresql://postgres:[PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres" -f database/schema.sql

# Run migrations
psql "postgresql://postgres:[PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres" -f database/migrations/001_lifting_order.sql
psql "postgresql://postgres:[PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres" -f database/migrations/002_official_ranking_medals.sql
```

### 5. Verify Database Setup

Run this query in SQL Editor to verify tables were created:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Expected tables:**
- athletes
- attempts
- competitions
- sessions
- teams
- users

### 6. Enable Realtime (Important!)

For live updates to work:

1. **Go to Database** section in Supabase Dashboard
2. **Click "Replication"** in sidebar
3. **Enable realtime** for these tables:
   - ✅ attempts
   - ✅ athletes
   - ✅ sessions

Click "Save" after enabling.

### 7. Set Up Authentication (Optional for MVP)

For production, configure authentication:

1. **Go to Authentication** section
2. **Click "Providers"**
3. **Enable Email** provider
4. Configure settings as needed

For now, you can create test users manually in SQL Editor:

```sql
INSERT INTO users (email, name, role) VALUES
('admin@test.com', 'Admin User', 'admin'),
('tech@test.com', 'Technical Official', 'technical'),
('ref@test.com', 'Referee', 'referee');
```

### 8. Seed Sample Data (Optional)

To test the system, add sample data:

```sql
-- Create a competition
INSERT INTO competitions (name, date, location, status) VALUES
('National Championship 2026', '2026-02-15', 'National Stadium', 'active')
RETURNING id;

-- Copy the returned ID and use it below (replace 'competition-id-here')

-- Create a session
INSERT INTO sessions (
  competition_id, 
  name, 
  weight_category, 
  gender, 
  status,
  current_lift
) VALUES (
  'competition-id-here',
  'Men 81kg Group A',
  '81',
  'male',
  'in-progress',
  'snatch'
) RETURNING id;

-- Copy session ID

-- Create teams
INSERT INTO teams (name, country) VALUES
('USA Weightlifting', 'USA'),
('Team GB', 'GBR'),
('Canada Weightlifting', 'CAN')
RETURNING id;

-- Create sample athletes (use session ID and team IDs from above)
INSERT INTO athletes (
  name, country, gender, weight_category, 
  body_weight, team_id, session_id, start_number
) VALUES
('John Smith', 'USA', 'male', '81', 80.5, 'team-id-1', 'session-id', 1),
('James Wilson', 'GBR', 'male', '81', 79.8, 'team-id-2', 'session-id', 2),
('Mike Johnson', 'CAN', 'male', '81', 80.2, 'team-id-3', 'session-id', 3);
```

### 9. Test the Setup

Start all applications:

```bash
# Terminal 1 - Backend
cd apps/backend
npm install
npm run dev

# Terminal 2 - Admin Panel
cd apps/admin-panel
npm install
npm run dev

# Terminal 3 - Display Screen
cd apps/display-screen
npm install
npm run dev

# Terminal 4 - Scoreboard
cd apps/scoreboard
npm install
npm run dev
```

**URLs:**
- Backend API: http://localhost:5000
- Admin Panel: http://localhost:3000
- Display Screen: http://localhost:3001
- Scoreboard: http://localhost:3002

### 10. Verify Connections

Check backend console for:
```
✅ Supabase connection successful
🚀 Server running on port 5000
⚡ Socket.IO initialized
```

Check browser console in admin panel for:
```
Socket connected
```

## Troubleshooting

### Connection Error: "Invalid API key"

**Solution:**
- Double-check your API keys in `.env` files
- Ensure no extra spaces or quotes
- Copy directly from Supabase dashboard

### Database Error: "relation does not exist"

**Solution:**
- Run schema.sql in SQL Editor
- Check "Success" message appeared
- Verify tables exist (query above)

### Realtime Updates Not Working

**Solution:**
1. Enable Realtime replication for tables
2. Check Socket.IO CORS origins in backend `.env`
3. Verify frontend is connecting to correct socket URL
4. Check browser console for Socket.IO errors

### Port Already in Use

**Solution:**
```bash
# Find process using port
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or change port in .env
PORT=5001
```

### Cannot Connect to Supabase

**Solution:**
1. Check internet connection
2. Verify Supabase project is active (not paused)
3. Check project URL is correct
4. Ensure service role key (not anon key) is used in backend

## Security Checklist

- [ ] Keep `.env` files in `.gitignore` (already configured)
- [ ] Never commit service_role keys to Git
- [ ] Use environment variables for all secrets
- [ ] Enable Row Level Security (RLS) in production
- [ ] Configure CORS properly in production
- [ ] Use strong JWT secrets
- [ ] Enable SSL/HTTPS in production

## Production Deployment

When deploying to production:

1. **Update Environment Variables** with production values
2. **Enable Row Level Security** on all tables
3. **Set up proper authentication** (not manual users)
4. **Configure database backups** in Supabase
5. **Set up monitoring** (Supabase has built-in logs)
6. **Use environment-specific domains** in CORS

## Next Steps

1. ✅ Set up Supabase project
2. ✅ Configure environment variables
3. ✅ Run database migrations
4. ✅ Enable realtime
5. ⬜ Add sample data
6. ⬜ Test complete workflow
7. ⬜ Deploy to production

## Useful SQL Queries

### Check Active Sessions
```sql
SELECT s.name, s.status, s.current_lift, c.name as competition
FROM sessions s
JOIN competitions c ON s.competition_id = c.id
WHERE s.status IN ('scheduled', 'in-progress')
ORDER BY s.start_time;
```

### View Leaderboard for a Session
```sql
SELECT rank, name, country, best_snatch, best_clean_and_jerk, total, medal
FROM athletes
WHERE session_id = 'session-id-here'
ORDER BY rank NULLS LAST;
```

### Check Recent Attempts
```sql
SELECT 
  a.name as athlete,
  att.lift_type,
  att.attempt_number,
  att.weight,
  att.result,
  att.timestamp
FROM attempts att
JOIN athletes a ON att.athlete_id = a.id
ORDER BY att.timestamp DESC
LIMIT 10;
```

### Reset All Data (Testing Only!)
```sql
-- WARNING: This deletes all data!
TRUNCATE attempts, athletes, sessions, competitions, teams, users RESTART IDENTITY CASCADE;
```

## Support

- Supabase Docs: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
- Project Issues: Create an issue in your repository

## Database Schema Reference

See [database/schema.sql](../database/schema.sql) for complete schema documentation.

See [RANKING_MEDALS.md](../RANKING_MEDALS.md) for ranking and medal system documentation.
