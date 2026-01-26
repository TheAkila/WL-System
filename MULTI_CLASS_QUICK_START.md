# Multi-Class System - Quick Start Guide

## What to Test

### 1. Create a Multi-Class Session

**Steps**:
1. Refresh browser at http://localhost:3001
2. Go to **Sessions** page
3. Click **"New Session"**
4. Fill in:
   - **Session Name**: "National Championship 2026"
   - **Gender**: Male
   - **Weight Classes** (NEW!): Check 3-4 boxes
     - ☑ 60kg
     - ☑ 79kg
     - ☑ 88kg
     - ☑ 110kg
5. Click **Create Session**

**Expected**: Session created with message "Session created with 4 weight class(es)"

### 2. View Weight Class Tabs

**Steps**:
1. Go to **Technical Panel**
2. Click into the session you just created
3. Look below the session title

**Expected**: See tabs at top showing selected classes
```
[60kg] [79kg] [88kg] [110kg]
```

### 3. Add Athletes to Different Classes

**Steps**:
1. Go to **Athletes**
2. Create athlete: "Maale", weight_category: **60kg**
3. Create athlete: "Tiger", weight_category: **79kg**
4. Create athlete: "John", weight_category: **88kg**
5. Create athlete: "Ram", weight_category: **110kg**

**Expected**: Athletes register with their weight classes

### 4. Filter by Weight Class

**Steps**:
1. Go back to Technical Panel
2. Click on **[60kg]** tab
3. Notice only Maale appears
4. Click on **[79kg]** tab
5. Notice only Tiger appears

**Expected**:
- Each tab shows only athletes from that class
- Switching tabs filters instantly
- No page reload needed

### 5. Test Each Class Independently

**For 60kg (Maale)**:
1. Click [60kg] tab
2. Test all features:
   - ✅ Enter snatch attempts
   - ✅ Mark good/no lift
   - ✅ Test next lifter (shows Maale)
   - ✅ Check DQ toggle
   - ✅ Verify ranking

**For 79kg (Tiger)**:
1. Click [79kg] tab
2. Test all features:
   - ✅ Enter clean & jerk attempts
   - ✅ Next lifter shows Tiger only
   - ✅ DQ checkbox works
   - ✅ Ranking independent from 60kg

**Expected**: Each class works completely independently

## Key Features to Verify

### Weight Class Tabs
```
Should see:
[60kg] [79kg] [88kg] [110kg]
```
- Only shows for multi-class sessions
- Single-class sessions have no tabs

### Athlete Filtering
- Tabs filter athletes automatically
- No manual selection needed
- Instant switching

### Independent State Management
- Each class has:
  - Its own athletes
  - Its own next lifter
  - Its own attempt tracking
  - Its own DQ status
  - Its own rankings

### Backward Compatibility
- Single-class sessions work as before
- No tabs shown
- All features unchanged

## Troubleshooting

### No weight class checkboxes showing?
- Refresh page (Ctrl+F5)
- Check console for errors
- Rebuild admin panel: `npm run build`

### Tabs not appearing in Technical Panel?
- Ensure athletes have different weight_categories
- Create multiple athletes in different classes
- Tabs auto-generate from athlete data

### Filtering not working?
- Check athlete weight_category matches tab name
- Refresh page
- Look in browser console for errors

### Backend error when creating session?
- Check database migration was applied
- Restart backend server
- Check logs: `npm run start` in backend folder

## Expected Behavior

### Form Behavior
```
Gender: Male
Weight Classes Available: 60kg, 65kg, 71kg, 79kg, 88kg, 94kg, 110kg, 110kg+

Select any combination:
- 1 class: Session created, no tabs shown
- 2+ classes: Session created, tabs appear
```

### Session Display
```
Session: National Championship 2026
[60kg] [79kg] [88kg] [110kg]  ← Click to switch
    ↓
Shows 1-2 athletes from 60kg
No athletes from other classes visible
```

### Independence Test
1. While on 60kg tab:
   - Enter attempt for Maale (60kg athlete)
   
2. Switch to 79kg tab:
   - Tiger's data unchanged
   - Only Tiger's attempts visible

3. Switch back to 60kg:
   - Maale's data still there
   - Matches what was entered before

## Success Criteria

✅ **Form Phase**:
- [ ] Can select multiple weight classes
- [ ] Selected classes show in summary
- [ ] Session creates with all classes

✅ **Display Phase**:
- [ ] Tabs appear for multi-class
- [ ] Single-class has no tabs
- [ ] Tab names match selected classes

✅ **Filtering Phase**:
- [ ] Clicking tab filters athletes
- [ ] Only one class shown at a time
- [ ] Switching is instant

✅ **Functionality Phase**:
- [ ] Attempt entry works per class
- [ ] Next lifter correct per class
- [ ] DQ toggle independent
- [ ] Ranking independent

✅ **Export/Print Phase**:
- [ ] Export includes all classes
- [ ] Print shows selected class
- [ ] Data integrity maintained

## If Something Goes Wrong

1. **Check browser console** (F12)
   - Look for red error messages
   - Copy the error text

2. **Check backend logs**
   - Terminal running `npm start`
   - Look for 🔴 error messages

3. **Restart components**
   - Backend: Press Ctrl+C, then `npm start`
   - Frontend: Refresh page (Ctrl+F5)

4. **Database check**
   - Verify migration was applied to Supabase
   - Check sessions table has weight_classes column

5. **Rebuild if needed**
   ```bash
   cd apps/admin-panel
   npm run build
   ```

## Next: Real Multi-Class Competition

Once testing is complete, you can:
1. Create one session per competition
2. Select all weight classes used
3. Register athletes by class
4. Use Technical Panel for all classes simultaneously
5. Export complete results by class or entire session

---

**Status**: Ready to test
**Time Estimate**: 10-15 minutes for full verification
