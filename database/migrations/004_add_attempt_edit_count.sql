-- Migration: Add edit_count to attempts table
-- Purpose: Track number of weight changes per attempt (IWF allows 3 changes max)

ALTER TABLE attempts 
ADD COLUMN edit_count INTEGER DEFAULT 0 CHECK (edit_count >= 0 AND edit_count <= 3);

COMMENT ON COLUMN attempts.edit_count IS 'Number of times attempt weight has been changed (max 3 per IWF rules)';
