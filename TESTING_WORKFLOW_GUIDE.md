# Complete Workflow Testing Guide

This guide walks you through testing the entire Lifting Live Arena system from competition creation to session completion.

## Prerequisites

✅ **Before You Begin:**
- [ ] Supabase project set up with schema and migrations
- [ ] All `.env` files configured
- [ ] Supabase Storage buckets created (athletes, competitions, teams)
- [ ] Backend temp directory created (`apps/backend/temp`)
- [ ] All npm packages installed

---

## Step 1: Start All Services

### Terminal 1 - Backend
```bash
cd apps/backend
npm run dev
```

**Expected Output:**
```
📊 Using Supabase PostgreSQL database
🚀 Server running on port 5000
🔌 Socket.IO ready
```

### Terminal 2 - Admin Panel
```bash
cd apps/admin-panel
npm run dev
```

**Expected Output:**
```
  ➜  Local:   http://localhost:3000/
```

### Terminal 3 - Display Screen (Optional)
```bash
cd apps/display-screen
npm run dev
```

**Expected Output:**
```
  ➜  Local:   http://localhost:3001/
```

### Terminal 4 - Scoreboard (Optional)
```bash
cd apps/scoreboard
npm run dev
```

**Expected Output:**
```
  ➜  Local:   http://localhost:3002/
```

---

## Step 2: Login to Admin Panel

1. Open browser: `http://localhost:3000`
2. Default credentials:
   - **Email**: `admin@example.com`
   - **Password**: `admin123`
3. Click **"Login"**
4. You should see the Dashboard

**✅ Checkpoint:** You're logged in and see the dashboard with statistics.

---

## Step 3: Create a Competition

1. Click **"Competitions"** in sidebar
2. Click **"Create Competition"** button
3. Fill in the form:
   - **Name**: `2026 National Championships`
   - **Location**: `City Sports Complex`
   - **Date**: Select today or future date
   - **Description**: `Annual national weightlifting championship`
   - **Logo** (optional): Upload an image
4. Click **"Create Competition"**

**✅ Checkpoint:** Competition appears in the list with green "Active" badge.

---

## Step 4: Create Teams (Optional but Recommended)

1. Click **"Teams"** in sidebar
2. Click **"Create Team"** button
3. Create Team 1:
   - **Name**: `Olympic Weightlifting Club`
   - **Country**: `USA`
   - **Coach**: `John Smith`
   - **Logo** (optional): Upload team logo
   - Click **"Create Team"**
4. Create Team 2:
   - **Name**: `National Strength Academy`
   - **Country**: `USA`
   - **Coach**: `Jane Doe`
   - Click **"Create Team"**

**✅ Checkpoint:** Both teams appear in the teams list.

---

## Step 5: Add Athletes

1. Click **"Athletes"** in sidebar
2. Click **"Add Athlete"** button

### Athlete 1 (Lightweight Male)
```
Name: John Anderson
Country: USA
Date of Birth: 1995-05-15
Gender: Male
Body Weight: 60.5
Competition: 2026 National Championships
Team: Olympic Weightlifting Club (optional)
Photo: Upload athlete photo (optional)
```
Click **"Create Athlete"**

### Athlete 2 (Lightweight Male)
```
Name: Mike Chen
Country: USA
Date of Birth: 1997-08-22
Gender: Male
Body Weight: 61.2
Competition: 2026 National Championships
Team: National Strength Academy (optional)
```
Click **"Create Athlete"**

### Athlete 3 (Lightweight Male)
```
Name: David Wilson
Country: USA
Date of Birth: 1996-03-10
Gender: Male
Body Weight: 59.8
Competition: 2026 National Championships
Team: Olympic Weightlifting Club (optional)
```
Click **"Create Athlete"**

### Athlete 4 (Lightweight Female)
```
Name: Sarah Johnson
Country: USA
Date of Birth: 1998-11-20
Gender: Female
Body Weight: 54.5
Competition: 2026 National Championships
```
Click **"Create Athlete"**

**✅ Checkpoint:** 4 athletes appear in the athletes list.

---

## Step 6: Create Sessions

1. Click **"Sessions"** in sidebar
2. Click **"Create Session"** button

### Session 1 - Men's 61kg
```
Competition: 2026 National Championships
Name: Men's 61kg Session A
Gender: Male
Weight Category: 61
Platform: Platform 1
Start Time: Select a time (e.g., 10:00 AM)
Status: scheduled
```
Click **"Create Session"**

### Session 2 - Women's 55kg (Optional)
```
Competition: 2026 National Championships
Name: Women's 55kg Session A
Gender: Female
Weight Category: 55
Platform: Platform 1
Start Time: Select a time (e.g., 2:00 PM)
Status: scheduled
```
Click **"Create Session"**

**✅ Checkpoint:** Sessions appear in the session list.

---

## Step 7: Assign Athletes to Session

1. In **Sessions** page, find "Men's 61kg Session A"
2. Click **"Manage Athletes"** button
3. Select athletes:
   - ✅ John Anderson
   - ✅ Mike Chen
   - ✅ David Wilson
4. Click **"Save Athletes"**

**Optional:** Do the same for Women's session with Sarah Johnson.

**✅ Checkpoint:** Athletes are now assigned to the session.

---

## Step 8: Weigh-In Process

1. Click **"Weigh-In"** in sidebar
2. Select session: **"Men's 61kg Session A"**
3. The 3 athletes should appear

### Weigh-In Athlete 1
- Find **John Anderson**
- Click **"Weigh-In"** button
- Enter **Body Weight**: `61.0` kg
- Click **"Save"** or press Enter
- Status changes to ✅ Completed

### Weigh-In Athlete 2
- Find **Mike Chen**
- Enter body weight: `61.2` kg
- Click Save
- Status: ✅ Completed

### Weigh-In Athlete 3
- Find **David Wilson**
- Enter body weight: `60.5` kg
- Click Save
- Status: ✅ Completed

**✅ Checkpoint:** All athletes show green checkmark in weigh-in status. Progress bar shows 3/3 (100%).

---

## Step 9: Start Competition Session

1. Click **"Technical Panel"** in sidebar
2. Select **"Men's 61kg Session A"** from dropdown
3. Session information loads
4. Click **"Start Session"** button
5. Session status changes to "Active"

**✅ Checkpoint:** Timer appears, lifting order displays, attempt controls are active.

---

## Step 10: Declare Opening Attempts

### Set Snatch Opening Attempts

For each athlete, click the weight input:

**John Anderson:**
- Snatch: `100` kg
- Clean & Jerk: `125` kg

**Mike Chen:**
- Snatch: `95` kg
- Clean & Jerk: `120` kg

**David Wilson:**
- Snatch: `105` kg
- Clean & Jerk: `130` kg

**✅ Checkpoint:** Lifting order updates automatically (lowest snatch first = Mike Chen).

---

## Step 11: Record Attempts

### Attempt 1: Mike Chen - Snatch 95kg

1. Current lifter shows: **Mike Chen - Snatch 95kg**
2. Click **"Start Timer"** (optional - timer counts down)
3. After lift decision:
   - Click **"Good Lift"** ✅ for successful attempt
   - OR Click **"No Lift"** ❌ for failed attempt
4. Lifting order updates

### Attempt 2: John Anderson - Snatch 100kg

1. Click **"Good Lift"** ✅
2. His best snatch = 100kg

### Attempt 3: David Wilson - Snatch 105kg

1. Click **"Good Lift"** ✅
2. His best snatch = 105kg

### Continue with 2nd Snatch Attempts

Declare next attempts (usually +2-5 kg):
- Mike: 98kg → **Good Lift** ✅
- John: 103kg → **No Lift** ❌
- David: 108kg → **Good Lift** ✅

### Continue with 3rd Snatch Attempts

- Mike: 100kg → **Good Lift** ✅ (Best: 100kg)
- John: 103kg → **Good Lift** ✅ (Best: 103kg)
- David: 110kg → **No Lift** ❌ (Best: 108kg)

**✅ Checkpoint:** Snatch phase complete. Leaderboard shows rankings by best snatch.

---

## Step 12: Clean & Jerk Phase

The system automatically switches to Clean & Jerk after all snatch attempts.

### C&J Attempts (Follow same process)

**Attempt 1:**
- Mike: 120kg → **Good Lift** ✅
- John: 125kg → **Good Lift** ✅
- David: 130kg → **Good Lift** ✅

**Attempt 2:**
- Mike: 125kg → **Good Lift** ✅
- John: 128kg → **No Lift** ❌
- David: 135kg → **Good Lift** ✅

**Attempt 3:**
- Mike: 128kg → **Good Lift** ✅ (Best: 128kg)
- John: 130kg → **Good Lift** ✅ (Best: 130kg)
- David: 138kg → **No Lift** ❌ (Best: 135kg)

---

## Step 13: View Final Results

### Check Leaderboard

Final totals should be:
```
1. 🥇 David Wilson   - 108kg + 135kg = 243kg
2. 🥈 John Anderson  - 103kg + 130kg = 233kg
3. 🥉 Mike Chen      - 100kg + 128kg = 228kg
```

**✅ Checkpoint:** Medals are automatically assigned (Gold, Silver, Bronze).

---

## Step 14: Test Real-Time Features

### Display Screen (Port 3001)

1. Open `http://localhost:3001` in another browser/tab
2. Select session: **Men's 61kg Session A**
3. Should show:
   - Current lifter
   - Attempt details
   - Timer (if running)
   - Leaderboard

### Scoreboard (Port 3002)

1. Open `http://localhost:3002` on mobile or browser
2. Select session
3. Should show:
   - Live rankings
   - Current attempt
   - Athlete details

**✅ Checkpoint:** All screens update in real-time when you record attempts in Technical Panel.

---

## Step 15: Test Advanced Features

### Timer Controls

1. In Technical Panel, click **"Start Timer"**
2. Timer counts down from 60s
3. Click **"Pause Timer"** - should pause
4. Click **"Resume"** - continues
5. Click **"Reset Timer"** - back to 60s

**✅ Checkpoint:** Timer syncs across all displays.

### Notifications & Call-Ups

1. Scroll down in Technical Panel
2. Find **"Announcements"** section
3. Type message: `Session break - 5 minutes`
4. Click **"Send Announcement"**
5. Check Display Screen and Scoreboard - notification appears

**Athlete Call-Up:**
1. Find **"Athlete Call-Up"** section
2. Next athlete shows as "On Deck"
3. Click **"Call On Deck"**
4. Athlete receives call-up on displays

**✅ Checkpoint:** Notifications appear on all connected displays.

### Export Reports

1. After session completion, find **"Export"** button
2. Click → **"Session Protocol (PDF)"**
3. PDF downloads with complete results
4. Click → **"Leaderboard (CSV)"**
5. CSV downloads with rankings

**✅ Checkpoint:** PDF and CSV files download successfully.

---

## Step 16: Test System Administration (Admin Only)

### User Management

1. Click **"User Management"** in sidebar (admin only)
2. See list of system users
3. Click **"Add User"**
4. Create new user:
   ```
   Name: Technical Official
   Email: tech@example.com
   Password: tech123
   Role: technical
   ```
5. Click **"Create User"**
6. New user appears in list
7. Test role change: Change role to "viewer"
8. Test password reset: Click key icon, enter new password

**✅ Checkpoint:** User created, role changed, password reset works.

### System Settings

1. Click **"System Settings"** in sidebar
2. View system statistics:
   - Total users
   - Total competitions
   - Total athletes
   - Total sessions
3. Check system health:
   - Database: Online ✅
   - Storage: Online ✅
   - Real-time: Online ✅
   - API: Online ✅
4. Auto-refresh every 30 seconds

**✅ Checkpoint:** Stats display correctly, health indicators show green.

---

## Step 17: Test Image Uploads

### Athlete Photo

1. Go to **Athletes**
2. Click on **John Anderson**
3. Click **"Edit"**
4. Click camera icon or upload area
5. Select athlete photo
6. Click **"Update Athlete"**
7. Photo should display in athlete card

### Competition Logo

1. Go to **Competitions**
2. Edit **"2026 National Championships"**
3. Upload logo image
4. Save
5. Logo appears in competition card

### Team Logo

1. Go to **Teams**
2. Edit **"Olympic Weightlifting Club"**
3. Upload logo
4. Save
5. Logo appears in team card

**✅ Checkpoint:** All images upload and display correctly.

---

## Common Issues & Solutions

### Issue: Backend won't start (Port 5000 in use)

**Solution:**
```bash
lsof -ti:5000 | xargs kill -9
npm run dev
```

### Issue: Athletes don't appear in session

**Solution:**
- Verify athletes are assigned to session
- Check gender and weight category match
- Refresh the page

### Issue: Real-time updates not working

**Solution:**
- Check Socket.IO connection in browser console
- Verify all apps use same backend URL
- Check CORS settings in backend `.env`

### Issue: Images won't upload

**Solution:**
- Verify Supabase Storage buckets exist
- Check bucket names: `athletes`, `competitions`, `teams`
- Ensure buckets are public or have proper policies
- Check `SUPABASE_SERVICE_ROLE_KEY` in backend `.env`

### Issue: Exports fail

**Solution:**
- Verify `apps/backend/temp` directory exists
- Check file permissions
- Verify pdfkit and csv-writer packages installed

---

## Testing Checklist

### Basic Features
- [x] Login authentication
- [x] Create competition
- [x] Create teams
- [x] Add athletes
- [x] Create sessions
- [x] Assign athletes to session
- [x] Weigh-in workflow
- [x] Start session
- [x] Declare attempts
- [x] Record lift decisions
- [x] View leaderboard
- [x] Medal assignment

### Advanced Features
- [x] Timer controls (start/pause/reset)
- [x] Notifications and announcements
- [x] Athlete call-ups
- [x] PDF export
- [x] CSV export
- [x] Image uploads (athletes/competitions/teams)
- [x] User management
- [x] System monitoring
- [x] Real-time sync across displays

### Real-Time Features
- [x] Display screen updates
- [x] Scoreboard updates
- [x] Timer synchronization
- [x] Lifting order updates
- [x] Notification delivery

---

## Performance Benchmarks

Expected response times:
- Login: < 500ms
- Load session: < 1s
- Record attempt: < 200ms
- Real-time update: < 100ms
- PDF generation: < 3s
- Image upload: < 2s

---

## Next Steps After Testing

1. ✅ All features tested and working
2. ⬜ Document any bugs found
3. ⬜ Train users on the system
4. ⬜ Prepare for production deployment
5. ⬜ Set up monitoring and logging
6. ⬜ Create user manual
7. ⬜ Plan backup strategy

---

**Congratulations! Your system is fully tested and ready for use! 🎉**
