-- =====================================================
-- QUICK DATABASE SETUP FOR SUPABASE
-- =====================================================
-- Run these queries in order in Supabase SQL Editor
-- Dashboard > SQL Editor > New Query
-- =====================================================

-- STEP 1: Create main schema
-- Copy and paste the entire contents of: database/schema.sql
-- Then click "Run" or press Cmd/Ctrl + Enter
-- Wait for "Success" message

-- STEP 2: Add lifting order functions
-- Copy and paste the entire contents of: database/migrations/001_lifting_order.sql
-- Click "Run"
-- Wait for "Success" message

-- STEP 3: Add ranking and medal system
-- Copy and paste the entire contents of: database/migrations/002_official_ranking_medals.sql
-- Click "Run"
-- Wait for "Success" message

-- STEP 4: Verify tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
-- Expected output: athletes, attempts, competitions, sessions, teams, users

-- STEP 5: Enable Realtime Replication
-- Go to: Dashboard > Database > Replication
-- Enable realtime for these tables:
-- ✅ attempts
-- ✅ athletes
-- ✅ sessions

-- STEP 6 (OPTIONAL): Add sample data for testing
-- Create a competition
INSERT INTO competitions (name, date, location, status) VALUES
('National Championship 2026', '2026-02-15', 'National Stadium', 'active')
RETURNING id;
-- Copy the returned ID

-- Create teams
INSERT INTO teams (name, country) VALUES
('USA Weightlifting', 'USA'),
('Team GB', 'GBR'),
('Canada Weightlifting', 'CAN')
RETURNING id;
-- Copy the returned IDs

-- Create a session (replace 'competition-id-here' with ID from above)
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
-- Copy the session ID

-- Create sample athletes (replace session-id and team-ids)
INSERT INTO athletes (
  name, country, gender, weight_category, 
  body_weight, team_id, session_id, start_number
) VALUES
('John Smith', 'USA', 'male', '81', 80.5, 'usa-team-id', 'session-id', 1),
('James Wilson', 'GBR', 'male', '81', 79.8, 'gbr-team-id', 'session-id', 2),
('Mike Johnson', 'CAN', 'male', '81', 80.2, 'can-team-id', 'session-id', 3);

-- Create test users (for authentication)
INSERT INTO users (email, name, role) VALUES
('admin@test.com', 'Admin User', 'admin'),
('tech@test.com', 'Technical Official', 'technical'),
('ref@test.com', 'Referee', 'referee');

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check session is ready
SELECT s.*, c.name as competition_name
FROM sessions s
JOIN competitions c ON s.competition_id = c.id
WHERE s.status = 'in-progress';

-- Check athletes are registered
SELECT name, country, start_number, body_weight
FROM athletes
WHERE session_id = 'your-session-id'
ORDER BY start_number;

-- Check lifting order function works
SELECT * FROM get_lifting_order('your-session-id');

-- =====================================================
-- TROUBLESHOOTING QUERIES
-- =====================================================

-- Check all functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public'
ORDER BY routine_name;
-- Expected: calculate_sinclair_coefficient, declare_attempt, get_lifting_order, 
--           update_athlete_totals, update_session_rankings, validate_attempt_result

-- Check all triggers exist
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- Reset all data (TESTING ONLY!)
-- WARNING: This deletes everything!
-- TRUNCATE attempts, athletes, sessions, competitions, teams, users RESTART IDENTITY CASCADE;

-- =====================================================
-- DONE! 
-- =====================================================
-- Your database is ready. Start your applications:
-- 1. Backend: cd apps/backend && npm run dev
-- 2. Admin Panel: cd apps/admin-panel && npm run dev
-- 3. Display Screen: cd apps/display-screen && npm run dev
-- 4. Scoreboard: cd apps/scoreboard && npm run dev
-- =====================================================
