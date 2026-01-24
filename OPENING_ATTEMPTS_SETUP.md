# Setup Guide: Opening Attempts Auto-Population

## Quick Summary

✅ **Feature**: 1st attempts automatically populated from weigh-in opening declarations  
✅ **Status**: Ready to deploy  
✅ **Impact**: Zero - compatible with existing UI, 100% backward compatible

## Installation Steps

### Step 1: Apply Database Migration

```bash
cd /Users/akilanishan/Desktop/Projects/WL-System

# Option A: Using psql directly (if connected to Supabase)
psql -U postgres -d [your_db_name] < database/migrations/004_add_opening_attempts.sql

# Option B: Copy-paste SQL into Supabase Dashboard
# Go to SQL Editor → New Query → Paste migration content → Run
```

**What it does:**
- Adds 4 new columns to athletes table:
  - `opening_snatch` (INTEGER) - Snatch opening declaration (kg)
  - `opening_clean_jerk` (INTEGER) - C&J opening declaration (kg)
  - `lot_number` (INTEGER) - Random lot number for lifting order
  - `weigh_in_completed_at` (TIMESTAMP) - When weigh-in completed

### Step 2: Verify Columns Were Added

```sql
-- Run this query in Supabase SQL Editor
SELECT * FROM athletes LIMIT 1;

-- Should show:
-- id | name | ... | opening_snatch | opening_clean_jerk | lot_number | weigh_in_completed_at | ...
```

### Step 3: Restart Backend

```bash
# If backend is running, stop it (Ctrl+C)

# Restart
cd apps/backend
npm run dev

# Should see:
# ✓ Server running on port 5000
# ✓ Database connected
```

### Step 4: Test the Workflow

#### Test 1: Weigh-In Entry
```
1. Go to Admin Panel → Weigh-In
2. Select a session (e.g., Men 77kg)
3. Find an athlete
4. Enter:
   - Body Weight: 76.5
   - Opening Snatch: 140
   - Opening Clean & Jerk: 170
5. Click "Complete Weigh-In"
6. ✅ Should save successfully
```

#### Test 2: Auto-Populate in Competition
```
1. Go to Admin Panel → Technical Panel
2. Select same session
3. Competition sheet loads
4. Find the athlete from Test 1
5. ✅ Snatch 1st cell should show: 140kg (yellow)
6. ✅ Clean & Jerk 1st cell should show: 170kg (yellow)
7. Can edit either weight
8. Can mark as good/no lift
```

#### Test 3: Edit After Auto-Population
```
1. Edit the 1st snatch from 140 to 145
2. Mark as ✓ (good lift)
3. ✅ Cell turns green with 145kg
4. Refresh page
5. ✅ Still shows 145kg green (persisted to DB)
6. Add 2nd and 3rd attempts normally
```

## How It Works

### Weigh-In → Competition Flow

```
WEIGH-IN:
User enters opening_snatch=140, opening_clean_jerk=170
                    ↓
            Saved to DB: athletes table
        opening_snatch=140
        opening_clean_jerk=170
                    ↓
COMPETITION STARTS:
User opens Technical Panel
                    ↓
GET /technical/sessions/:id/sheet called
                    ↓
Backend getSessionSheet function runs:
  For each athlete:
    IF athlete.opening_snatch exists AND no 1st snatch attempt:
      CREATE attempt(snatch, 1, 140kg, pending)
    IF athlete.opening_clean_jerk exists AND no 1st C&J attempt:
      CREATE attempt(clean_jerk, 1, 170kg, pending)
                    ↓
Returns athletes with 1st attempts populated
                    ↓
SHEET DISPLAYS:
Snatch 1: 140kg ← Auto-filled
C&J 1: 170kg ← Auto-filled
All fully editable
```

## Backward Compatibility

✅ **Fully backward compatible:**
- Existing competitions with manually entered 1st attempts: NOT affected
- Existing athletes without opening declarations: Works fine (empty cells)
- Old sessions before migration: Can still open and edit
- No breaking changes to API or UI

## Troubleshooting

### Issue: Columns not showing in Supabase

**Solution:**
1. Check migration was applied: `SELECT * FROM athletes LIMIT 1;`
2. If not found, run migration again
3. Verify Supabase connection in backend

### Issue: 1st attempts not auto-appearing

**Solution:**
1. Check athlete has opening_snatch/opening_clean_jerk values:
   ```sql
   SELECT name, opening_snatch, opening_clean_jerk 
   FROM athletes 
   WHERE session_id = '[session_id]';
   ```
2. If NULL, run weigh-in again
3. Check backend logs for errors:
   ```
   ✅ Auto-created snatch 1st attempt for athlete 123: 140kg
   ⚠️ Failed to auto-create snatch attempt...
   ```

### Issue: Edit works but doesn't persist

**Solution:**
1. Check backend is running: `npm run dev` in apps/backend
2. Check browser console for errors
3. Verify API is responding: `/attempts` endpoint

## Files Changed

### Created
- `database/migrations/004_add_opening_attempts.sql` - DB migration

### Modified
- `apps/backend/src/controllers/technical.controller.js` - getSessionSheet updated

### Documentation
- `OPENING_ATTEMPTS_INTEGRATION.md` - Full feature documentation

## Rollback (If Needed)

```sql
-- To remove the columns (data will be lost!)
ALTER TABLE athletes
DROP COLUMN IF EXISTS opening_snatch,
DROP COLUMN IF EXISTS opening_clean_jerk,
DROP COLUMN IF EXISTS lot_number,
DROP COLUMN IF EXISTS weigh_in_completed_at;

-- Restart backend after rollback
```

## Verification Checklist

- [ ] Migration applied successfully
- [ ] Columns visible in Supabase
- [ ] Weigh-In can save opening snatch/C&J
- [ ] Competition sheet auto-loads 1st attempts
- [ ] Edit functionality works
- [ ] Good/No-lift marking works
- [ ] Rankings still calculate correctly
- [ ] No console errors

## Performance Impact

✅ **Minimal:**
- One additional check per athlete per load: O(n)
- Creates attempts only if they don't exist
- Idempotent (safe to refresh)
- Logged for debugging

## Next Steps

1. ✅ Apply migration
2. ✅ Restart backend
3. ✅ Test weigh-in entry
4. ✅ Test competition auto-population
5. ✅ Test editing
6. Ready for production use!

## Support

For issues:
1. Check logs: `npm run dev` shows all auto-creation activity
2. Verify columns: `SELECT * FROM athletes LIMIT 1;`
3. Check athlete data: `SELECT name, opening_snatch FROM athletes WHERE [conditions];`
4. Restart backend if needed
