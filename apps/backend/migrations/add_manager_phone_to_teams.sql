-- IMPORTANT: Run this in Supabase SQL Editor to add the manager_phone column to teams table

-- Step 1: Add the manager_phone column if it doesn't exist
ALTER TABLE teams ADD COLUMN IF NOT EXISTS manager_phone VARCHAR(20);

-- Step 2: Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'teams' 
AND column_name = 'manager_phone'
ORDER BY ordinal_position;

-- Step 3: Check existing teams data (all columns including the new one)
SELECT id, name, country, manager_phone, created_at 
FROM teams 
LIMIT 5;
