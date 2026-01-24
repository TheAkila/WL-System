# Full System Integration Testing Guide

## 🚀 Quick Start (5 minutes)

### 1. Start Backend
```bash
cd apps/backend
npm install
npm run dev
```
Backend will run on `http://localhost:5000` and:
- ✅ Seed default users automatically
- ✅ Initialize WebSocket server
- ✅ Connect to Supabase database

### 2. Start Admin Panel
```bash
cd apps/admin-panel
npm run dev
```
Admin Panel will run on `http://localhost:3000`

### 3. Start Display Screen (Optional)
```bash
cd apps/display-screen
npm run dev
```
Display Screen will run on `http://localhost:3001`

### 4. Start Scoreboard (Optional)
```bash
cd apps/scoreboard
npm run dev
```
Scoreboard will run on `http://localhost:3002`

---

## 🧪 Complete Test Workflow

### Phase 1: Authentication (5 mins)
**Goal**: Verify login and authentication system

#### Test 1.1: Admin Login
1. Open `http://localhost:3000`
2. You should see login page (redirected from `/`)
3. Enter credentials:
   - Email: `admin@test.com`
   - Password: `password123`
4. Click Login
5. ✅ Should redirect to Dashboard
6. Check browser console for logs
7. Check localStorage for `token` and `user` keys

**Expected Results**:
- ✅ Login successful
- ✅ Token stored in localStorage
- ✅ User info displayed in top nav
- ✅ Redirected to dashboard
- ✅ No errors in console

#### Test 1.2: Technical User Login
1. Open `http://localhost:3000`
2. Click Logout (if still logged in)
3. Login with:
   - Email: `tech@test.com`
   - Password: `password123`
4. ✅ Should be able to access Technical Panel

**Expected Results**:
- ✅ Technical user can login
- ✅ Can access technical features
- ✅ Dashboard shows tech user name

#### Test 1.3: Invalid Credentials
1. Try logging in with:
   - Email: `admin@test.com`
   - Password: `wrong`
2. ✅ Should show error toast
3. ✅ Should stay on login page

**Expected Results**:
- ✅ Error toast appears
- ✅ Cannot access dashboard

---

### Phase 2: Competitions Management (10 mins)
**Goal**: Test full CRUD operations for competitions

#### Test 2.1: Create Competition
1. Login as admin
2. Click "Competitions" in sidebar
3. Click "New Competition" button
4. Fill form:
   ```
   Name: Test Championship 2026
   Date: 2026-06-15
   Location: Test Arena
   Organizer: Test Organization
   Description: A test competition
   Status: Upcoming
   ```
5. Click "Create Competition" button
6. ✅ Should show success toast
7. ✅ Competition should appear in list

**Expected Results**:
- ✅ Form submits successfully
- ✅ Toast notification appears
- ✅ New competition in list

#### Test 2.2: Edit Competition
1. Click "Edit" button on a competition
2. Change name to: "Updated Championship"
3. Click "Update Competition"
4. ✅ Competition name should update

**Expected Results**:
- ✅ Form populates with existing data
- ✅ Update successful
- ✅ List refreshes with new data

#### Test 2.3: Search Competition
1. In Competitions page, search for "Updated"
2. ✅ Should filter results in real-time

**Expected Results**:
- ✅ Search works instantly
- ✅ Only matching competitions shown

#### Test 2.4: Filter by Status
1. Create competitions with different statuses
2. Filter by "Active" status
3. ✅ Only active competitions shown

**Expected Results**:
- ✅ Filter dropdown works
- ✅ List updates correctly

#### Test 2.5: Delete Competition
1. Click "Delete" button on a competition
2. Confirm deletion
3. ✅ Competition removed from list

**Expected Results**:
- ✅ Confirmation dialog appears
- ✅ Competition deleted successfully
- ✅ Success toast appears

---

### Phase 3: Athletes Management (10 mins)
**Goal**: Test athlete registration and management

#### Test 3.1: Register Athlete
1. Click "Athletes" in sidebar
2. Click "Register Athlete" button
3. Fill form:
   ```
   Full Name: John Smith
   Country: USA
   Gender: Male
   Weight Category: 81
   Body Weight: 80.5
   Start Number: 1
   Select Session: (select any session)
   ```
4. Click "Register Athlete" button
5. ✅ Should show success toast
6. ✅ Athlete should appear in table

**Expected Results**:
- ✅ Form validation works
- ✅ Athlete registered successfully
- ✅ Appears in athletes list

#### Test 3.2: View Athletes in Table
1. Athletes page should show table with columns:
   - Name
   - Country
   - Gender
   - Weight Category
   - Body Weight
   - Actions
2. ✅ All registered athletes listed

**Expected Results**:
- ✅ Table displays all athletes
- ✅ Data formatted correctly
- ✅ Responsive table layout

#### Test 3.3: Filter by Gender
1. Register both male and female athletes
2. Filter by "Women"
3. ✅ Only female athletes shown

**Expected Results**:
- ✅ Gender filter works
- ✅ Can switch between categories

#### Test 3.4: Search Athletes
1. Search for "John"
2. ✅ Should filter athletes in real-time

**Expected Results**:
- ✅ Search case-insensitive
- ✅ Instant filtering

#### Test 3.5: Edit Athlete
1. Click "Edit" on an athlete
2. Change body weight
3. Click "Update Athlete"
4. ✅ Changes saved

**Expected Results**:
- ✅ Form populates existing data
- ✅ Update successful

#### Test 3.6: Delete Athlete
1. Click "Delete" on athlete
2. Confirm deletion
3. ✅ Athlete removed from list

**Expected Results**:
- ✅ Confirmation appears
- ✅ Deletion successful

---

### Phase 4: Sessions Management (10 mins)
**Goal**: Test session creation and management

#### Test 4.1: Create Session
1. Click "Sessions" in sidebar
2. Click "New Session" button
3. Fill form:
   ```
   Select Competition: (choose one)
   Session Name: Men 81kg A Session
   Weight Category: 81
   Gender: Male
   Status: Scheduled
   Current Lift: Snatch
   ```
4. Click "Create Session"
5. ✅ Should appear in session list

**Expected Results**:
- ✅ Form validates
- ✅ Session created
- ✅ Appears in list with correct status

#### Test 4.2: View Sessions
1. Sessions page should display:
   - Session name
   - Status badge
   - Weight category
   - Gender
   - Current lift
   - Edit/Delete buttons
2. ✅ Can see all sessions

**Expected Results**:
- ✅ All sessions listed
- ✅ Status badges color-coded
- ✅ Responsive layout

#### Test 4.3: Change Session Status
1. Edit a session
2. Change status to "In Progress"
3. Click "Update Session"
4. ✅ Should show "LIVE" indicator
5. ✅ Status badge changes to green

**Expected Results**:
- ✅ Status updates
- ✅ Live indicator appears for in-progress
- ✅ Color changes appropriately

#### Test 4.4: Search Sessions
1. Search for session name
2. ✅ Filters in real-time

**Expected Results**:
- ✅ Search works
- ✅ Instant filtering

#### Test 4.5: Filter by Status
1. Create sessions with different statuses
2. Filter by "In Progress"
3. ✅ Only in-progress sessions shown

**Expected Results**:
- ✅ Filter works correctly
- ✅ Can switch filters

#### Test 4.6: Edit Session
1. Click Edit on session
2. Change current lift to "Clean & Jerk"
3. Click "Update Session"
4. ✅ Changes saved

**Expected Results**:
- ✅ Form pre-fills data
- ✅ Update successful

#### Test 4.7: Delete Session
1. Click Delete on session
2. Confirm
3. ✅ Session removed

**Expected Results**:
- ✅ Confirmation dialog
- ✅ Deletion successful

---

### Phase 5: Dashboard & Navigation (5 mins)
**Goal**: Test dashboard statistics and navigation

#### Test 5.1: Dashboard Stats
1. Click "Dashboard" in sidebar
2. ✅ Should display statistics:
   - Total Competitions
   - Total Athletes
   - Total Sessions
   - Active Sessions
3. Stats should match created items

**Expected Results**:
- ✅ Stats load and display
- ✅ Numbers are accurate
- ✅ Update when items created/deleted

#### Test 5.2: Quick Actions
1. Dashboard should show buttons:
   - Create Competition
   - Register Athlete
   - Create Session
   - Go to Technical Panel
2. Click each button
3. ✅ Should navigate to correct page

**Expected Results**:
- ✅ All buttons functional
- ✅ Navigate to correct pages
- ✅ Quick access works

#### Test 5.3: Navigation
1. Click each sidebar item:
   - Dashboard
   - Technical Panel
   - Competitions
   - Athletes
   - Sessions
2. ✅ Should navigate correctly
3. ✅ Active link highlighted

**Expected Results**:
- ✅ All routes accessible
- ✅ Active link visually indicated
- ✅ Navigation smooth

---

### Phase 6: Technical Panel (15 mins)
**Goal**: Test real-time features and WebSocket

#### Test 6.1: Select Session
1. Click "Technical Panel" in sidebar
2. ✅ Should show session selector
3. Create/ensure an "In Progress" session exists
4. Click on a session card to select it
5. ✅ Should load lifting order

**Expected Results**:
- ✅ Sessions load
- ✅ Can select session
- ✅ Lifting order displays
- ✅ Current attempt shown

#### Test 6.2: WebSocket Connection
1. Open browser DevTools Console
2. Look for Socket.IO connection logs
3. ✅ Should see: "✅ Socket connected: [socket-id]"
4. Keep console open for next tests

**Expected Results**:
- ✅ Socket.IO connects successfully
- ✅ Connection ID shown

#### Test 6.3: Real-time Updates
1. Open two browser windows:
   - Window A: Admin Panel > Technical Panel (session selected)
   - Window B: Display Screen app
2. In Window A, declare an attempt (if interface allows)
3. ✅ Window B should update in real-time
4. ✅ Console should show WebSocket events

**Expected Results**:
- ✅ Real-time data sync
- ✅ WebSocket events broadcast
- ✅ No delays in updates

---

### Phase 7: Display Screen (10 mins)
**Goal**: Test display screen real-time features

#### Test 7.1: Auto-Session Detection
1. Open `http://localhost:3001`
2. ✅ Should auto-detect active session
3. If no active sessions, should show message
4. ✅ Can select session manually

**Expected Results**:
- ✅ Auto-detection works
- ✅ Displays session info
- ✅ Graceful handling if no sessions

#### Test 7.2: Athlete Display
1. Ensure session has athletes
2. Display screen should show:
   - Current athlete
   - Current lift weight
   - Attempt number
3. ✅ Format should be clear and prominent

**Expected Results**:
- ✅ Large, readable display
- ✅ Proper information shown
- ✅ Updates in real-time

#### Test 7.3: WebSocket Connection
1. Open browser console
2. ✅ Should show Socket.IO connection
3. Check for event logs

**Expected Results**:
- ✅ Connected to WebSocket
- ✅ Receiving updates

---

### Phase 8: Scoreboard (10 mins)
**Goal**: Test scoreboard features

#### Test 8.1: Live View
1. Open `http://localhost:3002`
2. Click "Live" in navigation
3. ✅ Should show active session
4. ✅ Leaderboard should update in real-time

**Expected Results**:
- ✅ Live view loads
- ✅ Session data displays
- ✅ Real-time updates work

#### Test 8.2: Navigation
1. Click each navigation item:
   - Live
   - Leaderboard
   - Medals
   - Results
2. ✅ Should navigate between views

**Expected Results**:
- ✅ All routes work
- ✅ Navigation smooth
- ✅ Each view loads data

#### Test 8.3: Leaderboard
1. Click "Leaderboard"
2. ✅ Should show athletes ranked by results
3. ✅ Scores/totals displayed

**Expected Results**:
- ✅ Leaderboard displays
- ✅ Athletes ranked correctly
- ✅ Scores accurate

#### Test 8.4: Medals
1. Click "Medals"
2. ✅ Should show medal table
3. ✅ Gold/Silver/Bronze shown

**Expected Results**:
- ✅ Medal display works
- ✅ Proper medal icons/colors

---

### Phase 9: Error Handling (5 mins)
**Goal**: Test error handling and edge cases

#### Test 9.1: Network Error
1. Turn off internet/disconnect
2. Try to perform API action
3. ✅ Should show error toast
4. ✅ Should suggest reconnecting

**Expected Results**:
- ✅ Error handling works
- ✅ User informed
- ✅ No crashes

#### Test 9.2: Invalid Form Input
1. Try to submit form with empty required fields
2. ✅ Browser validation should prevent submission

**Expected Results**:
- ✅ Form validation works
- ✅ User guided to fix fields

#### Test 9.3: Logout & Re-login
1. Click logout button
2. ✅ Should redirect to login
3. ✅ Token removed from localStorage
4. Try accessing dashboard directly
5. ✅ Should redirect to login

**Expected Results**:
- ✅ Logout works
- ✅ Session cleared
- ✅ Protected routes blocked

---

## 📊 Test Results Summary

### Create a test result checklist:

```
Phase 1: Authentication        [  /  ] %
Phase 2: Competitions          [  /  ] %
Phase 3: Athletes              [  /  ] %
Phase 4: Sessions              [  /  ] %
Phase 5: Dashboard & Nav       [  /  ] %
Phase 6: Technical Panel       [  /  ] %
Phase 7: Display Screen        [  /  ] %
Phase 8: Scoreboard            [  /  ] %
Phase 9: Error Handling        [  /  ] %

TOTAL:                         [  /  ] %
```

---

## 🐛 Troubleshooting

### Backend won't start
- Check if port 5000 is in use: `lsof -i :5000`
- Verify `.env` file in `apps/backend`
- Check Supabase credentials
- Check if `node_modules` installed: `npm install`

### API calls failing
- Verify backend running on `http://localhost:5000`
- Check browser Network tab for failed requests
- Check backend console for errors
- Verify `.env` `VITE_API_URL` correct

### WebSocket not connecting
- Verify backend running
- Check browser console for errors
- Look for Socket.IO connection attempts
- Check CORS settings in backend

### Admin panel not loading data
- Login first (should see dashboard)
- Check if backend has test data
- Verify API endpoints returning data
- Check browser console for errors

### Display Screen not auto-detecting session
- Ensure session has status "in-progress"
- Refresh page to retry auto-detection
- Manually select session

---

## ✅ Integration Success Criteria

All of the following must pass:

- ✅ Authentication system working
- ✅ All CRUD operations successful
- ✅ Real-time updates working
- ✅ WebSocket connected
- ✅ No console errors
- ✅ All pages load
- ✅ Form validation works
- ✅ Navigation working
- ✅ Error handling graceful
- ✅ Data persists in database

---

## 🎯 Final Validation

After completing all tests:

1. ✅ All features working as expected
2. ✅ No bugs or errors
3. ✅ System ready for live use
4. ✅ Data correctly synchronized
5. ✅ Real-time features functional

**STATUS**: 🟢 **READY FOR PRODUCTION**

