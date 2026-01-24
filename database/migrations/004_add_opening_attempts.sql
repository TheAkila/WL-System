-- Migration: Add opening attempt fields to athletes table
-- This allows storing opening snatch and clean & jerk declarations from weigh-in
-- These can be auto-populated into competition attempts

ALTER TABLE athletes
ADD COLUMN IF NOT EXISTS opening_snatch INTEGER,
ADD COLUMN IF NOT EXISTS opening_clean_jerk INTEGER,
ADD COLUMN IF NOT EXISTS lot_number INTEGER,
ADD COLUMN IF NOT EXISTS weigh_in_completed_at TIMESTAMP WITH TIME ZONE;

-- Create index for weigh_in_completed_at to speed up queries
CREATE INDEX IF NOT EXISTS idx_athletes_weigh_in_completed ON athletes(weigh_in_completed_at);

-- Add constraints (only if they don't already exist)
DO $$
BEGIN
  BEGIN
    ALTER TABLE athletes ADD CONSTRAINT check_opening_snatch_positive CHECK (opening_snatch IS NULL OR opening_snatch > 0);
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
  
  BEGIN
    ALTER TABLE athletes ADD CONSTRAINT check_opening_clean_jerk_positive CHECK (opening_clean_jerk IS NULL OR opening_clean_jerk > 0);
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
  
  BEGIN
    ALTER TABLE athletes ADD CONSTRAINT check_lot_number_positive CHECK (lot_number IS NULL OR lot_number > 0);
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;
