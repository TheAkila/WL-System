-- Migration: Add Jury Override Support
-- Description: Adds fields to support IWF jury override functionality
-- Date: 2026-01-22

-- Add jury override fields to attempts table
ALTER TABLE attempts 
ADD COLUMN jury_override BOOLEAN DEFAULT false,
ADD COLUMN jury_decision attempt_result,
ADD COLUMN jury_reason TEXT,
ADD COLUMN jury_timestamp TIMESTAMP WITH TIME ZONE;

-- Add comments for documentation
COMMENT ON COLUMN attempts.jury_override IS 'Whether jury has overridden the referee decision';
COMMENT ON COLUMN attempts.jury_decision IS 'Jury decision that overrides referee decisions (IWF Rule 3.3.5)';
COMMENT ON COLUMN attempts.jury_reason IS 'Reason provided by jury for the override';
COMMENT ON COLUMN attempts.jury_timestamp IS 'When the jury override was recorded';

-- Update the result calculation to consider jury override
-- This function is called when referee decisions are recorded
CREATE OR REPLACE FUNCTION update_attempt_result()
RETURNS TRIGGER AS $$
BEGIN
    -- If jury has overridden, use jury decision
    IF NEW.jury_override = true AND NEW.jury_decision IS NOT NULL THEN
        NEW.result := NEW.jury_decision;
        RETURN NEW;
    END IF;
    
    -- Otherwise, calculate based on referee decisions
    IF NEW.referee_left IS NOT NULL AND NEW.referee_center IS NOT NULL AND NEW.referee_right IS NOT NULL THEN
        -- Count good decisions
        DECLARE
            good_count INTEGER := 0;
        BEGIN
            IF NEW.referee_left = 'good' THEN good_count := good_count + 1; END IF;
            IF NEW.referee_center = 'good' THEN good_count := good_count + 1; END IF;
            IF NEW.referee_right = 'good' THEN good_count := good_count + 1; END IF;
            
            -- Majority rules (2 out of 3)
            IF good_count >= 2 THEN
                NEW.result := 'good';
            ELSE
                NEW.result := 'no-lift';
            END IF;
        END;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update result
DROP TRIGGER IF EXISTS trigger_update_attempt_result ON attempts;
CREATE TRIGGER trigger_update_attempt_result
    BEFORE UPDATE ON attempts
    FOR EACH ROW
    EXECUTE FUNCTION update_attempt_result();

-- Index for querying jury overrides
CREATE INDEX idx_attempts_jury_override ON attempts(jury_override) WHERE jury_override = true;
