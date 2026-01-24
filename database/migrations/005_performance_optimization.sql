-- =====================================================
-- MIGRATION: Database Performance Optimization
-- =====================================================
-- This migration adds composite indexes and optimizations
-- for faster queries and better scalability
-- Run: psql -d your_db -f 005_performance_optimization.sql
-- =====================================================

-- =====================================================
-- ADD COMPOSITE INDEXES
-- =====================================================

-- Index for session queries with status filtering
CREATE INDEX IF NOT EXISTS idx_sessions_competition_status 
  ON sessions(competition_id, status);

-- Index for athlete queries by session
CREATE INDEX IF NOT EXISTS idx_athletes_session_gender 
  ON athletes(session_id, gender);

-- Index for athlete queries by weight category
CREATE INDEX IF NOT EXISTS idx_athletes_weight_category 
  ON athletes(weight_category, gender);

-- Index for attempt queries by athlete and lift type
CREATE INDEX IF NOT EXISTS idx_attempts_athlete_lifttype 
  ON attempts(athlete_id, lift_type);

-- Index for attempt queries by session and lift type
CREATE INDEX IF NOT EXISTS idx_attempts_session_lifttype 
  ON attempts(session_id, lift_type);

-- Index for attempt queries with timestamp
CREATE INDEX IF NOT EXISTS idx_attempts_session_timestamp 
  ON attempts(session_id, timestamp DESC);

-- Index for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_athletes_session_rank 
  ON athletes(session_id, rank);

-- Index for team queries
CREATE INDEX IF NOT EXISTS idx_teams_country_name 
  ON teams(country, name);

-- Index for competition queries
CREATE INDEX IF NOT EXISTS idx_competitions_status 
  ON competitions(status);

-- =====================================================
-- OPTIMIZE LEADERBOARD VIEW
-- =====================================================

-- Cache attempt counts in materialized view for faster access
CREATE MATERIALIZED VIEW IF NOT EXISTS leaderboard_optimized AS
SELECT 
    a.id as athlete_id,
    a.name as athlete_name,
    a.country,
    a.gender,
    a.weight_category,
    a.body_weight,
    a.start_number,
    a.best_snatch,
    a.best_clean_and_jerk,
    a.total,
    a.sinclair_total,
    a.rank,
    a.medal,
    s.id as session_id,
    s.name as session_name,
    s.status as session_status,
    c.id as competition_id,
    c.name as competition_name,
    t.id as team_id,
    t.name as team_name,
    t.country as team_country,
    -- Precomputed attempt counts
    COALESCE(sc.snatch_count, 0) as snatch_attempts_taken,
    COALESCE(cj.clean_jerk_count, 0) as clean_jerk_attempts_taken,
    -- Next attempt info
    COALESCE(next_att.lift_type, NULL) as next_lift_type,
    COALESCE(next_att.attempt_number, NULL) as next_attempt_number,
    COALESCE(next_att.weight, NULL) as next_weight
FROM athletes a
LEFT JOIN sessions s ON a.session_id = s.id
LEFT JOIN competitions c ON s.competition_id = c.id
LEFT JOIN teams t ON a.team_id = t.id
LEFT JOIN (
    SELECT athlete_id, COUNT(*) as snatch_count
    FROM attempts
    WHERE lift_type = 'snatch'
    GROUP BY athlete_id
) sc ON a.id = sc.athlete_id
LEFT JOIN (
    SELECT athlete_id, COUNT(*) as clean_jerk_count
    FROM attempts
    WHERE lift_type = 'clean_and_jerk'
    GROUP BY athlete_id
) cj ON a.id = cj.athlete_id
LEFT JOIN LATERAL (
    SELECT lift_type, attempt_number, weight
    FROM attempts
    WHERE athlete_id = a.id
      AND result = 'pending'
    ORDER BY timestamp DESC
    LIMIT 1
) next_att ON true
ORDER BY a.rank NULLS LAST;

-- Index on materialized view for fast queries
CREATE INDEX IF NOT EXISTS idx_leaderboard_optimized_session 
  ON leaderboard_optimized(session_id);

-- =====================================================
-- FUNCTION: Refresh Leaderboard Cache
-- =====================================================

CREATE OR REPLACE FUNCTION refresh_leaderboard_cache()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard_optimized;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGER: Auto-refresh Leaderboard on Changes
-- =====================================================

-- Trigger for athletes table changes
CREATE OR REPLACE FUNCTION trigger_refresh_leaderboard()
RETURNS TRIGGER AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard_optimized;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if any
DROP TRIGGER IF EXISTS trg_refresh_leaderboard_athletes ON athletes;
DROP TRIGGER IF EXISTS trg_refresh_leaderboard_attempts ON attempts;

-- Create new triggers
CREATE TRIGGER trg_refresh_leaderboard_athletes
AFTER INSERT OR UPDATE OR DELETE ON athletes
FOR EACH STATEMENT
EXECUTE FUNCTION trigger_refresh_leaderboard();

CREATE TRIGGER trg_refresh_leaderboard_attempts
AFTER INSERT OR UPDATE OR DELETE ON attempts
FOR EACH STATEMENT
EXECUTE FUNCTION trigger_refresh_leaderboard();

-- =====================================================
-- FUNCTION: Get Athletes with Relations (Optimized)
-- =====================================================

CREATE OR REPLACE FUNCTION get_athletes_optimized(
    p_session_id UUID DEFAULT NULL,
    p_gender gender_type DEFAULT NULL,
    p_limit INTEGER DEFAULT 100,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    athlete_id UUID,
    name VARCHAR,
    country VARCHAR,
    gender gender_type,
    weight_category VARCHAR,
    body_weight DECIMAL,
    start_number INTEGER,
    best_snatch INTEGER,
    best_clean_and_jerk INTEGER,
    total INTEGER,
    rank INTEGER,
    session_id UUID,
    session_name VARCHAR,
    team_id UUID,
    team_name VARCHAR,
    team_country VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.name,
        a.country,
        a.gender,
        a.weight_category,
        a.body_weight,
        a.start_number,
        a.best_snatch,
        a.best_clean_and_jerk,
        a.total,
        a.rank,
        s.id,
        s.name,
        t.id,
        t.name,
        t.country
    FROM athletes a
    LEFT JOIN sessions s ON a.session_id = s.id
    LEFT JOIN teams t ON a.team_id = t.id
    WHERE (p_session_id IS NULL OR a.session_id = p_session_id)
      AND (p_gender IS NULL OR a.gender = p_gender)
    ORDER BY a.start_number ASC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION: Get Session with Relations (Optimized)
-- =====================================================

CREATE OR REPLACE FUNCTION get_session_optimized(p_session_id UUID)
RETURNS TABLE (
    session_id UUID,
    name VARCHAR,
    weight_category VARCHAR,
    gender gender_type,
    status session_status,
    current_lift lift_type,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    competition_id UUID,
    competition_name VARCHAR,
    athlete_count INTEGER,
    completed_attempts INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.name,
        s.weight_category,
        s.gender,
        s.status,
        s.current_lift,
        s.start_time,
        s.end_time,
        c.id,
        c.name,
        (SELECT COUNT(*) FROM athletes WHERE session_id = p_session_id)::INTEGER,
        (SELECT COUNT(*) FROM attempts WHERE session_id = p_session_id AND result != 'pending')::INTEGER
    FROM sessions s
    LEFT JOIN competitions c ON s.competition_id = c.id
    WHERE s.id = p_session_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION: Get Attempts Optimized with Pagination
-- =====================================================

CREATE OR REPLACE FUNCTION get_attempts_optimized(
    p_session_id UUID DEFAULT NULL,
    p_athlete_id UUID DEFAULT NULL,
    p_lift_type lift_type DEFAULT NULL,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    attempt_id UUID,
    athlete_id UUID,
    athlete_name VARCHAR,
    lift_type lift_type,
    attempt_number INTEGER,
    weight INTEGER,
    result attempt_result,
    timestamp TIMESTAMP WITH TIME ZONE,
    session_id UUID
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        att.id,
        att.athlete_id,
        a.name,
        att.lift_type,
        att.attempt_number,
        att.weight,
        att.result,
        att.timestamp,
        att.session_id
    FROM attempts att
    JOIN athletes a ON att.athlete_id = a.id
    WHERE (p_session_id IS NULL OR att.session_id = p_session_id)
      AND (p_athlete_id IS NULL OR att.athlete_id = p_athlete_id)
      AND (p_lift_type IS NULL OR att.lift_type = p_lift_type)
    ORDER BY att.timestamp DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VERIFY INDEXES CREATED
-- =====================================================

-- Run this query to verify all indexes:
-- SELECT indexname FROM pg_indexes 
-- WHERE tablename IN ('athletes', 'sessions', 'attempts', 'teams', 'competitions')
-- ORDER BY tablename, indexname;

-- Check index usage:
-- SELECT schemaname, tablename, indexname, idx_scan 
-- FROM pg_stat_user_indexes 
-- WHERE schemaname = 'public'
-- ORDER BY idx_scan DESC;

-- =====================================================
-- NOTES
-- =====================================================
-- 1. Materialized view refresh happens automatically on data changes
-- 2. For very large datasets, consider partitioning attempts by date
-- 3. Monitor slow queries with: 
--    SET log_min_duration_statement = 100;
-- 4. Run ANALYZE after loading test data to update statistics
-- 5. Materialized views can be manually refreshed with:
--    SELECT refresh_leaderboard_cache();
