-- Migration: Add multi-class weight support to sessions
-- Description: Allow sessions to manage multiple weight classes simultaneously
-- Created: 2026-01-25

-- Add weight_classes column to store selected weight classes
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS weight_classes TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add comment explaining the column
COMMENT ON COLUMN sessions.weight_classes IS 'Array of weight class categories included in this session (e.g., ["88kg", "58kg", "96kg"])';

-- Create index for filtering sessions by weight class
CREATE INDEX IF NOT EXISTS idx_sessions_weight_classes ON sessions USING GIN(weight_classes);

-- Add active_weight_class to track which class is currently being worked on (optional, for future multi-phase tracking)
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS active_weight_class TEXT DEFAULT NULL;

COMMENT ON COLUMN sessions.active_weight_class IS 'Current weight class being actively managed (can be NULL if managing all simultaneously)';

-- Create view for sessions with their weight classes
CREATE OR REPLACE VIEW sessions_with_classes AS
SELECT 
  s.id,
  s.name,
  s.competition_id,
  s.state,
  s.weight_classes,
  s.active_weight_class,
  COUNT(DISTINCT a.id) as total_athletes,
  COUNT(DISTINCT a.weight_category) as unique_weight_classes,
  s.created_at,
  s.updated_at
FROM sessions s
LEFT JOIN athletes a ON a.session_id = s.id
GROUP BY s.id, s.name, s.competition_id, s.state, s.weight_classes, s.active_weight_class, s.created_at, s.updated_at;

COMMENT ON VIEW sessions_with_classes IS 'View showing sessions with weight class and athlete statistics';

-- Sample migration data (optional - uncomment if migrating existing sessions)
-- UPDATE sessions SET weight_classes = ARRAY[weight_category] 
-- WHERE weight_classes IS NULL OR weight_classes = ARRAY[]::TEXT[];
