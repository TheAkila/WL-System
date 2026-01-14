# Supabase Database Setup Guide

## Initial Setup

1. **Create a new Supabase project** at [supabase.com](https://supabase.com)

2. **Run the schema**:
   - Go to SQL Editor in Supabase Dashboard
   - Copy and paste the contents of `schema.sql`
   - Click "Run"

3. **Run migrations** (optional enhancements):
   ```sql
   -- Run in order:
   -- migrations/001_lifting_order.sql
   ```

## Schema Overview

### Core Tables

- **competitions**: Competition details and status
- **sessions**: Competition sessions by weight category and gender
- **teams**: Teams/clubs participating
- **athletes**: Athlete information with calculated fields
- **attempts**: Individual lift attempts with referee decisions
- **users**: System users with roles

### Automatic Calculations

The database automatically updates:
- ✅ Best snatch (highest successful attempt)
- ✅ Best clean & jerk (highest successful attempt)
- ✅ Total (best snatch + best clean & jerk)
- ✅ Sinclair total (for cross-category comparison)
- ✅ Rankings with tie-breaking logic

### Tie-Breaking Logic

Rankings are determined by:
1. **Total weight** (highest wins)
2. **Body weight** (if totals equal, lighter wins)
3. **Start number** (if still tied, who lifted first wins)

This is implemented in the `update_session_rankings()` function.

## Key Functions

### Calculate Rankings
```sql
SELECT update_session_rankings('session-uuid');
```

### Get Lifting Order
```sql
SELECT * FROM get_lifting_order('session-uuid');
```

### Declare Attempt
```sql
SELECT declare_attempt('athlete-uuid', 120); -- 120kg attempt
```

### Record Referee Decision
```sql
SELECT record_referee_decision('attempt-uuid', 'center', 'good');
-- Positions: 'left', 'center', 'right'
-- Decisions: 'good', 'no-lift'
```

## Views

### Leaderboard
```sql
SELECT * FROM leaderboard 
WHERE session_id = 'session-uuid' 
ORDER BY rank;
```

### Current Session Athletes
```sql
SELECT * FROM current_session_athletes;
```

### Team Standings
```sql
SELECT * FROM team_standings 
WHERE competition_id = 'competition-uuid';
```

## Realtime Subscriptions

Enable realtime updates in your application:

```javascript
// Subscribe to attempt changes
const subscription = supabase
  .channel('attempts')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'attempts' },
    (payload) => {
      console.log('Attempt updated:', payload);
    }
  )
  .subscribe();

// Subscribe to athlete rankings
const athleteSubscription = supabase
  .channel('athletes')
  .on('postgres_changes',
    { event: 'UPDATE', schema: 'public', table: 'athletes' },
    (payload) => {
      console.log('Athlete updated:', payload);
    }
  )
  .subscribe();
```

## Environment Variables

Update your backend `.env` file:

```env
# Replace MongoDB with Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key

# Comment out MongoDB
# MONGODB_URI=...
```

## Example Workflow

### 1. Create Competition
```sql
INSERT INTO competitions (name, date, location, status)
VALUES ('State Championships 2026', '2026-03-20', 'New York', 'active')
RETURNING id;
```

### 2. Create Session
```sql
INSERT INTO sessions (competition_id, name, weight_category, gender, status)
VALUES ('competition-uuid', 'Women 64kg', '64', 'female', 'scheduled')
RETURNING id;
```

### 3. Register Athletes
```sql
INSERT INTO athletes (
  name, country, gender, weight_category, 
  body_weight, start_number, session_id
)
VALUES 
  ('Sarah Jones', 'USA', 'female', '64', 63.5, 1, 'session-uuid'),
  ('Emma Smith', 'CAN', 'female', '64', 63.8, 2, 'session-uuid')
RETURNING id;
```

### 4. Start Session
```sql
UPDATE sessions 
SET status = 'in-progress', start_time = NOW()
WHERE id = 'session-uuid';
```

### 5. Record Attempt
```sql
-- Athlete declares 90kg snatch
SELECT declare_attempt('athlete-uuid', 90);

-- Referees vote
SELECT record_referee_decision('attempt-uuid', 'left', 'good');
SELECT record_referee_decision('attempt-uuid', 'center', 'good');
SELECT record_referee_decision('attempt-uuid', 'right', 'no-lift');
-- Result: 'good' (2 out of 3)
-- Athlete totals and rankings automatically updated!
```

### 6. View Results
```sql
SELECT * FROM leaderboard 
WHERE session_id = 'session-uuid'
ORDER BY rank;
```

## Migration from MongoDB

If you're migrating from the existing MongoDB setup:

1. Export your MongoDB data
2. Transform to match PostgreSQL schema
3. Use Supabase's bulk insert or migration tools
4. Update backend code to use Supabase client instead of Mongoose

## Performance Tips

1. **Indexes**: Already created for common queries
2. **Realtime**: Only subscribe to channels you need
3. **RLS Policies**: Configure based on your auth requirements
4. **Materialized Views**: Consider for complex aggregations

## Security

- Row Level Security (RLS) is enabled
- Public read access is allowed by default
- Configure write policies based on your auth setup
- Use service role key only on backend, never expose to frontend

## Backup

Supabase automatically backs up your database. You can also:
- Download backups from Supabase Dashboard
- Set up point-in-time recovery
- Export schema and data periodically

## Support

- Supabase Docs: https://supabase.com/docs
- SQL Reference: https://www.postgresql.org/docs/
- Weightlifting Rules: https://iwf.sport/
