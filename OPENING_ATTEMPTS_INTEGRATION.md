# Opening Attempts from Weigh-In Integration

## Overview

Athletes now automatically have their first attempt weights populated from their weigh-in opening declarations. This seamless integration ensures:

- **No manual entry needed** for 1st attempts
- **Can still be edited** during competition if needed
- **Automatic creation** when competition sheet loads
- **Maintains IWF standards** for opening attempts

## Workflow

### Phase 1: Weigh-In (Athletes Register Opening Attempts)

```
Weigh-In Screen:
┌─────────────────────────────────────────┐
│ Athlete: John Doe                       │
├─────────────────────────────────────────┤
│ Body Weight:        79.5 kg             │
│ Opening Snatch:     140 kg   ← Set here│
│ Opening Clean & Jerk: 170 kg ← Set here│
└─────────────────────────────────────────┘
     │
     ▼
  Saved to Database:
  athletes.opening_snatch = 140
  athletes.opening_clean_jerk = 170
  athletes.weigh_in_completed_at = 2024-01-24T10:30:00Z
```

### Phase 2: Competition Starts (Attempts Auto-Populated)

```
When Technical Panel loads competition sheet:
     │
     ▼
getSessionSheet API called for sessionId
     │
     ▼
For each athlete:
  1. Check if 1st snatch attempt exists
  2. If NOT and opening_snatch is set:
     ✅ CREATE attempt record with:
        - attempt_number: 1
        - weight: athlete.opening_snatch (140kg)
        - result: 'pending'
     │
  3. Check if 1st clean & jerk attempt exists
  4. If NOT and opening_clean_jerk is set:
     ✅ CREATE attempt record with:
        - attempt_number: 1
        - weight: athlete.opening_clean_jerk (170kg)
        - result: 'pending'
     │
     ▼
Competition Sheet Displays:
┌──────────────────────────────────────┐
│ SNATCH          │ CLEAN & JERK       │
├─────┬─────┬─────┼─────┬─────┬───────┤
│  1  │  2  │  3  │  1  │  2  │   3   │
├─────┼─────┼─────┼─────┼─────┼───────┤
│140kg│     │     │170kg│     │       │
└─────┴─────┴─────┴─────┴─────┴───────┘
     ↑                  ↑
  Auto-filled from   Auto-filled from
  opening_snatch     opening_clean_jerk
```

### Phase 3: Competition (Attempts Can Be Edited)

```
During Competition:
User can:
✅ Edit 1st attempt weight (e.g., change 140 to 145)
✅ Mark 1st attempt as good/no lift
✅ Add 2nd and 3rd attempts
✅ Make weight change requests
✅ All edits work normally

The 1st attempt being pre-filled doesn't prevent any edits!
```

## Database Schema

### New Fields Added to Athletes Table

```sql
ALTER TABLE athletes ADD COLUMN opening_snatch INTEGER;
ALTER TABLE athletes ADD COLUMN opening_clean_jerk INTEGER;
ALTER TABLE athletes ADD COLUMN lot_number INTEGER;
ALTER TABLE athletes ADD COLUMN weigh_in_completed_at TIMESTAMP WITH TIME ZONE;

-- Constraints to ensure positive values
ALTER TABLE athletes
ADD CONSTRAINT check_opening_snatch_positive CHECK (opening_snatch IS NULL OR opening_snatch > 0),
ADD CONSTRAINT check_opening_clean_jerk_positive CHECK (opening_clean_jerk IS NULL OR opening_clean_jerk > 0);
```

### Athletes Table Schema

```
athletes table:
├── id (UUID) - Primary key
├── name (VARCHAR)
├── ...existing fields...
├── opening_snatch (INTEGER) ← NEW: Opening snatch declaration (kg)
├── opening_clean_jerk (INTEGER) ← NEW: Opening C&J declaration (kg)
├── lot_number (INTEGER) ← NEW: Random lot number for lifting order
├── weigh_in_completed_at (TIMESTAMP) ← NEW: When weigh-in was completed
└── ...other fields...
```

## Backend Implementation

### Modified Function: `getSessionSheet`

**Location**: `apps/backend/src/controllers/technical.controller.js`

**Logic**:
```javascript
export const getSessionSheet = async (req, res, next) => {
  // 1. Fetch all athletes in session
  const athletes = await db.supabase.from('athletes')
    .select('*')
    .eq('session_id', sessionId);
  
  // 2. For each athlete:
  const athletesWithAttempts = await Promise.all(
    athletes.map(async (athlete) => {
      // Get existing attempts
      const snatchAttempts = await getSnatchAttempts(athlete.id);
      const cleanJerkAttempts = await getCleanJerkAttempts(athlete.id);
      
      // AUTO-CREATE 1st snatch attempt if:
      // - athlete has opening_snatch value
      // - no 1st attempt exists yet
      if (athlete.opening_snatch && !has1stSnatch(snatchAttempts)) {
        const created = await createAttempt({
          athlete_id: athlete.id,
          lift_type: 'snatch',
          attempt_number: 1,
          weight: athlete.opening_snatch,
          result: 'pending'
        });
        snatchAttempts.push(created);
      }
      
      // AUTO-CREATE 1st clean & jerk attempt if:
      // - athlete has opening_clean_jerk value
      // - no 1st attempt exists yet
      if (athlete.opening_clean_jerk && !has1stCleanJerk(cleanJerkAttempts)) {
        const created = await createAttempt({
          athlete_id: athlete.id,
          lift_type: 'clean_and_jerk',
          attempt_number: 1,
          weight: athlete.opening_clean_jerk,
          result: 'pending'
        });
        cleanJerkAttempts.push(created);
      }
      
      return {
        ...athlete,
        snatch_attempts: snatchAttempts,
        clean_jerk_attempts: cleanJerkAttempts,
      };
    })
  );
  
  return { success: true, data: athletesWithAttempts };
};
```

## Frontend Behavior

### SessionSheet Component

The component doesn't need changes! It automatically receives attempts with:
- **1st attempt pre-filled** from opening declaration
- **Edit capability** fully functional
- **No special UI needed** - looks just like any other attempt

### AttemptCell Component

Already supports:
- ✅ Editing weight (even if pre-filled)
- ✅ Marking good/no lift
- ✅ Validation (ascending weight rule still applies)
- ✅ Display (yellow pending, green/red finalized)

## Data Flow Summary

```
┌─────────────────────────────────────────────────────────┐
│ STEP 1: WEIGH-IN                                        │
├─────────────────────────────────────────────────────────┤
│ User enters:                                            │
│   opening_snatch = 140kg                               │
│   opening_clean_jerk = 170kg                           │
│                                                         │
│ Saved to DB:                                            │
│   athletes.opening_snatch = 140                        │
│   athletes.opening_clean_jerk = 170                    │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 2: COMPETITION STARTS                              │
├─────────────────────────────────────────────────────────┤
│ GET /technical/sessions/:id/sheet called               │
│                                                         │
│ Backend auto-creates:                                   │
│   attempts.snatch[1] = {weight: 140, result: pending} │
│   attempts.clean_jerk[1] = {weight: 170, result: pending}
│                                                         │
│ Returns: Athletes with 1st attempts populated         │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 3: COMPETITION SHEET DISPLAYS                      │
├─────────────────────────────────────────────────────────┤
│ Snatch 1st: 140kg ← Pre-filled                         │
│ Clean & Jerk 1st: 170kg ← Pre-filled                   │
│                                                         │
│ User can:                                               │
│   ✅ Edit either weight                                │
│   ✅ Mark results                                       │
│   ✅ Add 2nd & 3rd attempts                            │
│   ✅ Everything works normally                          │
└─────────────────────────────────────────────────────────┘
```

## Key Features

### 1. Automatic Creation (No Manual Entry)
- When competition sheet loads, 1st attempts are auto-created from opening declarations
- Users don't manually enter 1st attempt weights
- Reduces data entry errors

### 2. One-Time Creation
- If 1st attempt already exists, it's NOT recreated
- Idempotent: calling API multiple times doesn't duplicate attempts
- Safe for page refreshes

### 3. Conditional Creation
- Only creates if athlete has opening declaration AND no 1st attempt exists
- Doesn't overwrite manually entered attempts
- Respects existing data

### 4. Full Edit Capability
- Athletes can change weight if needed (e.g., injury, reassessment)
- Validation still applies (ascending weight rule)
- Normal IWF rules enforced

### 5. Logging & Debugging
```javascript
// Console logs show what was auto-created:
✅ Auto-created snatch 1st attempt for athlete 123: 140kg
✅ Auto-created clean & jerk 1st attempt for athlete 123: 170kg
⚠️ Failed to auto-create snatch attempt for athlete 456: [error]
```

## Testing Checklist

### Setup
- [ ] Run migration to add new columns: `004_add_opening_attempts.sql`
- [ ] Verify athletes table has: opening_snatch, opening_clean_jerk, lot_number, weigh_in_completed_at

### Weigh-In
- [ ] Enter athlete with opening_snatch = 140kg, opening_clean_jerk = 170kg
- [ ] Verify values saved to database

### Competition Load
- [ ] Open technical panel for session
- [ ] Verify 1st attempt snatch shows 140kg (yellow pending)
- [ ] Verify 1st attempt clean & jerk shows 170kg (yellow pending)

### Edit Capability
- [ ] Edit 1st snatch to 145kg
- [ ] Mark as good (green)
- [ ] Edit still works for other attempts
- [ ] Rankings update correctly

### Multi-User
- [ ] Load same session in 2 tabs
- [ ] Verify both see same 1st attempt weights
- [ ] Edit in one tab, refresh other
- [ ] Both see updated values

### Edge Cases
- [ ] Athlete with only opening_snatch (no C&J) → 1st snatch created, C&J empty
- [ ] Athlete with no opening attempts → all attempts empty (normal)
- [ ] Refresh page multiple times → attempts created only once
- [ ] Manually enter 2nd attempt before 1st → 1st still auto-created

## Migration Instructions

### 1. Apply Database Migration
```bash
# Run the migration file
psql -U postgres -d lifting_live -f database/migrations/004_add_opening_attempts.sql
```

### 2. Verify Columns Exist
```bash
\d athletes
# Should show: opening_snatch | integer
#             opening_clean_jerk | integer
#             lot_number | integer
#             weigh_in_completed_at | timestamp with time zone
```

### 3. Test with Sample Data
```sql
-- Insert test athlete with opening attempts
UPDATE athletes
SET opening_snatch = 140, 
    opening_clean_jerk = 170,
    lot_number = 1,
    weigh_in_completed_at = NOW()
WHERE name = 'Test Athlete';
```

### 4. Restart Backend
```bash
cd apps/backend
npm run dev
```

### 5. Test in UI
- Go to Weigh-In
- Enter opening snatch and C&J
- Go to Technical Panel
- Verify 1st attempts auto-appear

## Files Modified/Created

### New Files
- `database/migrations/004_add_opening_attempts.sql` - Migration to add fields

### Modified Files
- `apps/backend/src/controllers/technical.controller.js` - getSessionSheet function updated to auto-create attempts

### No Changes Needed
- Frontend components (SessionSheet, AttemptCell) work as-is
- API routes work as-is
- Database service works as-is

## Benefits

✅ **For Users**
- Faster competition setup (no manual entry of 1st attempts)
- Fewer data entry errors
- Automatic population from official weigh-in records
- Still flexible to edit if needed

✅ **For System**
- Follows IWF standards (opening attempts declared at weigh-in)
- Automatic but safe (won't overwrite existing attempts)
- Idempotent (safe to call multiple times)
- Better data consistency

✅ **For Competitions**
- Professional workflow (weigh-in → auto-populate → competition)
- Audit trail (shows which attempts were auto-created)
- No duplicate effort (data entered once, used everywhere)

## Future Enhancements (Optional)

1. **Lifting Order Automation**: Auto-sort athletes by lot number
2. **Weight Change Requests**: Allow athletes to modify opening attempts mid-competition
3. **Opening Validation**: Warn if opening snatch > clean & jerk
4. **Batch Import**: Import opening attempts from external systems
5. **History Tracking**: Show when 1st attempts were auto-created vs manually edited
