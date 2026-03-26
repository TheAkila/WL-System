-- Patch: refresh mark_athlete_weighed_in without touching enums/tables
-- Safe to run on existing DB; only replaces the function
-- Usage: psql "<connection>" -f database/patches/006_mark_athlete_weighed_in_patch.sql
\set ON_ERROR_STOP on
BEGIN;

CREATE OR REPLACE FUNCTION mark_athlete_weighed_in(
    p_athlete_id UUID,
    p_body_weight_kg DECIMAL,
    p_start_weight_kg DECIMAL DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_session_id UUID;
    v_total_athletes INT;
    v_weighed_in INT;
BEGIN
    -- Update athlete weigh-in and capture session
    UPDATE athletes
    SET
        weighed_in = TRUE,
        body_weight_kg = p_body_weight_kg,
        start_weight_kg = COALESCE(p_start_weight_kg, p_body_weight_kg + 5),
        weigh_in_date = CURRENT_TIMESTAMP,
        weigh_in_completed_at = COALESCE(weigh_in_completed_at, CURRENT_TIMESTAMP)
    WHERE id = p_athlete_id
    RETURNING session_id INTO v_session_id;

    IF NOT FOUND OR v_session_id IS NULL THEN
        RAISE EXCEPTION 'Athlete not found or not assigned to session: %', p_athlete_id;
    END IF;

    -- Refresh progression lock counters so buttons unlock when all weighed
    SELECT
        COUNT(*)::INT,
        COUNT(*) FILTER (WHERE weighed_in = TRUE)::INT
    INTO v_total_athletes, v_weighed_in
    FROM athletes
    WHERE session_id = v_session_id;

    UPDATE session_progression_locks
    SET
        weigh_in_required_athletes = v_total_athletes,
        weigh_in_completed_count = v_weighed_in,
        start_competition_button_enabled = CASE
            WHEN v_total_athletes > 0 AND v_total_athletes = v_weighed_in THEN TRUE
            ELSE start_competition_button_enabled
        END,
        updated_at = CURRENT_TIMESTAMP
    WHERE session_id = v_session_id;

    RETURN jsonb_build_object(
        'success', TRUE,
        'athlete_id', p_athlete_id,
        'body_weight_kg', p_body_weight_kg,
        'start_weight_kg', COALESCE(p_start_weight_kg, p_body_weight_kg + 5),
        'session_id', v_session_id,
        'weighed_in_count', v_weighed_in,
        'total_athletes', v_total_athletes,
        'timestamp', CURRENT_TIMESTAMP
    );
END;
$$;

COMMIT;
