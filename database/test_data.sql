-- =====================================================
-- TEST DATA: Sample Competition Setup
-- =====================================================
-- This file creates a complete test scenario with:
-- - 1 Competition
-- - 2 Sessions (Men's and Women's)
-- - 6 Athletes
-- - Sample attempts with results
-- =====================================================

-- Clean up existing test data (if any)
DELETE FROM attempts WHERE session_id IN (
    SELECT id FROM sessions WHERE competition_id IN (
        SELECT id FROM competitions WHERE name LIKE 'Test%'
    )
);
DELETE FROM athletes WHERE session_id IN (
    SELECT id FROM sessions WHERE competition_id IN (
        SELECT id FROM competitions WHERE name LIKE 'Test%'
    )
);
DELETE FROM sessions WHERE competition_id IN (
    SELECT id FROM competitions WHERE name LIKE 'Test%'
);
DELETE FROM competitions WHERE name LIKE 'Test%';

-- Create test competition
INSERT INTO competitions (id, name, date, location, status)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'Test Championship 2026', '2026-06-15', 'Test Arena', 'active')
ON CONFLICT (id) DO UPDATE SET status = 'active';

-- Create test teams
INSERT INTO teams (id, name, country)
VALUES 
    ('10000000-0000-0000-0000-000000000001', 'Team USA', 'USA'),
    ('10000000-0000-0000-0000-000000000002', 'Team Canada', 'CAN'),
    ('10000000-0000-0000-0000-000000000003', 'Team Mexico', 'MEX')
ON CONFLICT (id) DO NOTHING;

-- Create test sessions
INSERT INTO sessions (id, competition_id, name, weight_category, gender, status, current_lift)
VALUES 
    ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 
     'Men 81kg A Session', '81', 'male', 'in-progress', 'snatch'),
    ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 
     'Women 64kg A Session', '64', 'female', 'in-progress', 'snatch')
ON CONFLICT (id) DO UPDATE SET status = 'in-progress';

-- Create test athletes for Men's 81kg
INSERT INTO athletes (id, name, country, gender, weight_category, body_weight, start_number, session_id, team_id)
VALUES 
    ('30000000-0000-0000-0000-000000000001', 'John Smith', 'USA', 'male', '81', 80.5, 1, 
     '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001'),
    ('30000000-0000-0000-0000-000000000002', 'Carlos Rodriguez', 'MEX', 'male', '81', 80.2, 2, 
     '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003'),
    ('30000000-0000-0000-0000-000000000003', 'Mike Johnson', 'CAN', 'male', '81', 80.8, 3, 
     '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002')
ON CONFLICT (id) DO NOTHING;

-- Create test athletes for Women's 64kg
INSERT INTO athletes (id, name, country, gender, weight_category, body_weight, start_number, session_id, team_id)
VALUES 
    ('30000000-0000-0000-0000-000000000004', 'Sarah Jones', 'USA', 'female', '64', 63.5, 1, 
     '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001'),
    ('30000000-0000-0000-0000-000000000005', 'Emma Wilson', 'CAN', 'female', '64', 63.8, 2, 
     '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002'),
    ('30000000-0000-0000-0000-000000000006', 'Maria Garcia', 'MEX', 'female', '64', 63.5, 3, 
     '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- SCENARIO 1: Men's 81kg - Complete Competition
-- =====================================================

-- John Smith - Snatch attempts
INSERT INTO attempts (athlete_id, session_id, lift_type, attempt_number, weight, 
                     referee_left, referee_center, referee_right)
VALUES 
    ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 
     'snatch', 1, 120, 'good', 'good', 'good'),
    ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 
     'snatch', 2, 125, 'good', 'good', 'no-lift'),
    ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 
     'snatch', 3, 125, 'good', 'good', 'good')
ON CONFLICT (athlete_id, lift_type, attempt_number) DO NOTHING;

-- John Smith - Clean & Jerk attempts
INSERT INTO attempts (athlete_id, session_id, lift_type, attempt_number, weight, 
                     referee_left, referee_center, referee_right)
VALUES 
    ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 
     'clean_and_jerk', 1, 150, 'good', 'good', 'good'),
    ('30000000-0000-0000-0000-0000-000001', '20000000-0000-0000-0000-000000000001', 
     'clean_and_jerk', 2, 155, 'good', 'good', 'good'),
    ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 
     'clean_and_jerk', 3, 160, 'no-lift', 'no-lift', 'good')
ON CONFLICT (athlete_id, lift_type, attempt_number) DO NOTHING;

-- Carlos Rodriguez - Snatch attempts
INSERT INTO attempts (athlete_id, session_id, lift_type, attempt_number, weight, 
                     referee_left, referee_center, referee_right)
VALUES 
    ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 
     'snatch', 1, 125, 'good', 'good', 'good'),
    ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 
     'snatch', 2, 130, 'good', 'good', 'good'),
    ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 
     'snatch', 3, 133, 'no-lift', 'good', 'no-lift')
ON CONFLICT (athlete_id, lift_type, attempt_number) DO NOTHING;

-- Carlos Rodriguez - Clean & Jerk attempts
INSERT INTO attempts (athlete_id, session_id, lift_type, attempt_number, weight, 
                     referee_left, referee_center, referee_right)
VALUES 
    ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 
     'clean_and_jerk', 1, 155, 'good', 'good', 'good'),
    ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 
     'clean_and_jerk', 2, 160, 'good', 'good', 'good'),
    ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 
     'clean_and_jerk', 3, 165, 'good', 'no-lift', 'no-lift')
ON CONFLICT (athlete_id, lift_type, attempt_number) DO NOTHING;

-- Mike Johnson - Snatch attempts
INSERT INTO attempts (athlete_id, session_id, lift_type, attempt_number, weight, 
                     referee_left, referee_center, referee_right)
VALUES 
    ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', 
     'snatch', 1, 118, 'good', 'good', 'good'),
    ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', 
     'snatch', 2, 123, 'good', 'good', 'good'),
    ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', 
     'snatch', 3, 128, 'no-lift', 'no-lift', 'no-lift')
ON CONFLICT (athlete_id, lift_type, attempt_number) DO NOTHING;

-- Mike Johnson - Clean & Jerk attempts
INSERT INTO attempts (athlete_id, session_id, lift_type, attempt_number, weight, 
                     referee_left, referee_center, referee_right)
VALUES 
    ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', 
     'clean_and_jerk', 1, 148, 'good', 'good', 'good'),
    ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', 
     'clean_and_jerk', 2, 153, 'good', 'good', 'good'),
    ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', 
     'clean_and_jerk', 3, 158, 'good', 'good', 'good')
ON CONFLICT (athlete_id, lift_type, attempt_number) DO NOTHING;

-- =====================================================
-- SCENARIO 2: Women's 64kg - Tie-breaking Example
-- =====================================================

-- Sarah Jones - Total: 200kg (85 + 115), Bodyweight: 63.5
INSERT INTO attempts (athlete_id, session_id, lift_type, attempt_number, weight, 
                     referee_left, referee_center, referee_right)
VALUES 
    ('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000002', 
     'snatch', 1, 85, 'good', 'good', 'good'),
    ('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000002', 
     'clean_and_jerk', 1, 115, 'good', 'good', 'good')
ON CONFLICT (athlete_id, lift_type, attempt_number) DO NOTHING;

-- Maria Garcia - Total: 200kg (83 + 117), Bodyweight: 63.5 (SAME as Sarah!)
-- Should rank 2nd because lifted later (start number 3 vs 1)
INSERT INTO attempts (athlete_id, session_id, lift_type, attempt_number, weight, 
                     referee_left, referee_center, referee_right)
VALUES 
    ('30000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000002', 
     'snatch', 1, 83, 'good', 'good', 'good'),
    ('30000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000002', 
     'clean_and_jerk', 1, 117, 'good', 'good', 'good')
ON CONFLICT (athlete_id, lift_type, attempt_number) DO NOTHING;

-- Emma Wilson - Total: 195kg (82 + 113), Bodyweight: 63.8
INSERT INTO attempts (athlete_id, session_id, lift_type, attempt_number, weight, 
                     referee_left, referee_center, referee_right)
VALUES 
    ('30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000002', 
     'snatch', 1, 82, 'good', 'good', 'good'),
    ('30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000002', 
     'clean_and_jerk', 1, 113, 'good', 'good', 'good')
ON CONFLICT (athlete_id, lift_type, attempt_number) DO NOTHING;

-- =====================================================
-- VIEW RESULTS
-- =====================================================

-- Men's 81kg Results
-- Expected ranking:
-- 1. Carlos Rodriguez (290kg = 130 + 160, lighter bodyweight 80.2kg)
-- 2. John Smith (280kg = 125 + 155, bodyweight 80.5kg)
-- 3. Mike Johnson (281kg = 123 + 158, heaviest bodyweight 80.8kg)

SELECT 
    rank,
    athlete_name,
    country,
    body_weight,
    best_snatch,
    best_clean_and_jerk,
    total,
    ROUND(sinclair_total::numeric, 2) as sinclair
FROM leaderboard
WHERE session_id = '20000000-0000-0000-0000-000000000001'
ORDER BY rank;

-- Women's 64kg Results
-- Expected ranking (demonstrates tie-breaking):
-- 1. Sarah Jones (200kg, start #1)
-- 2. Maria Garcia (200kg, start #3) -- Same total AND bodyweight, but lifted later
-- 3. Emma Wilson (195kg)

SELECT 
    rank,
    athlete_name,
    country,
    body_weight,
    start_number,
    best_snatch,
    best_clean_and_jerk,
    total,
    ROUND(sinclair_total::numeric, 2) as sinclair
FROM leaderboard
WHERE session_id = '20000000-0000-0000-0000-000000000002'
ORDER BY rank;

-- Team Standings
SELECT 
    team_name,
    country,
    athlete_count,
    team_total,
    ROUND(avg_sinclair::numeric, 2) as avg_sinclair,
    gold_medals,
    silver_medals,
    bronze_medals
FROM team_standings
WHERE competition_id = '00000000-0000-0000-0000-000000000001'
ORDER BY team_total DESC;

-- =====================================================
-- TEST QUERIES
-- =====================================================

-- Get lifting order for Men's 81kg (if session not completed)
-- SELECT * FROM get_lifting_order('20000000-0000-0000-0000-000000000001');

-- Manually recalculate rankings
-- SELECT update_session_rankings('20000000-0000-0000-0000-000000000001');
-- SELECT update_session_rankings('20000000-0000-0000-0000-000000000002');
