# IWF Priority 1 Features - Testing Guide

## ✅ VERIFICATION STATUS: ALL FEATURES IMPLEMENTED

All Priority 1 IWF features have been successfully implemented with:
- ✅ No syntax errors
- ✅ Proper error handling
- ✅ Socket.IO event emissions
- ✅ Database migration created

---

## 🗄️ DATABASE SETUP

**Before testing, run the migration:**

```sql
-- File: database/migrations/004_weight_change_tracking.sql

-- In Supabase SQL Editor:
ALTER TABLE attempts 
ADD COLUMN IF NOT EXISTS weight_changed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS weight_change_timestamp TIMESTAMP WITH TIME ZONE;

ALTER TABLE athletes
ADD COLUMN IF NOT EXISTS is_dq BOOLEAN DEFAULT FALSE;
```

---

## 🧪 TESTING SCENARIOS

### 1️⃣ Two-Minute Rule (IWF 6.6.4)

**Test Case: Consecutive Attempts**

1. Start a session with athletes
2. Athlete A: Declare 100kg snatch attempt 1
3. Result: No lift
4. **Immediately** Athlete A: Declare 102kg attempt 2
5. ✅ **Expected**: Timer auto-starts at **2:00 minutes**
6. Check Socket.IO event: `timer:autoStarted` with `isConsecutive: true`

**Test Case: Different Athletes**

1. Athlete A: Declare 100kg attempt 1 (timer: 1:00)
2. Result: No lift
3. Athlete B: Declare 95kg attempt 1
4. ✅ **Expected**: Timer auto-starts at **1:00 minute**

**How to Verify:**
- Look for console log: "Consecutive attempt (Two-Minute Rule)"
- Timer display should show 2:00 for consecutive, 1:00 for non-consecutive

---

### 2️⃣ Auto-DQ on Three Failed Attempts (IWF 6.5.5)

**Test Case: Snatch Failure**

1. Athlete: Declare snatch attempt 1 (e.g., 100kg)
2. Quick Decision: **No Lift**
3. Athlete: Declare snatch attempt 2 (e.g., 100kg)
4. Quick Decision: **No Lift**
5. Athlete: Declare snatch attempt 3 (e.g., 100kg)
6. Quick Decision: **No Lift**
7. ✅ **Expected**: 
   - Athlete automatically marked as DQ
   - Socket.IO event: `athlete:disqualified` emitted
   - Athlete removed from Clean & Jerk lifting order
   - Reason: "Three failed attempts in Snatch"

**How to Verify:**
- Check athlete record: `is_dq = true`
- Session sheet shows DQ indicator
- Display screen shows DQ status
- Console shows: "📢 Athlete disqualified: [name]"

---

### 3️⃣ Bodyweight Category Validation (IWF 6.3.1)

**Test Case: Overweight Athlete**

1. Go to Weigh-In page
2. Select 88kg Men's category
3. Enter bodyweight: **88.5kg**
4. ✅ **Expected**:
   - Warning message: "Bodyweight 88.5kg exceeds 88kg category limit"
   - Shows excess: 0.5kg
   - Flag: `requiresReweigh: true` (2-hour reweigh allowed)
   - Still allows official to override

**Test Case: Valid Weight**

1. Select 88kg Men's category
2. Enter bodyweight: **87.8kg**
3. ✅ **Expected**: No warnings, weigh-in accepted

**Weight Categories (IWF 2024):**
```
Men:    60, 65, 71, 79, 88, 94, 110, 110+kg
Women:  48, 53, 58, 63, 69, 77, 86, 86+kg
```

**How to Verify:**
- API response includes `weightValidation` object
- Warning displayed in UI
- Console shows validation result

---

### 4️⃣ Weight Change Management (IWF 6.5.1)

**Test Case: Valid Weight Increase**

1. Athlete has pending attempt: 120kg
2. Request weight change to: **125kg**
3. ✅ **Expected**:
   - Weight updated successfully
   - Socket.IO events:
     - `attempt:weightChanged`
     - `liftingOrder:updated`
   - Lifting order recalculated
   - Timestamp recorded

**Test Case: Invalid Weight Decrease**

1. Athlete has pending attempt: 120kg
2. Request weight change to: **115kg**
3. ✅ **Expected**:
   - Error: "New weight must be greater than current weight"
   - Request rejected

**How to Verify:**
- Check attempt record: `weight_changed = true`
- Lifting order updates automatically
- Console shows: "Weight changed from 120kg to 125kg"

---

## 🔌 SOCKET.IO EVENTS

**New Events to Monitor:**

```javascript
// Two-Minute Rule
socket.on('timer:autoStarted', (data) => {
  console.log('Timer:', data.duration, 'seconds');
  console.log('Consecutive:', data.isConsecutive);
  console.log('Reason:', data.reason);
});

// Auto-DQ
socket.on('athlete:disqualified', (data) => {
  console.log('DQ:', data.athleteName);
  console.log('Reason:', data.reason);
  console.log('Lift:', data.liftType);
});

// Weight Change
socket.on('attempt:weightChanged', (data) => {
  console.log('Weight changed:', data.oldWeight, '→', data.newWeight);
});

socket.on('liftingOrder:updated', (data) => {
  console.log('Lifting order recalculated');
});
```

---

## 📝 API ENDPOINTS

### Weight Change Request
```bash
POST /api/technical/attempts/weight-change
Authorization: Bearer <token>

{
  "athleteId": "uuid",
  "weight": 125,
  "liftType": "snatch",
  "attemptNumber": 2
}
```

### Athlete Update (Weigh-In)
```bash
PUT /api/athletes/:id
Authorization: Bearer <token>

{
  "body_weight": 87.8,
  "weight_category": "88",
  "gender": "male"
}
```

---

## 🐛 DEBUGGING

**If something doesn't work:**

1. **Check Console Logs:**
   - Backend: Look for IWF rule mentions
   - Frontend: Check Socket.IO event logs

2. **Verify Database:**
   ```sql
   -- Check if migration ran
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'attempts' AND column_name = 'weight_changed';
   
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'athletes' AND column_name = 'is_dq';
   ```

3. **Check Socket.IO Connection:**
   - Admin Panel: Should show "Connected" badge
   - Display Screen: Socket status indicator

4. **Verify Timer Service:**
   ```javascript
   // Check timer state
   GET /api/timer/:sessionId
   ```

---

## ✅ SUCCESS CRITERIA

All features working when:

- ✅ Consecutive attempts automatically get 2-minute timer
- ✅ Athletes auto-DQ after 3 failed attempts in one lift
- ✅ Weigh-in validates bodyweight against category limits
- ✅ Weight changes update and recalculate lifting order
- ✅ All Socket.IO events emit correctly
- ✅ Display screen receives real-time updates
- ✅ No console errors in backend or frontend

---

## 📞 SUPPORT

If issues persist:
1. Check migration ran successfully
2. Restart backend server
3. Clear browser cache
4. Check network tab for API errors
5. Review Socket.IO connection status
