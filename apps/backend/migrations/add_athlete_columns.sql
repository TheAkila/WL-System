-- Migration: Add new athlete registration fields
-- Date: 2026-01-27
-- Description: Add ID number, registration number, best total, and coach name columns to athletes table

-- Add columns to athletes table
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS id_number VARCHAR(50);
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS registration_number VARCHAR(50);
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS best_total NUMERIC(6,2);
ALTER TABLE athletes ADD COLUMN IF NOT EXISTS coach_name VARCHAR(255);

-- Add comments for documentation
COMMENT ON COLUMN athletes.id_number IS 'Unique identification number of the athlete (ID/Passport number)';
COMMENT ON COLUMN athletes.registration_number IS 'Optional registration/license number';
COMMENT ON COLUMN athletes.best_total IS 'Best career total in kilograms (Snatch + Clean & Jerk)';
COMMENT ON COLUMN athletes.coach_name IS 'Name of the athlete''s coach';

-- Verify the new columns were added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'athletes' 
AND column_name IN ('id_number', 'registration_number', 'best_total', 'coach_name')
ORDER BY ordinal_position;
