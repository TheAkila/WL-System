-- =====================================================
-- CLEANUP TEST DATA
-- =====================================================
-- This script removes all test data that was previously auto-inserted
-- Run this once to clear the database of sample data

-- Delete athletes created from sample data
DELETE FROM athletes 
WHERE name IN ('John Smith', 'Mike Johnson') 
  AND session_id IN (
    SELECT s.id FROM sessions s 
    WHERE s.name = 'Men 81kg Session'
  );

-- Delete sessions created from sample data
DELETE FROM sessions 
WHERE name = 'Men 81kg Session';

-- Delete teams created from sample data
DELETE FROM teams 
WHERE name IN ('USA Weightlifting', 'Canadian Weightlifting');

-- Delete competitions created from sample data
DELETE FROM competitions 
WHERE name = 'National Championships 2026';

-- Alternative: Delete ALL competitions (if you want a completely empty database)
-- WARNING: This will delete everything including sessions, athletes, attempts!
-- TRUNCATE competitions, sessions, athletes, attempts RESTART IDENTITY CASCADE;

SELECT 'Test data cleanup complete!' as status;
