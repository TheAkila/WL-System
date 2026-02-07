-- =====================================================
-- LIFTING LIVE ARENA - SUPABASE POSTGRESQL SCHEMA
-- =====================================================
-- This schema includes:
-- - Core tables for competitions, sessions, teams, athletes, and attempts
-- - Automatic triggers for updating best lifts, totals, and rankings
-- - Tie-break logic using bodyweight
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUM TYPES
-- =====================================================

CREATE TYPE competition_status AS ENUM ('upcoming', 'active', 'completed', 'cancelled');
CREATE TYPE session_status AS ENUM ('scheduled', 'in-progress', 'completed', 'cancelled');
CREATE TYPE lift_type AS ENUM ('snatch', 'clean_and_jerk');
CREATE TYPE attempt_result AS ENUM ('pending', 'good', 'no-lift');
CREATE TYPE referee_decision AS ENUM ('good', 'no-lift');
CREATE TYPE gender_type AS ENUM ('male', 'female');
CREATE TYPE user_role AS ENUM ('admin', 'technical', 'referee', 'viewer');

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'viewer',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Competitions table
CREATE TABLE competitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    location VARCHAR(255) NOT NULL,
    organizer VARCHAR(255),
    description TEXT,
    image_url TEXT,
    status competition_status DEFAULT 'upcoming',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Teams/Clubs table
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    country VARCHAR(3) NOT NULL, -- ISO 3166-1 alpha-3 country code
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name, country)
);

-- Sessions table
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    weight_category VARCHAR(10) NOT NULL, -- e.g., '81', '89', '+109'
    gender gender_type NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    status session_status DEFAULT 'scheduled',
    current_lift lift_type DEFAULT 'snatch',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Athletes table
CREATE TABLE athletes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    country VARCHAR(3) NOT NULL, -- ISO 3166-1 alpha-3 country code
    birth_date DATE,
    gender gender_type NOT NULL,
    weight_category VARCHAR(10) NOT NULL,
    body_weight DECIMAL(5,2), -- kg with 2 decimal places
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    start_number INTEGER,
    session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
    
    -- Calculated fields (updated by triggers)
    best_snatch INTEGER DEFAULT 0,
    best_clean_and_jerk INTEGER DEFAULT 0,
    total INTEGER DEFAULT 0,
    sinclair_total DECIMAL(8,2) DEFAULT 0,
    rank INTEGER,
    
    -- Medal and timing fields
    medal VARCHAR(10), -- 'gold', 'silver', 'bronze', or NULL
    total_completed_at TIMESTAMP WITH TIME ZONE, -- When total was first completed
    medal_manual_override BOOLEAN DEFAULT false, -- Admin can override auto-assignment
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CHECK (body_weight > 0),
    CHECK (start_number > 0)
);

-- Attempts table
CREATE TABLE attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    lift_type lift_type NOT NULL,
    attempt_number INTEGER NOT NULL CHECK (attempt_number BETWEEN 1 AND 3),
    weight INTEGER NOT NULL CHECK (weight > 0),
    result attempt_result DEFAULT 'pending',
    
    -- Referee decisions
    referee_left referee_decision,
    referee_center referee_decision,
    referee_right referee_decision,
    
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(athlete_id, lift_type, attempt_number)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_sessions_competition ON sessions(competition_id);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_athletes_session ON athletes(session_id);
CREATE INDEX idx_athletes_rank ON athletes(rank) WHERE rank IS NOT NULL;
CREATE INDEX idx_attempts_athlete ON attempts(athlete_id);
CREATE INDEX idx_attempts_session ON attempts(session_id);
CREATE INDEX idx_attempts_timestamp ON attempts(timestamp);
CREATE INDEX idx_teams_country ON teams(country);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to calculate Sinclair coefficient
CREATE OR REPLACE FUNCTION calculate_sinclair_coefficient(
    p_body_weight DECIMAL,
    p_gender gender_type
) RETURNS DECIMAL AS $$
DECLARE
    a DECIMAL;
    b DECIMAL;
    exponent DECIMAL;
BEGIN
    -- Sinclair coefficients (2024 IWF)
    IF p_gender = 'male' THEN
        a := 0.794358;
        b := 175.508;
    ELSE
        a := 0.897260;
        b := 153.757;
    END IF;
    
    -- If bodyweight >= b, coefficient is 1
    IF p_body_weight >= b THEN
        RETURN 1;
    END IF;
    
    -- Calculate Sinclair coefficient
    exponent := a * POWER(LOG(10, p_body_weight / b), 2);
    RETURN POWER(10, exponent);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to validate attempt result based on referee decisions
CREATE OR REPLACE FUNCTION validate_attempt_result(
    p_left referee_decision,
    p_center referee_decision,
    p_right referee_decision
) RETURNS attempt_result AS $$
DECLARE
    good_count INTEGER := 0;
BEGIN
    -- If not all decisions are in, return pending
    IF p_left IS NULL OR p_center IS NULL OR p_right IS NULL THEN
        RETURN 'pending';
    END IF;
    
    -- Count good lifts
    IF p_left = 'good' THEN good_count := good_count + 1; END IF;
    IF p_center = 'good' THEN good_count := good_count + 1; END IF;
    IF p_right = 'good' THEN good_count := good_count + 1; END IF;
    
    -- Majority rules (2 out of 3)
    IF good_count >= 2 THEN
        RETURN 'good';
    ELSE
        RETURN 'no-lift';
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to update athlete's best lifts and totals
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

-- Function to update rankings for a session with official IWF tie-breaking
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

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger to auto-validate attempt result when referee decisions change
CREATE OR REPLACE FUNCTION trigger_validate_attempt()
RETURNS TRIGGER AS $$
BEGIN
    NEW.result := validate_attempt_result(
        NEW.referee_left,
        NEW.referee_center,
        NEW.referee_right
    );
    NEW.updated_at := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_attempt_on_update
    BEFORE INSERT OR UPDATE OF referee_left, referee_center, referee_right
    ON attempts
    FOR EACH ROW
    EXECUTE FUNCTION trigger_validate_attempt();

-- Trigger to update athlete totals when attempt result changes
CREATE OR REPLACE FUNCTION trigger_update_athlete_totals()
RETURNS TRIGGER AS $$
BEGIN
    -- Update totals for the affected athlete
    PERFORM update_athlete_totals(NEW.athlete_id);
    
    -- Update rankings for the session
    PERFORM update_session_rankings(
        (SELECT session_id FROM athletes WHERE id = NEW.athlete_id)
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_totals_on_attempt_change
    AFTER INSERT OR UPDATE OF result
    ON attempts
    FOR EACH ROW
    WHEN (NEW.result IN ('good', 'no-lift'))
    EXECUTE FUNCTION trigger_update_athlete_totals();

-- Trigger to update rankings when athlete bodyweight changes
CREATE OR REPLACE FUNCTION trigger_update_rankings_on_bodyweight()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.session_id IS NOT NULL AND (
        OLD.body_weight IS DISTINCT FROM NEW.body_weight OR
        OLD.total IS DISTINCT FROM NEW.total
    ) THEN
        PERFORM update_session_rankings(NEW.session_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rankings_on_bodyweight_change
    AFTER UPDATE OF body_weight, total
    ON athletes
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_rankings_on_bodyweight();

-- Trigger to update timestamps
CREATE OR REPLACE FUNCTION trigger_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_timestamp
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_timestamp();

CREATE TRIGGER update_competitions_timestamp
    BEFORE UPDATE ON competitions
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_timestamp();

CREATE TRIGGER update_teams_timestamp
    BEFORE UPDATE ON teams
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_timestamp();

CREATE TRIGGER update_sessions_timestamp
    BEFORE UPDATE ON sessions
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_timestamp();

CREATE TRIGGER update_athletes_timestamp
    BEFORE UPDATE ON athletes
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_timestamp();

-- =====================================================
-- VIEWS
-- =====================================================

-- Leaderboard view with all calculated data
CREATE OR REPLACE VIEW leaderboard AS
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
    s.id as session_id,
    s.name as session_name,
    c.id as competition_id,
    c.name as competition_name,
    t.name as team_name,
    -- Attempt counts
    (SELECT COUNT(*) FROM attempts WHERE athlete_id = a.id AND lift_type = 'snatch') as snatch_attempts_taken,
    (SELECT COUNT(*) FROM attempts WHERE athlete_id = a.id AND lift_type = 'clean_and_jerk') as clean_jerk_attempts_taken
FROM athletes a
LEFT JOIN sessions s ON a.session_id = s.id
LEFT JOIN competitions c ON s.competition_id = c.id
LEFT JOIN teams t ON a.team_id = t.id
ORDER BY a.rank NULLS LAST;

-- Current session view (athletes in active sessions)
CREATE OR REPLACE VIEW current_session_athletes AS
SELECT 
    l.*
FROM leaderboard l
INNER JOIN sessions s ON l.session_id = s.id
WHERE s.status = 'in-progress'
ORDER BY l.rank NULLS LAST;

-- Team standings view
CREATE OR REPLACE VIEW team_standings AS
SELECT 
    t.id as team_id,
    t.name as team_name,
    t.country,
    c.id as competition_id,
    c.name as competition_name,
    COUNT(DISTINCT a.id) as athlete_count,
    SUM(a.total) as team_total,
    AVG(a.sinclair_total) as avg_sinclair,
    COUNT(CASE WHEN a.rank = 1 THEN 1 END) as gold_medals,
    COUNT(CASE WHEN a.rank = 2 THEN 1 END) as silver_medals,
    COUNT(CASE WHEN a.rank = 3 THEN 1 END) as bronze_medals
FROM teams t
LEFT JOIN athletes a ON t.id = a.team_id
LEFT JOIN sessions s ON a.session_id = s.id
LEFT JOIN competitions c ON s.competition_id = c.id
GROUP BY t.id, t.name, t.country, c.id, c.name
ORDER BY team_total DESC;

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================
-- Enable RLS on all tables for Supabase security

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE athletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;

-- Public read access for competitions, sessions, athletes, attempts (read-only for viewers)
CREATE POLICY "Public read access" ON competitions FOR SELECT USING (true);
CREATE POLICY "Public read access" ON teams FOR SELECT USING (true);
CREATE POLICY "Public read access" ON sessions FOR SELECT USING (true);
CREATE POLICY "Public read access" ON athletes FOR SELECT USING (true);
CREATE POLICY "Public read access" ON attempts FOR SELECT USING (true);

-- Admin full access (you can integrate with Supabase auth)
-- CREATE POLICY "Admin full access" ON competitions FOR ALL USING (auth.jwt()->>'role' = 'admin');
-- CREATE POLICY "Admin full access" ON sessions FOR ALL USING (auth.jwt()->>'role' = 'admin');
-- CREATE POLICY "Admin full access" ON athletes FOR ALL USING (auth.jwt()->>'role' = 'admin');
-- CREATE POLICY "Admin full access" ON attempts FOR ALL USING (auth.jwt()->>'role' = 'admin');

-- =====================================================
-- SAMPLE DATA (for testing - DISABLED)
-- =====================================================
-- NOTE: Sample data auto-insert has been disabled.
-- Uncomment the queries below if you want to populate test data manually.

-- -- Insert sample competition
-- INSERT INTO competitions (name, date, location, status) VALUES
-- ('National Championships 2026', '2026-03-15', 'Los Angeles, CA', 'active');

-- -- Insert sample teams
-- INSERT INTO teams (name, country) VALUES
-- ('USA Weightlifting', 'USA'),
-- ('Canadian Weightlifting', 'CAN');

-- -- Insert sample session
-- INSERT INTO sessions (competition_id, name, weight_category, gender, status)
-- SELECT id, 'Men 81kg Session', '81', 'male', 'in-progress'
-- FROM competitions WHERE name = 'National Championships 2026';

-- -- Insert sample athletes
-- INSERT INTO athletes (name, country, gender, weight_category, body_weight, start_number, session_id, team_id)
-- SELECT 
--     'John Smith', 'USA', 'male', '81', 80.5, 1, s.id, t.id
-- FROM sessions s
-- CROSS JOIN teams t
-- WHERE s.name = 'Men 81kg Session' AND t.name = 'USA Weightlifting';

-- INSERT INTO athletes (name, country, gender, weight_category, body_weight, start_number, session_id, team_id)
-- SELECT 
--     'Mike Johnson', 'CAN', 'male', '81', 80.8, 2, s.id, t.id
-- FROM sessions s
-- CROSS JOIN teams t
-- WHERE s.name = 'Men 81kg Session' AND t.name = 'Canadian Weightlifting';

-- =====================================================
-- HELPFUL QUERIES
-- =====================================================

-- Query to get current leaderboard for a session
-- SELECT * FROM leaderboard WHERE session_id = 'your-session-id' ORDER BY rank;

-- Query to get team standings
-- SELECT * FROM team_standings WHERE competition_id = 'your-competition-id';

-- Query to manually recalculate rankings for a session
-- SELECT update_session_rankings('your-session-id');

-- Query to manually update athlete totals
-- SELECT update_athlete_totals('your-athlete-id');

-- =====================================================
-- NOTES
-- =====================================================
-- 1. Triggers automatically update:
--    - Attempt results when referee decisions are entered
--    - Athlete best lifts and totals when attempts are validated
--    - Rankings with tie-breaking (higher total > lighter bodyweight > lower start number)
--
-- 2. Tie-breaking logic:
--    - Primary: Highest total wins
--    - Secondary: If totals equal, lighter bodyweight wins
--    - Tertiary: If still tied, lower start number wins (lifted first)
--
-- 3. Sinclair coefficient is automatically calculated for cross-category comparisons
--
-- 4. All timestamps are automatically managed
--
-- 5. RLS policies allow public read access but you should configure
--    write access based on your Supabase authentication
-- =====================================================
