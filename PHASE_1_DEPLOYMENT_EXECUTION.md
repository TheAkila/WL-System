# 🚀 PHASE 1 DEPLOYMENT - STEP BY STEP

## ✅ Status Check

Before deploying, verify:
- ✅ Migration file exists: `/database/migrations/006_session_state_machine.sql`
- ✅ Backend service created: `/apps/backend/src/services/sessionStateMachine.service.js`
- ✅ API routes created: `/apps/backend/src/routes/sessionState.routes.js`
- ✅ Routes integrated in: `/apps/backend/src/routes/index.js`

**All files ready for deployment!** 🎯

---

## 📋 DEPLOYMENT STEPS

### STEP 1: Deploy Database Migration (5 minutes)

#### Option A: Via Supabase Dashboard (Recommended for first-time)

1. **Go to Supabase Dashboard**
   - URL: https://app.supabase.com/
   - Select your project: "lifting-live-arena"

2. **Navigate to SQL Editor**
   - Click **SQL Editor** in left sidebar
   - Click **New Query** button

3. **Copy Migration SQL**
   - Open: `/database/migrations/006_session_state_machine.sql`
   - Select all (Cmd+A)
   - Copy (Cmd+C)

4. **Paste in Supabase**
   - Paste into the SQL editor (Cmd+V)
   - Click **Run** button
   - Wait for success message ✅

5. **Verify in Supabase**
   - Go to **Table Editor** (left sidebar)
   - Look for new tables:
     - `session_progression_locks` ✓
     - `session_state_history` ✓
   - Go to **Database** → **Functions**
   - Look for new functions (all should have `update_session_state` in name) ✓

#### Option B: Via psql (For advanced users)

```bash
# If you have postgres/psql installed
psql -h db.supabase.co \
     -U postgres \
     -d postgres \
     -f database/migrations/006_session_state_machine.sql

# Enter password: your Supabase database password
```

**Success indicators:**
```
CREATE TYPE
CREATE TYPE
ALTER TABLE
ALTER TABLE
CREATE TABLE
CREATE INDEX
CREATE TABLE
CREATE INDEX
CREATE INDEX
CREATE OR REPLACE FUNCTION
... (total ~13 success messages)
```

---

### STEP 2: Verify Database Changes (3 minutes)

After migration completes, verify in Supabase:

#### Check New Columns on `sessions` Table
```sql
-- Run this in Supabase SQL Editor
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name='sessions' 
ORDER BY ordinal_position DESC 
LIMIT 10;
```

Expected new columns:
- `state` (session_state enum)
- `current_phase` (competition_phase enum)
- `weigh_in_completed_at` (timestamp)
- `snatch_started_at` (timestamp)
- `snatch_completed_at` (timestamp)
- `clean_jerk_started_at` (timestamp)
- `clean_jerk_completed_at` (timestamp)
- `locked_phase` (competition_phase enum)

#### Check New Columns on `athletes` Table
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name='athletes' 
ORDER BY ordinal_position DESC 
LIMIT 5;
```

Expected new columns:
- `body_weight_kg` (numeric)
- `weigh_in_date` (timestamp)
- `weighed_in` (boolean)
- `start_weight_kg` (numeric)

#### Check New Tables
```sql
-- List all tables
SELECT tablename FROM pg_tables 
WHERE schemaname='public' 
ORDER BY tablename;
```

Should see:
- `session_progression_locks` ✓
- `session_state_history` ✓

#### Check Functions
```sql
-- List all functions
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema='public' 
AND routine_type='FUNCTION'
ORDER BY routine_name;
```

Should include:
- `validate_session_state_transition`
- `update_session_state`
- `update_session_progression_locks`
- `mark_athlete_weighed_in`
- `get_weigh_in_summary`
- `get_next_lifter`

---

### STEP 3: Restart Backend (2 minutes)

```bash
# Terminal 1: Navigate to backend
cd /Users/akilanishan/Desktop/Projects/WL\ System/WL-System/apps/backend

# Stop current server (if running)
# Press Ctrl+C

# Install any new dependencies (if needed)
npm install

# Start backend server
npm run dev

# Expected output:
# ✅ Server is running on port 5000
# ✅ Connected to database
# ✅ Routes initialized
```

**Check for errors:** If you see any errors in console, check:
- Database connection string in `.env`
- Supabase service key is correct
- Migration was applied successfully

---

### STEP 4: Test API Endpoints (5 minutes)

Open a new terminal and test the endpoints:

#### Test 1: Get Session State Config
```bash
curl -X GET "http://localhost:5000/api/sessions/{SESSION_ID}/state-config" \
  -H "Content-Type: application/json"

# Expected response:
# {
#   "success": true,
#   "state": "scheduled",
#   "buttons": {...},
#   "lockedPhase": null
# }
```

#### Test 2: Start Weigh-In
```bash
curl -X POST "http://localhost:5000/api/sessions/{SESSION_ID}/transitions/weigh-in" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "your-user-id"
  }'

# Expected response:
# {
#   "success": true,
#   "state": "weighing",
#   "timestamp": "2026-01-25T..."
# }
```

#### Test 3: Get Weigh-In Summary
```bash
curl -X GET "http://localhost:5000/api/sessions/{SESSION_ID}/weigh-in-summary" \
  -H "Content-Type: application/json"

# Expected response:
# {
#   "success": true,
#   "total_athletes": 5,
#   "weighed_in": 0,
#   "pending": 5,
#   "completion_percentage": 0
# }
```

#### Test 4: Mark Athlete as Weighed In
```bash
curl -X POST "http://localhost:5000/api/sessions/{SESSION_ID}/weigh-in-athlete" \
  -H "Content-Type: application/json" \
  -d '{
    "athleteId": "athlete-id",
    "bodyWeightKg": 77.5,
    "startWeightKg": 82.5
  }'

# Expected response:
# {
#   "success": true,
#   "athlete_id": "...",
#   "body_weight_kg": 77.5,
#   "timestamp": "2026-01-25T..."
# }
```

#### Test 5: Complete Weigh-In and Transition
```bash
curl -X POST "http://localhost:5000/api/sessions/{SESSION_ID}/transitions/complete-weigh-in" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "your-user-id"
  }'

# Expected response:
# {
#   "success": true,
#   "state": "ready_to_start",
#   "timestamp": "2026-01-25T..."
# }
```

---

## ✅ Verification Checklist

After completing all steps, verify:

```
[ ] Migration applied without errors
[ ] New tables exist in Supabase
[ ] New columns exist on sessions/athletes tables
[ ] New functions exist in database
[ ] Backend server starts without errors
[ ] GET /state-config returns valid state
[ ] POST /transitions/weigh-in changes state
[ ] GET /weigh-in-summary shows correct counts
[ ] POST /weigh-in-athlete saves weight data
[ ] POST /transitions/complete-weigh-in transitions state
[ ] State transitions reject invalid moves (test it!)
```

---

## 🆘 Troubleshooting

### Issue: Migration fails with "syntax error"
**Solution:**
- Copy the ENTIRE file (all 416 lines)
- Paste in Supabase SQL Editor
- Check for truncation or missing lines

### Issue: "Permission denied" error
**Solution:**
- Use Service Role Key (not anon key)
- Ensure you're using the correct Supabase project
- Check database user has CREATE TABLE permissions

### Issue: "ENUM type already exists"
**Solution:**
- The migration uses `CREATE TYPE` which fails if type exists
- This is OK - means you already applied the migration
- Check if tables and functions exist before re-running

### Issue: API endpoint returns 404
**Solution:**
- Verify backend is running: `curl http://localhost:5000/health`
- Check routes are loaded: Look for "sessionState" in startup logs
- Restart backend after updating files

### Issue: State transition fails with validation error
**Solution:**
- Check current state: `GET /state-config`
- Verify valid transition path in documentation
- Example: Can't go from "scheduled" directly to "complete"

---

## 📊 Expected Results

After successful deployment:

### In Database
- 9 new columns on `sessions` table
- 4 new columns on `athletes` table
- 2 new tables (session_progression_locks, session_state_history)
- 6 new functions (+ indexes)
- All relationships properly configured with foreign keys

### In API
- 12 new endpoints at `/api/sessions/:id/...`
- All endpoints validate request data
- All endpoints return JSON responses
- Errors return proper HTTP status codes

### In Backend Service
- SessionStateMachine class available
- All 14 methods working
- Integration with database functions

---

## 🎯 Next After Deployment

Once deployment is complete and verified:

1. **Option A: Test in Admin Panel**
   - Go to admin panel
   - Create/select a session
   - Click "Start Weigh-In"
   - Mark athletes as weighed in
   - Watch state transitions work

2. **Option B: Start Phase 2 Frontend**
   - Read [PHASE_2_FRONTEND_PLAN.md](PHASE_2_FRONTEND_PLAN.md)
   - Build SessionCard component
   - Build WeighInModal component
   - Integrate with new API endpoints

3. **Option C: Test Edge Cases**
   - Try invalid state transitions
   - Verify they're rejected
   - Check error messages are clear
   - Verify audit trail is logging

---

## 📞 Quick Reference

**Files Involved:**
- Database: `/database/migrations/006_session_state_machine.sql` (416 lines)
- Service: `/apps/backend/src/services/sessionStateMachine.service.js` (593 lines)
- Routes: `/apps/backend/src/routes/sessionState.routes.js` (280 lines)
- Integration: `/apps/backend/src/routes/index.js` (lines 6, 25)

**Backup Before Deploying:**
```bash
# Backup your database
pg_dump -h db.supabase.co -U postgres -d postgres > backup_before_phase1.sql
```

**Rollback if Needed:**
```sql
-- Run in Supabase SQL Editor if something goes wrong
DROP TABLE IF EXISTS session_state_history CASCADE;
DROP TABLE IF EXISTS session_progression_locks CASCADE;
DROP FUNCTION IF EXISTS get_next_lifter CASCADE;
DROP FUNCTION IF EXISTS get_weigh_in_summary CASCADE;
DROP FUNCTION IF EXISTS mark_athlete_weighed_in CASCADE;
DROP FUNCTION IF EXISTS update_session_progression_locks CASCADE;
DROP FUNCTION IF EXISTS update_session_state CASCADE;
DROP FUNCTION IF EXISTS validate_session_state_transition CASCADE;
DROP TYPE IF EXISTS competition_phase CASCADE;
DROP TYPE IF EXISTS session_state CASCADE;
ALTER TABLE athletes DROP COLUMN IF EXISTS body_weight_kg CASCADE;
ALTER TABLE athletes DROP COLUMN IF EXISTS weigh_in_date CASCADE;
ALTER TABLE athletes DROP COLUMN IF EXISTS weighed_in CASCADE;
ALTER TABLE athletes DROP COLUMN IF EXISTS start_weight_kg CASCADE;
ALTER TABLE sessions DROP COLUMN IF EXISTS state CASCADE;
ALTER TABLE sessions DROP COLUMN IF EXISTS current_phase CASCADE;
ALTER TABLE sessions DROP COLUMN IF EXISTS weigh_in_completed_at CASCADE;
ALTER TABLE sessions DROP COLUMN IF EXISTS snatch_started_at CASCADE;
ALTER TABLE sessions DROP COLUMN IF EXISTS snatch_completed_at CASCADE;
ALTER TABLE sessions DROP COLUMN IF EXISTS clean_jerk_started_at CASCADE;
ALTER TABLE sessions DROP COLUMN IF EXISTS clean_jerk_completed_at CASCADE;
ALTER TABLE sessions DROP COLUMN IF EXISTS locked_phase CASCADE;
```

---

**You're ready to deploy!** 🚀

Start with **STEP 1** above and follow through. Takes ~15 minutes total.

Questions? Check the troubleshooting section above or review the migration file.
