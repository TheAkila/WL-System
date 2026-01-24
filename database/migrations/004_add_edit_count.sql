-- Add edit_count field to attempts table to track attempt modifications
-- This enforces IWF rule: attempts can be changed maximum 3 times

ALTER TABLE attempts 
ADD COLUMN IF NOT EXISTS edit_count INTEGER DEFAULT 0;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_attempts_edit_count 
ON attempts(athlete_id, session_id, lift_type, attempt_number, edit_count);

-- Add comment for documentation
COMMENT ON COLUMN attempts.edit_count IS 'Number of times this attempt has been modified. Max 3 edits allowed per IWF rules.';
