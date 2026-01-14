# 🏋️ Supabase Setup Checklist

Follow this checklist to get your Lifting Live Arena system running with Supabase.

## Prerequisites ✓

- [ ] Node.js 18+ installed
- [ ] Git installed
- [ ] Code editor (VS Code recommended)
- [ ] Modern web browser

---

## Part 1: Supabase Account & Project

### 1.1 Create Supabase Account
- [ ] Go to [supabase.com](https://supabase.com)
- [ ] Sign up or log in
- [ ] Verify your email

### 1.2 Create New Project
- [ ] Click "New Project"
- [ ] Select organization (or create new)
- [ ] Project Name: `lifting-live-arena`
- [ ] Database Password: Create strong password (save it!)
- [ ] Region: Select closest to you
- [ ] Plan: Free tier
- [ ] Click "Create new project"
- [ ] Wait 2-3 minutes for setup

### 1.3 Get API Credentials
- [ ] Click Settings (⚙️) icon in left sidebar
- [ ] Click "API" section
- [ ] Copy **Project URL**: `https://xxxxx.supabase.co`
- [ ] Copy **anon/public key** (starts with `eyJhbGc...`)
- [ ] Copy **service_role key** (⚠️ keep secret!)
- [ ] Save these in a secure note

---

## Part 2: Environment Configuration

### Option A: Automated Setup (Recommended)

```bash
# Run from project root
./setup-env.sh
```

Follow the prompts and paste your Supabase credentials.

### Option B: Manual Setup

#### 2.1 Backend Environment
```bash
cd apps/backend
cp .env.example .env
# Edit .env with your Supabase credentials
```

**Required values:**
- [ ] SUPABASE_URL
- [ ] SUPABASE_SERVICE_ROLE_KEY
- [ ] SUPABASE_ANON_KEY
- [ ] JWT_SECRET (generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)

#### 2.2 Admin Panel Environment
```bash
cd apps/admin-panel
cp .env.example .env
```

#### 2.3 Display Screen Environment
```bash
cd apps/display-screen
cp .env.example .env
```

#### 2.4 Scoreboard Environment
```bash
cd apps/scoreboard
cp .env.example .env
```

---

## Part 3: Database Setup

### 3.1 Run Schema (Main Tables)
- [ ] Open Supabase Dashboard
- [ ] Click "SQL Editor" in left sidebar
- [ ] Click "New Query"
- [ ] Open `database/schema.sql` in your editor
- [ ] Copy entire contents
- [ ] Paste in Supabase SQL Editor
- [ ] Click "Run" (or Cmd/Ctrl + Enter)
- [ ] Wait for "Success. No rows returned" message

### 3.2 Run Migration: Lifting Order
- [ ] Create new query in SQL Editor
- [ ] Copy contents of `database/migrations/001_lifting_order.sql`
- [ ] Paste and click "Run"
- [ ] Verify success message

### 3.3 Run Migration: Ranking & Medals
- [ ] Create new query in SQL Editor
- [ ] Copy contents of `database/migrations/002_official_ranking_medals.sql`
- [ ] Paste and click "Run"
- [ ] Verify success message

### 3.4 Verify Tables Created
Run this query:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Expected tables:**
- [ ] athletes
- [ ] attempts
- [ ] competitions
- [ ] sessions
- [ ] teams
- [ ] users

---

## Part 4: Enable Realtime

### 4.1 Configure Replication
- [ ] Go to "Database" section in Supabase
- [ ] Click "Replication" in left sidebar
- [ ] Find and enable these tables:
  - [ ] ✅ attempts
  - [ ] ✅ athletes
  - [ ] ✅ sessions
- [ ] Click "Save"

---

## Part 5: Add Sample Data (Optional but Recommended)

### 5.1 Create Competition
```sql
INSERT INTO competitions (name, date, location, status) VALUES
('National Championship 2026', '2026-02-15', 'National Stadium', 'active')
RETURNING id;
```
- [ ] Run query
- [ ] Copy the returned ID

### 5.2 Create Teams
```sql
INSERT INTO teams (name, country) VALUES
('USA Weightlifting', 'USA'),
('Team GB', 'GBR'),
('Canada Weightlifting', 'CAN')
RETURNING id;
```
- [ ] Run query
- [ ] Copy all three IDs

### 5.3 Create Session
Replace `competition-id-here` with ID from step 5.1:
```sql
INSERT INTO sessions (
  competition_id, 
  name, 
  weight_category, 
  gender, 
  status,
  current_lift,
  start_time
) VALUES (
  'competition-id-here',
  'Men 81kg Group A',
  '81',
  'male',
  'in-progress',
  'snatch',
  NOW()
) RETURNING id;
```
- [ ] Run query
- [ ] Copy the session ID

### 5.4 Create Athletes
Replace IDs with values from above:
```sql
INSERT INTO athletes (
  name, country, gender, weight_category, 
  body_weight, team_id, session_id, start_number
) VALUES
('John Smith', 'USA', 'male', '81', 80.5, 'usa-team-id', 'session-id', 1),
('James Wilson', 'GBR', 'male', '81', 79.8, 'gbr-team-id', 'session-id', 2),
('Mike Johnson', 'CAN', 'male', '81', 80.2, 'can-team-id', 'session-id', 3);
```
- [ ] Run query

### 5.5 Create Test Users
```sql
INSERT INTO users (email, name, role) VALUES
('admin@test.com', 'Admin User', 'admin'),
('tech@test.com', 'Technical Official', 'technical');
```
- [ ] Run query

---

## Part 6: Start Applications

### 6.1 Install Dependencies
```bash
# Terminal 1 - Backend
cd apps/backend
npm install

# Terminal 2 - Admin Panel
cd apps/admin-panel
npm install

# Terminal 3 - Display Screen
cd apps/display-screen
npm install

# Terminal 4 - Scoreboard
cd apps/scoreboard
npm install
```

### 6.2 Start Development Servers
```bash
# Terminal 1
cd apps/backend && npm run dev

# Terminal 2
cd apps/admin-panel && npm run dev

# Terminal 3
cd apps/display-screen && npm run dev

# Terminal 4
cd apps/scoreboard && npm run dev
```

---

## Part 7: Verify Everything Works

### 7.1 Check Backend
- [ ] Backend console shows: "✅ Supabase connection successful"
- [ ] Backend console shows: "🚀 Server running on port 5000"
- [ ] Visit http://localhost:5000 - should see API info

### 7.2 Check Admin Panel
- [ ] Visit http://localhost:3000
- [ ] Open browser console (F12)
- [ ] Should see: "Socket connected"
- [ ] Select the test session you created
- [ ] Should see 3 athletes in lifting order

### 7.3 Check Display Screen
- [ ] Visit http://localhost:3001
- [ ] Should auto-select the in-progress session
- [ ] Should show session name and current lift
- [ ] Top 5 leaderboard visible

### 7.4 Check Scoreboard
- [ ] Visit http://localhost:3002
- [ ] Navigate to Live View tab
- [ ] Select session
- [ ] Should show session info

### 7.5 Test Real-time Updates
- [ ] In Admin Panel, declare an attempt (click athlete, enter weight)
- [ ] Display Screen should update immediately
- [ ] Scoreboard should update immediately
- [ ] In Admin Panel, click "GOOD LIFT" or "NO LIFT"
- [ ] All screens should update in real-time

---

## Troubleshooting

### "Invalid API key" error
- [ ] Check `.env` files have correct Supabase keys
- [ ] No extra spaces or quotes around keys
- [ ] Backend uses SERVICE_ROLE_KEY (not anon key)

### "Relation does not exist" error
- [ ] Run schema.sql in SQL Editor
- [ ] Check for success message
- [ ] Verify tables exist with verification query

### Socket.IO not connecting
- [ ] Check CORS origins in backend `.env`
- [ ] Verify frontend `.env` has correct SOCKET_URL
- [ ] Backend must be running first

### Port already in use
```bash
# Find and kill process
lsof -i :5000
kill -9 <PID>
```

---

## Next Steps

- [ ] Read [TECHNICAL_PANEL.md](TECHNICAL_PANEL.md) for admin guide
- [ ] Read [DISPLAY_SCREEN.md](DISPLAY_SCREEN.md) for TV display guide
- [ ] Read [SCOREBOARD.md](SCOREBOARD.md) for mobile app guide
- [ ] Read [RANKING_MEDALS.md](RANKING_MEDALS.md) for ranking system
- [ ] Test complete competition workflow
- [ ] Plan production deployment

---

## 🎉 Congratulations!

Your Lifting Live Arena system is now set up and running!

**Quick URLs:**
- 🔧 Admin Panel: http://localhost:3000
- 📺 Display Screen: http://localhost:3001
- 📱 Scoreboard: http://localhost:3002
- 🔌 API: http://localhost:5000

**Supabase Dashboard:**
- 🗄️ Database: https://supabase.com/dashboard/project/YOUR-PROJECT/editor
- 📊 Logs: https://supabase.com/dashboard/project/YOUR-PROJECT/logs

Need help? Check [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for detailed instructions.
