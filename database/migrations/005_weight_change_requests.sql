-- Weight Change Requests Migration
-- Tracks athlete weight change requests during competition

-- Create weight_change_requests table
CREATE TABLE IF NOT EXISTS weight_change_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  lift_type VARCHAR(20) NOT NULL CHECK (lift_type IN ('snatch', 'clean_jerk')),
  attempt_number INTEGER NOT NULL CHECK (attempt_number BETWEEN 1 AND 3),
  old_weight INTEGER NOT NULL CHECK (old_weight > 0),
  new_weight INTEGER NOT NULL CHECK (new_weight > 0),
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  requested_by UUID REFERENCES users(id),
  approved BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure new weight is higher than old weight (IWF rule)
  CONSTRAINT check_weight_increase CHECK (new_weight > old_weight),
  
  -- Ensure minimum 1kg increase (IWF rule)
  CONSTRAINT check_minimum_increase CHECK ((new_weight - old_weight) >= 1)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_weight_changes_athlete ON weight_change_requests(athlete_id);
CREATE INDEX IF NOT EXISTS idx_weight_changes_session ON weight_change_requests(session_id);
CREATE INDEX IF NOT EXISTS idx_weight_changes_lift_type ON weight_change_requests(lift_type);
CREATE INDEX IF NOT EXISTS idx_weight_changes_requested_at ON weight_change_requests(requested_at DESC);

-- Create view to count changes per athlete per lift
CREATE OR REPLACE VIEW athlete_weight_change_count AS
SELECT 
  athlete_id,
  lift_type,
  COUNT(*) as change_count
FROM weight_change_requests
WHERE approved = true
GROUP BY athlete_id, lift_type;

-- Add comment
COMMENT ON TABLE weight_change_requests IS 'Tracks athlete weight change requests during competition (IWF allows up to 2 changes per lift type)';

-- Verify the table was created
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'weight_change_requests'
ORDER BY ordinal_position;
