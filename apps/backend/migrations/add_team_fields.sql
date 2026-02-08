-- Add manager_name and age_category to teams table
-- Also expand country column to support longer team codes

ALTER TABLE teams ADD COLUMN IF NOT EXISTS manager_name VARCHAR(255);
ALTER TABLE teams ADD COLUMN IF NOT EXISTS age_category VARCHAR(50);

-- Drop dependent views
DROP VIEW IF EXISTS team_standings CASCADE;

-- Drop the unique constraint temporarily
ALTER TABLE teams DROP CONSTRAINT IF EXISTS teams_name_country_key;

-- Expand country column to support longer team codes (not just 3-letter codes)
ALTER TABLE teams ALTER COLUMN country TYPE VARCHAR(50);

-- Recreate the unique constraint
ALTER TABLE teams ADD CONSTRAINT teams_name_country_key UNIQUE (name, country);

-- Recreate the team_standings view
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

-- Update existing teams with default values if needed
COMMENT ON COLUMN teams.manager_name IS 'Name of the team manager/coach/captain';
COMMENT ON COLUMN teams.age_category IS 'Age category: Youth, Junior, or Senior';
COMMENT ON COLUMN teams.country IS 'Team code (can be country code like LKA, USA or custom identifier like TEAM01)';
