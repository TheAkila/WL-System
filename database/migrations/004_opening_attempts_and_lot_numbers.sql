-- =====================================================
-- Migration: Add Opening Attempts and Lot Numbers
-- Date: 2026-01-22
-- Description: Add fields for opening attempt declarations
--              and lot numbers for proper IWF competition flow
-- =====================================================

-- Add opening attempts and lot number to athletes table
ALTER TABLE athletes 
ADD COLUMN IF NOT EXISTS opening_snatch INTEGER,
ADD COLUMN IF NOT EXISTS opening_clean_jerk INTEGER,
ADD COLUMN IF NOT EXISTS lot_number INTEGER,
ADD COLUMN IF NOT EXISTS weigh_in_completed_at TIMESTAMP WITH TIME ZONE;

-- Add constraints
ALTER TABLE athletes 
ADD CONSTRAINT check_opening_snatch_positive 
CHECK (opening_snatch IS NULL OR opening_snatch > 0);

ALTER TABLE athletes 
ADD CONSTRAINT check_opening_clean_jerk_positive 
CHECK (opening_clean_jerk IS NULL OR opening_clean_jerk > 0);

ALTER TABLE athletes 
ADD CONSTRAINT check_lot_number_positive 
CHECK (lot_number IS NULL OR lot_number > 0);

-- Add index for lifting order queries
CREATE INDEX IF NOT EXISTS idx_athletes_opening_snatch ON athletes(opening_snatch) WHERE opening_snatch IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_athletes_opening_clean_jerk ON athletes(opening_clean_jerk) WHERE opening_clean_jerk IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_athletes_lot_number ON athletes(session_id, lot_number) WHERE lot_number IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN athletes.opening_snatch IS 'Opening snatch attempt declared during weigh-in (kg)';
COMMENT ON COLUMN athletes.opening_clean_jerk IS 'Opening clean & jerk attempt declared during weigh-in (kg)';
COMMENT ON COLUMN athletes.lot_number IS 'Random lot number assigned during weigh-in for tie-breaking when athletes have same declared weight';
COMMENT ON COLUMN athletes.weigh_in_completed_at IS 'Timestamp when weigh-in was completed and opening attempts were declared';
