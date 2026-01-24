-- Migration: Add weight change tracking fields to attempts table
-- IWF Rule 6.5.1 - Weight change regulations
-- IWF Rule 6.5.5 - Three-attempt failure disqualification

-- Add weight change tracking columns to attempts
ALTER TABLE attempts 
ADD COLUMN IF NOT EXISTS weight_changed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS weight_change_timestamp TIMESTAMP WITH TIME ZONE;

-- Add disqualification tracking to athletes
ALTER TABLE athletes
ADD COLUMN IF NOT EXISTS is_dq BOOLEAN DEFAULT FALSE;

-- Add comments for documentation
COMMENT ON COLUMN attempts.weight_changed IS 'Indicates if the attempt weight was changed after initial declaration';
COMMENT ON COLUMN attempts.weight_change_timestamp IS 'Timestamp when weight was last changed';
COMMENT ON COLUMN athletes.is_dq IS 'Indicates if athlete is disqualified (failed 3 attempts or other rule violation)';

-- Create indexes for quick querying
CREATE INDEX IF NOT EXISTS idx_attempts_weight_changed ON attempts(weight_changed) WHERE weight_changed = TRUE;
CREATE INDEX IF NOT EXISTS idx_athletes_is_dq ON athletes(is_dq) WHERE is_dq = TRUE;
