# Data Loss Fix Report

## Problem Summary
When entering data (weights, marking good/no lift) in the technical panel, the sheet would refresh and lose the user's pending data. This happened even after disabling the socket listener.

## Root Cause Analysis

### Issue #1: Error Handler Calling fetchSessionData()
**Location**: `apps/admin-panel/src/components/technical/SessionSheet.jsx`
- **Line 226**: handleAttemptUpdate error handler called `fetchSessionData()`
- **Line 262**: handleDQToggle error handler called `fetchSessionData()`
- **Impact**: When any save operation failed, the entire sheet was refreshed from the backend, overwriting all optimistic updates

### Issue #2: Empty useEffect with Function Dependency
**Location**: `apps/admin-panel/src/components/technical/SessionSheet.jsx`
- **Lines 276-291**: Empty useEffect (commented out socket code) still had `fetchSessionData` in dependency array
- **Why it's a problem**: `fetchSessionData` is a `useCallback` that depends on `sessionId` and `athletes` state
  - Every time `athletes` state changes (from optimistic updates), the `useCallback` is recreated
  - This triggers the useEffect with `[sessionId, fetchSessionData]` dependency
  - Which would call any handlers (though the body was commented out, the dependency analysis is problematic)
- **Impact**: Even though the effect body was disabled, having it in the dependency array showed intention to refresh

## Solution Applied

### Fix #1: Removed fetchSessionData() from Error Handlers
```javascript
// BEFORE (WRONG):
} catch (error) {
  toast.error(error.message || 'Failed to save attempt');
  fetchSessionData(); // ❌ Refreshes entire sheet on error
}

// AFTER (FIXED):
} catch (error) {
  toast.error(error.message || 'Failed to save attempt');
  // DO NOT refresh - data is already optimistically updated
}
```

**Reason**: 
- Optimistic updates already show the data on the client
- Refreshing on error loses the user's pending edits
- If save fails, the error toast informs the user to retry
- User can manually click the refresh button if needed

### Fix #2: Removed Empty useEffect with Function Dependency
```javascript
// BEFORE (WRONG):
useEffect(() => {
  if (!sessionId) return;
  // Socket code is commented out, but dependency still exists
}, [sessionId, fetchSessionData]); // ❌ Unnecessary dependency

// AFTER (FIXED):
// Removed entire empty useEffect
// Just left a comment explaining why socket listeners are disabled

// NOTE: Socket listeners DISABLED to prevent data loss from auto-refresh
// Data is already optimistically updated on client side
// Manual refresh button available in UI if sync needed
```

## Data Flow After Fix

1. **User enters weight**: 
   - ✅ Optimistic update visible immediately (yellow pending cell)
   - Data sent to backend in 500ms debounced call
   - NO refresh happens

2. **Backend saves successfully**:
   - ✅ Cell shows weight, remains yellow
   - No refresh = data persists
   - Success toast shown

3. **Backend save fails** (network error, validation error, etc):
   - ✅ Cell still shows weight (optimistic update retained)
   - Error toast shown ("Failed to save attempt")
   - NO refresh = user data not lost
   - User can retry or continue with other entries

4. **User marks as Good/No Lift**:
   - ✅ Optimistic update: cell turns green/red
   - Data sent to backend
   - NO refresh happens
   - User data safe

## Files Changed
- `apps/admin-panel/src/components/technical/SessionSheet.jsx`
  - Line 226: Removed `fetchSessionData()` from attempt save error handler
  - Line 262: Removed `fetchSessionData()` from DQ toggle error handler
  - Lines 276-291: Removed entire empty useEffect with bad dependency

## Testing Checklist
- [ ] Enter weight in a cell → data stays visible
- [ ] Mark as ✓ (good) → cell turns green, stays visible
- [ ] Mark as ✗ (no lift) → cell turns red, stays visible
- [ ] Toggle between good/no lift → no refresh
- [ ] Try to trigger an error (disconnect backend) → error shown, data retained
- [ ] Sheet never auto-refreshes during data entry
- [ ] Best snatch/clean jerk calculations still work
- [ ] Totals and rankings update correctly
- [ ] Manual refresh button still works if needed

## Technical Details

### Why Optimistic Updates Are Better Than Auto-Refresh
- **Speed**: User sees changes instantly (UX improvement)
- **Reliability**: If save fails, data isn't lost - it's already on client
- **Consistency**: Multiple users editing simultaneously won't lose work
- **Predictability**: No unexpected data resets mid-entry

### Socket Listener Status
- **Current**: DISABLED (via commented-out code and removed useEffect)
- **Reason**: Would cause auto-refresh, overwriting user data
- **If needed later**: Manual sync button can be added, or socket events can be used only for **non-editing** sessions

### Error Recovery
User has three options if a save fails:
1. Keep working - optimistic updates stay on client
2. Wait a moment - connection might restore, retry happens on next auto-save
3. Click refresh button - if they want fresh data from backend

## Performance Impact
- **Positive**: No unnecessary refetches on errors
- **No change**: Still 500ms debounce on saves
- **No change**: Still only fetches on initial load (sessionId change)

## Future Improvements (Optional)
1. Add explicit "Retry Last Failed Save" button for failed attempts
2. Add connection status indicator so user knows if backend is unreachable
3. Add conflict detection if multiple users edit same attempt simultaneously
4. Add audit trail showing when/who edited each attempt
