-- =====================================================
-- MIGRATION SCRIPT: Add Attempt to Leaderboard
-- =====================================================
-- This migration adds functionality to track the next attempt
-- for each athlete in the competition
-- =====================================================

-- Function to get athlete's next attempt
CREATE OR REPLACE FUNCTION get_next_attempt_info(p_athlete_id UUID)
RETURNS TABLE (
    lift_type lift_type,
    attempt_number INTEGER,
    requested_weight INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH attempt_counts AS (
        SELECT 
            'snatch'::lift_type as lt,
            COUNT(*) as count
        FROM attempts
        WHERE athlete_id = p_athlete_id AND lift_type = 'snatch'
        UNION ALL
        SELECT 
            'clean_and_jerk'::lift_type as lt,
            COUNT(*) as count
        FROM attempts
        WHERE athlete_id = p_athlete_id AND lift_type = 'clean_and_jerk'
    ),
    current_lift AS (
        SELECT current_lift
        FROM athletes a
        JOIN sessions s ON a.session_id = s.id
        WHERE a.id = p_athlete_id
    )
    SELECT 
        CASE 
            WHEN (SELECT count FROM attempt_counts WHERE lt = 'snatch') < 3 THEN 'snatch'::lift_type
            ELSE 'clean_and_jerk'::lift_type
        END,
        CASE 
            WHEN (SELECT count FROM attempt_counts WHERE lt = 'snatch') < 3 
            THEN (SELECT count FROM attempt_counts WHERE lt = 'snatch') + 1
            ELSE (SELECT count FROM attempt_counts WHERE lt = 'clean_and_jerk') + 1
        END,
        0; -- Weight will be set when attempt is registered
END;
$$ LANGUAGE plpgsql;

-- Enhanced leaderboard view with next attempt info
CREATE OR REPLACE VIEW leaderboard_with_next_attempt AS
SELECT 
    l.*,
    na.lift_type as next_lift_type,
    na.attempt_number as next_attempt_number
FROM leaderboard l
LEFT JOIN LATERAL get_next_attempt_info(l.athlete_id) na ON true;

-- =====================================================
-- FUNCTION: Get Lifting Order
-- =====================================================
-- Determines the order in which athletes should lift
-- based on current lift, attempt weights, and lot numbers

CREATE OR REPLACE FUNCTION get_lifting_order(p_session_id UUID)
RETURNS TABLE (
    athlete_id UUID,
    athlete_name VARCHAR,
    start_number INTEGER,
    lift_type lift_type,
    attempt_number INTEGER,
    requested_weight INTEGER,
    lifting_order INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH current_session AS (
        SELECT current_lift
        FROM sessions
        WHERE id = p_session_id
    ),
    next_attempts AS (
        SELECT 
            a.id as athlete_id,
            a.name as athlete_name,
            a.start_number,
            COALESCE(
                (SELECT MAX(weight) + 1 FROM attempts WHERE athlete_id = a.id AND lift_type = cs.current_lift),
                CASE 
                    WHEN cs.current_lift = 'snatch' THEN 50
                    ELSE 80
                END
            ) as requested_weight,
            COALESCE(
                (SELECT COUNT(*) FROM attempts WHERE athlete_id = a.id AND lift_type = cs.current_lift),
                0
            ) + 1 as attempt_number
        FROM athletes a
        CROSS JOIN current_session cs
        WHERE a.session_id = p_session_id
          AND COALESCE(
                (SELECT COUNT(*) FROM attempts WHERE athlete_id = a.id AND lift_type = cs.current_lift),
                0
            ) < 3
    )
    SELECT 
        na.athlete_id,
        na.athlete_name,
        na.start_number,
        (SELECT current_lift FROM current_session),
        na.attempt_number,
        na.requested_weight,
        ROW_NUMBER() OVER (
            ORDER BY 
                na.requested_weight ASC,
                na.attempt_number ASC,
                na.start_number ASC
        )::INTEGER as lifting_order
    FROM next_attempts na;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION: Submit Attempt Declaration
-- =====================================================

CREATE OR REPLACE FUNCTION declare_attempt(
    p_athlete_id UUID,
    p_weight INTEGER
) RETURNS UUID AS $$
DECLARE
    v_session_id UUID;
    v_current_lift lift_type;
    v_attempt_count INTEGER;
    v_attempt_id UUID;
BEGIN
    -- Get athlete's session and current lift
    SELECT a.session_id, s.current_lift
    INTO v_session_id, v_current_lift
    FROM athletes a
    JOIN sessions s ON a.session_id = s.id
    WHERE a.id = p_athlete_id;
    
    IF v_session_id IS NULL THEN
        RAISE EXCEPTION 'Athlete not assigned to a session';
    END IF;
    
    -- Count existing attempts for this lift
    SELECT COUNT(*)
    INTO v_attempt_count
    FROM attempts
    WHERE athlete_id = p_athlete_id
      AND lift_type = v_current_lift;
    
    IF v_attempt_count >= 3 THEN
        RAISE EXCEPTION 'All 3 attempts already taken for this lift';
    END IF;
    
    -- Create the attempt
    INSERT INTO attempts (
        athlete_id,
        session_id,
        lift_type,
        attempt_number,
        weight
    ) VALUES (
        p_athlete_id,
        v_session_id,
        v_current_lift,
        v_attempt_count + 1,
        p_weight
    )
    RETURNING id INTO v_attempt_id;
    
    RETURN v_attempt_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION: Record Referee Decisions
-- =====================================================

CREATE OR REPLACE FUNCTION record_referee_decision(
    p_attempt_id UUID,
    p_referee_position VARCHAR, -- 'left', 'center', or 'right'
    p_decision referee_decision
) RETURNS VOID AS $$
BEGIN
    CASE p_referee_position
        WHEN 'left' THEN
            UPDATE attempts SET referee_left = p_decision WHERE id = p_attempt_id;
        WHEN 'center' THEN
            UPDATE attempts SET referee_center = p_decision WHERE id = p_attempt_id;
        WHEN 'right' THEN
            UPDATE attempts SET referee_right = p_decision WHERE id = p_attempt_id;
        ELSE
            RAISE EXCEPTION 'Invalid referee position. Must be left, center, or right';
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- REALTIME PUBLICATION
-- =====================================================
-- Enable Supabase Realtime for live updates

-- You can enable realtime in Supabase dashboard or with:
-- ALTER PUBLICATION supabase_realtime ADD TABLE attempts;
-- ALTER PUBLICATION supabase_realtime ADD TABLE athletes;
-- ALTER PUBLICATION supabase_realtime ADD TABLE sessions;

-- =====================================================
-- USEFUL QUERIES FOR YOUR APP
-- =====================================================

-- Get current lifting order
-- SELECT * FROM get_lifting_order('your-session-id');

-- Declare an attempt
-- SELECT declare_attempt('athlete-id', 120);

-- Record referee decision
-- SELECT record_referee_decision('attempt-id', 'center', 'good');

-- Watch leaderboard with next attempts
-- SELECT * FROM leaderboard_with_next_attempt WHERE session_id = 'your-session-id';
