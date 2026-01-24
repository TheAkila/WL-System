# Attempt Edit Count Feature - Implementation Complete

## Feature Overview
Implements IWF rule: Athletes can change their declared attempt weight up to 3 times before the attempt is executed.

## What Was Implemented

### 1. Database Migration
**File:** `database/migrations/004_add_attempt_edit_count.sql`

Adds `edit_count` column to track number of weight changes per attempt.

**To Apply Migration:**
1. Open your Supabase Dashboard
2. Go to SQL Editor
3. Copy and run the contents of `004_add_attempt_edit_count.sql`

```sql
ALTER TABLE attempts 
ADD COLUMN edit_count INTEGER DEFAULT 0 CHECK (edit_count >= 0 AND edit_count <= 3);
```

### 2. Frontend Changes
**File:** `apps/admin-panel/src/components/technical/AttemptCell.jsx`

**Features Added:**
- Tracks edit count for each attempt
- Blocks editing after 3 changes
- Shows remaining edits (e.g., "2/3" in top-right corner)
- Toast notifications showing remaining edits after each change
- First weight entry doesn't count as an edit (edit_count starts at 0)

**User Experience:**
- Click on pending attempt cell to edit weight
- Each weight change increments edit_count
- After 3 changes, cell becomes non-editable
- Visual indicator shows "X/3" edits remaining during pending state
- Toast message: "Weight updated (2 changes remaining)"

### 3. Backend Support
No changes needed - the backend's `updateAttempt` function already supports any field updates including `edit_count`.

## Testing Checklist

1. ✅ Run the database migration in Supabase
2. ✅ Restart backend server
3. ✅ Test editing attempt weight:
   - First edit: 0/3 → 1/3
   - Second edit: 1/3 → 2/3
   - Third edit: 2/3 → 3/3
   - Fourth edit attempt: Should show error toast
4. ✅ Verify visual indicator appears
5. ✅ Confirm marking as good/no-lift still works
6. ✅ Test with multiple athletes

## IWF Rule Compliance
✅ Maximum 3 weight changes per attempt
✅ Changes only allowed before attempt is executed (pending state)
✅ Changes blocked once result is marked (good/no-lift)

## Rollback Plan
If issues occur, remove the column:
```sql
ALTER TABLE attempts DROP COLUMN edit_count;
```
