-- =====================================================
-- MIGRATION: Single Competition System
-- =====================================================
-- This migration converts the multi-competition system to single competition
-- - Makes competition table singleton (only one active competition)
-- - Simplifies session relationship
-- - Adds constraints to ensure data integrity
-- =====================================================

-- Add constraint to ensure only one competition can be active at a time
-- (We'll enforce singleton at application level, but this helps prevent multiple active)
CREATE OR REPLACE FUNCTION enforce_single_active_competition()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'active' THEN
    -- Set all other competitions to non-active
    UPDATE competitions 
    SET status = CASE 
      WHEN status = 'active' AND id != NEW.id THEN 'completed'
      ELSE status
    END
    WHERE id != NEW.id AND status = 'active';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_single_active_competition
  BEFORE INSERT OR UPDATE ON competitions
  FOR EACH ROW
  EXECUTE FUNCTION enforce_single_active_competition();

-- Add comment to competitions table to indicate singleton pattern
COMMENT ON TABLE competitions IS 'Singleton table - system manages ONE competition at a time. Only one competition should be active.';

-- Update sessions to auto-assign to active competition if competition_id is null
CREATE OR REPLACE FUNCTION auto_assign_competition_to_session()
RETURNS TRIGGER AS $$
DECLARE
  v_competition_id UUID;
BEGIN
  -- If competition_id is not set, auto-assign to the active competition
  IF NEW.competition_id IS NULL THEN
    SELECT id INTO v_competition_id
    FROM competitions
    WHERE status = 'active'
    LIMIT 1;
    
    IF v_competition_id IS NOT NULL THEN
      NEW.competition_id := v_competition_id;
    ELSE
      -- If no active competition, get the most recent one
      SELECT id INTO v_competition_id
      FROM competitions
      ORDER BY created_at DESC
      LIMIT 1;
      
      NEW.competition_id := v_competition_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_assign_competition
  BEFORE INSERT ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_competition_to_session();

-- Optional: Add a view for easy access to the current competition
CREATE OR REPLACE VIEW current_competition AS
SELECT * FROM competitions
WHERE status = 'active'
LIMIT 1;

COMMENT ON VIEW current_competition IS 'View showing the currently active competition (singleton)';
