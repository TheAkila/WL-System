# Official Ranking Logic & Medal System

## Overview

The Lifting Live Arena system now implements **official IWF (International Weightlifting Federation) ranking rules** with automatic medal assignment and manual override capabilities.

## Ranking Rules

### Primary Sorting (Official IWF Rules)

1. **Highest total wins**
   - Athlete with the highest combined total (snatch + clean & jerk) ranks first

2. **Tie-breaking rule: First to complete wins**
   - If two or more athletes have the same total, the athlete who **completed their total first** wins
   - A total is considered "completed" the first time an athlete has both a successful snatch AND a successful clean & jerk
   - The system records a `total_completed_at` timestamp at this moment
   - Earlier timestamp = higher rank (wins the tie-break)

### Example Scenario

```
Athlete A: Total = 300kg, completed at 14:23:15
Athlete B: Total = 300kg, completed at 14:25:30
Athlete C: Total = 295kg, completed at 14:20:00

Rankings:
1st: Athlete A (300kg, completed first among the 300kg totals)
2nd: Athlete B (300kg, completed second)
3rd: Athlete C (295kg, lower total)
```

## Medal Assignment

### Automatic Assignment

- **Gold Medal 🥇**: Automatically assigned to rank 1
- **Silver Medal 🥈**: Automatically assigned to rank 2
- **Bronze Medal 🥉**: Automatically assigned to rank 3

Medals are automatically updated **in real-time** whenever:
- An athlete completes a lift (result recorded)
- Rankings change due to totals or tie-breaks

### Manual Override

Admins can manually assign or remove medals through the **Technical Panel**:

1. Navigate to the leaderboard in the Technical Panel
2. Click the medal buttons (🥇 🥈 🥉) next to any athlete
3. Click the **✕** button to remove a medal
4. Once manually set, the medal will NOT be auto-updated until reset

#### API Endpoint

```http
PUT /api/technical/athletes/:athleteId/medal
Content-Type: application/json
Authorization: Bearer <token>

{
  "medal": "gold" | "silver" | "bronze" | null
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "Athlete Name",
    "medal": "gold",
    "medal_manual_override": true,
    ...
  }
}
```

## Database Schema

### New Fields in `athletes` Table

| Field | Type | Description |
|-------|------|-------------|
| `medal` | VARCHAR(10) | Medal assignment: 'gold', 'silver', 'bronze', or NULL |
| `total_completed_at` | TIMESTAMP | When the athlete first completed their total (both lifts > 0) |
| `medal_manual_override` | BOOLEAN | If true, medal was manually set and won't auto-update |

### Constraints

```sql
CHECK (medal IN ('gold', 'silver', 'bronze') OR medal IS NULL)
```

### Indexes

```sql
CREATE INDEX idx_athletes_medal ON athletes(medal) WHERE medal IS NOT NULL;
CREATE INDEX idx_athletes_total_completed ON athletes(total_completed_at);
```

## How It Works

### 1. Total Completion Tracking

When an athlete's result is recorded:

```sql
-- In update_athlete_totals() function
IF v_total > 0 AND (v_old_total = 0 OR v_old_total IS NULL) AND v_total_completed_at IS NULL THEN
    v_total_completed_at := CURRENT_TIMESTAMP;
END IF;
```

This ensures the timestamp is set **only once** when the athlete first achieves a valid total.

### 2. Ranking Calculation

Rankings are calculated using PostgreSQL window functions:

```sql
WITH ranked_athletes AS (
    SELECT 
        id,
        ROW_NUMBER() OVER (
            ORDER BY 
                total DESC,                    -- Higher total wins
                total_completed_at ASC NULLS LAST  -- Earlier completion wins ties
        ) as new_rank
    FROM athletes
    WHERE session_id = p_session_id AND total > 0
)
```

### 3. Automatic Medal Assignment

After rankings are calculated:

```sql
-- Gold (rank 1)
UPDATE athletes
SET medal = 'gold'
WHERE session_id = p_session_id
  AND rank = 1
  AND total > 0
  AND medal_manual_override = false;  -- Only if not manually set

-- Silver and Bronze follow same pattern...
```

### 4. Real-time Updates

All changes trigger Socket.IO events:

- `athlete:updated` - When medal is manually changed
- `leaderboard:updated` - When rankings/medals change
- Frontend components automatically re-render

## User Interface

### Technical Panel (Admin)

The leaderboard table includes:

| Rank | Medal | Name | Country | Snatch | C&J | Total | Actions |
|------|-------|------|---------|--------|-----|-------|---------|
| 1 | 🥇 | John Smith | USA | 150 | 185 | 335 | 🥇 🥈 🥉 ✕ |

**Actions:**
- Click medal button to assign that medal
- Click ✕ to remove medal
- Disabled state for current medal
- Tooltips show action descriptions

### Display Screen

Top 5 leaderboard shows:
- Medal emoji (🥇🥈🥉) or rank number (#4, #5)
- Color-coded gradient backgrounds:
  - Gold: Yellow gradient
  - Silver: Gray gradient
  - Bronze: Orange gradient
  - Others: Blue gradient

### Scoreboard App (Mobile)

Leaderboard cards display:
- Medal emoji prominent in card
- Same color-coded gradients
- Lift breakdown (snatch, C&J)
- Total weight

## Migration

To apply this feature to an existing database:

```bash
# Run migration
psql -h <supabase-host> -U postgres -d postgres -f database/migrations/002_official_ranking_medals.sql
```

Or in Supabase SQL Editor:
1. Open SQL Editor
2. Paste contents of `database/migrations/002_official_ranking_medals.sql`
3. Execute

## Testing

### Test Scenario 1: Normal Ranking

1. Start session with 3 athletes
2. Record snatch attempts for all
3. Record C&J attempts for all
4. Verify rankings by total (highest first)
5. Verify medals: Gold, Silver, Bronze

### Test Scenario 2: Tie-breaking

1. Have two athletes with same total
2. Athlete A completes total first (finishes C&J at 14:20)
3. Athlete B completes total second (finishes C&J at 14:25)
4. Verify Athlete A ranks higher
5. Verify Athlete A gets gold, B gets silver

### Test Scenario 3: Manual Override

1. In Technical Panel, assign bronze medal to rank 5 athlete
2. Verify medal appears in all displays
3. Record new lift that changes rankings
4. Verify manually-assigned bronze stays with that athlete
5. Click ✕ to remove override
6. Verify medals auto-update based on rank

### Test Scenario 4: Real-time Updates

1. Open Technical Panel on one device
2. Open Scoreboard on mobile device
3. Open Display Screen on third device
4. Record a lift that changes rankings
5. Verify all three screens update medals simultaneously

## API Reference

### Get Session Leaderboard

```http
GET /api/technical/sessions/:sessionId/leaderboard
```

**Response includes medal fields:**
```json
{
  "success": true,
  "data": [
    {
      "athlete_id": "...",
      "athlete_name": "John Smith",
      "country": "USA",
      "rank": 1,
      "total": 335,
      "best_snatch": 150,
      "best_clean_and_jerk": 185,
      "medal": "gold",
      "total_completed_at": "2026-01-15T14:23:15.000Z",
      "medal_manual_override": false
    }
  ]
}
```

### Update Athlete Medal

```http
PUT /api/technical/athletes/:athleteId/medal
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "medal": "gold" | "silver" | "bronze" | null
}
```

## Socket Events

### Events Emitted

```javascript
// When medal is manually updated
io.emit('athlete:updated', {
  id: '...',
  name: 'John Smith',
  medal: 'gold',
  medal_manual_override: true
});

// When rankings change (includes medals)
io.to(`session:${sessionId}`).emit('leaderboard:updated', [
  { rank: 1, medal: 'gold', ... },
  { rank: 2, medal: 'silver', ... },
  { rank: 3, medal: 'bronze', ... }
]);
```

## Troubleshooting

### Medals not updating automatically

**Check:**
1. Is `medal_manual_override = true`? If yes, remove override first
2. Do athletes have valid totals (both snatch and C&J > 0)?
3. Check database triggers are active:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname LIKE '%athlete%';
   ```

### Tie-breaking not working correctly

**Check:**
1. Verify `total_completed_at` timestamps:
   ```sql
   SELECT name, total, total_completed_at 
   FROM athletes 
   WHERE session_id = '...' AND total > 0
   ORDER BY total DESC, total_completed_at ASC;
   ```
2. Ensure timestamp was set when total first became > 0
3. Check for NULL timestamps (may need manual correction)

### Manual override stuck

**Reset override:**
```sql
UPDATE athletes
SET medal_manual_override = false
WHERE id = '...';

-- Then trigger ranking update
SELECT update_session_rankings('session-id');
```

## Future Enhancements

- [ ] Medal ceremony mode (show podium on display screen)
- [ ] Medal history/audit log (who changed what, when)
- [ ] Export medal table to CSV/PDF
- [ ] Medal standings across all sessions (team medals)
- [ ] Photo upload for medal winners
- [ ] Social media integration (auto-post medal winners)

## Related Documentation

- [Technical Panel Guide](TECHNICAL_PANEL.md)
- [Display Screen Guide](DISPLAY_SCREEN.md)
- [Scoreboard App Guide](SCOREBOARD.md)
- [Real-time Flow](REALTIME_FLOW.md)
- [Database Schema](database/schema.sql)
