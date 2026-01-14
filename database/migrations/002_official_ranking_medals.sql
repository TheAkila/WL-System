-- =====================================================
-- MIGRATION 002: Official Ranking Logic & Medals
-- =====================================================
-- Implements official IWF weightlifting ranking rules:
-- 1. Highest total wins
-- 2. If tied, athlete who completed total first wins
-- 3. Auto-assign gold/silver/bronze medals to top 3
-- 4. Allow manual medal overrides by admins
-- =====================================================

-- Add new columns to athletes table
ALTER TABLE athletes 
ADD COLUMN IF NOT EXISTS medal VARCHAR(10),
ADD COLUMN IF NOT EXISTS total_completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS medal_manual_override BOOLEAN DEFAULT false;

-- Add check constraint for medal values
ALTER TABLE athletes 
ADD CONSTRAINT check_medal_values 
CHECK (medal IN ('gold', 'silver', 'bronze') OR medal IS NULL);

-- Create index for medal queries
CREATE INDEX IF NOT EXISTS idx_athletes_medal ON athletes(medal) WHERE medal IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_athletes_total_completed ON athletes(total_completed_at);

-- Update update_athlete_totals function to set total_completed_at
CREATE OR REPLACE FUNCTION update_athlete_totals(p_athlete_id UUID)
RETURNS VOID AS $$
DECLARE
    v_best_snatch INTEGER;
    v_best_clean_and_jerk INTEGER;
    v_total INTEGER;
    v_old_total INTEGER;
    v_sinclair DECIMAL;
    v_body_weight DECIMAL;
    v_gender gender_type;
    v_total_completed_at TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Get athlete's current total and bodyweight/gender
    SELECT total, body_weight, gender, total_completed_at 
    INTO v_old_total, v_body_weight, v_gender, v_total_completed_at
    FROM athletes
    WHERE id = p_athlete_id;
    
    -- Calculate best snatch (highest successful attempt)
    SELECT COALESCE(MAX(weight), 0) INTO v_best_snatch
    FROM attempts
    WHERE athlete_id = p_athlete_id
      AND lift_type = 'snatch'
      AND result = 'good';
    
    -- Calculate best clean & jerk (highest successful attempt)
    SELECT COALESCE(MAX(weight), 0) INTO v_best_clean_and_jerk
    FROM attempts
    WHERE athlete_id = p_athlete_id
      AND lift_type = 'clean_and_jerk'
      AND result = 'good';
    
    -- Calculate total
    v_total := v_best_snatch + v_best_clean_and_jerk;
    
    -- Set total_completed_at timestamp if this is the first time total > 0
    -- (athlete just completed both lifts)
    IF v_total > 0 AND (v_old_total = 0 OR v_old_total IS NULL) AND v_total_completed_at IS NULL THEN
        v_total_completed_at := CURRENT_TIMESTAMP;
    END IF;
    
    -- Calculate Sinclair total
    IF v_body_weight IS NOT NULL AND v_body_weight > 0 AND v_total > 0 THEN
        v_sinclair := v_total * calculate_sinclair_coefficient(v_body_weight, v_gender);
    ELSE
        v_sinclair := 0;
    END IF;
    
    -- Update athlete record
    UPDATE athletes
    SET best_snatch = v_best_snatch,
        best_clean_and_jerk = v_best_clean_and_jerk,
        total = v_total,
        total_completed_at = v_total_completed_at,
        sinclair_total = v_sinclair,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_athlete_id;
END;
$$ LANGUAGE plpgsql;

-- Update ranking function with official IWF tie-breaking and auto medals
CREATE OR REPLACE FUNCTION update_session_rankings(p_session_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Update rankings using official IWF rules:
    -- 1. Higher total wins
    -- 2. If totals are equal, athlete who completed total FIRST wins (earlier timestamp)
    WITH ranked_athletes AS (
        SELECT 
            id,
            ROW_NUMBER() OVER (
                ORDER BY 
                    total DESC,
                    total_completed_at ASC NULLS LAST
            ) as new_rank
        FROM athletes
        WHERE session_id = p_session_id
          AND total > 0  -- Only rank athletes with a valid total
    )
    UPDATE athletes a
    SET rank = ra.new_rank,
        updated_at = CURRENT_TIMESTAMP
    FROM ranked_athletes ra
    WHERE a.id = ra.id;
    
    -- Clear ranks for athletes with no total
    UPDATE athletes
    SET rank = NULL,
        updated_at = CURRENT_TIMESTAMP
    WHERE session_id = p_session_id
      AND total = 0;
      
    -- Auto-assign medals to top 3 (only if not manually overridden)
    -- Gold medal (rank 1)
    UPDATE athletes
    SET medal = 'gold',
        updated_at = CURRENT_TIMESTAMP
    WHERE session_id = p_session_id
      AND rank = 1
      AND total > 0
      AND medal_manual_override = false;
      
    -- Silver medal (rank 2)
    UPDATE athletes
    SET medal = 'silver',
        updated_at = CURRENT_TIMESTAMP
    WHERE session_id = p_session_id
      AND rank = 2
      AND total > 0
      AND medal_manual_override = false;
      
    -- Bronze medal (rank 3)
    UPDATE athletes
    SET medal = 'bronze',
        updated_at = CURRENT_TIMESTAMP
    WHERE session_id = p_session_id
      AND rank = 3
      AND total > 0
      AND medal_manual_override = false;
      
    -- Clear medals for athletes ranked 4 or lower (if not manually overridden)
    UPDATE athletes
    SET medal = NULL,
        updated_at = CURRENT_TIMESTAMP
    WHERE session_id = p_session_id
      AND (rank > 3 OR rank IS NULL)
      AND medal_manual_override = false;
END;
$$ LANGUAGE plpgsql;

-- Comment to document changes
COMMENT ON COLUMN athletes.medal IS 'Medal assignment: gold, silver, bronze, or null. Auto-assigned by ranking function unless manually overridden.';
COMMENT ON COLUMN athletes.total_completed_at IS 'Timestamp when athlete first completed their total (both lifts > 0). Used for tie-breaking per IWF rules.';
COMMENT ON COLUMN athletes.medal_manual_override IS 'If true, medal assignment was manually set by admin and will not be auto-updated.';
