# Complete Demo Guide - WL-System

## 🎯 What You Have Now

- **40 Athletes** across 8 weight categories
- **6 Teams** from USA, Canada, Australia, and UK
- **8 Sessions** ready to run
- **Sample attempts** with results pre-loaded
- **Complete workflow** from setup to results

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Start All 4 Services

Open 4 terminal windows and run:

**Terminal 1: Backend (Port 5000)**
```bash
cd apps/backend
npm run dev
```

**Terminal 2: Admin Panel (Port 3003)**
```bash
cd apps/admin-panel
npm run dev
```

**Terminal 3: Display Screen (Port 5174)**
```bash
cd apps/display-screen
npm run dev
```

**Terminal 4: Scoreboard (Port 5175)**
```bash
cd apps/scoreboard
npm run dev
```

All services should show "ready" messages.

---

## 📊 Demo Workflow

### **Part 1: View Dashboard (2 min)**

1. Open **http://localhost:3003/dashboard**
2. See:
   - ✅ Competition created: "National Weightlifting Championship 2026"
   - ✅ 40 athletes registered
   - ✅ 8 sessions ready
   - ✅ Sample attempts recorded

### **Part 2: View Technical Panel (2 min)**

1. Open **http://localhost:3003/technical**
2. Select a session: "Women - 49kg Category"
3. See:
   - Lifting order (5 athletes)
   - Current athlete details
   - Start and manage session buttons

### **Part 3: Open Display Screen (1 min)**

1. Open **http://localhost:5174** in new tab
2. See:
   - Competition header
   - Current athlete display
   - Top 5 leaderboard
   - Real-time updates

### **Part 4: Open Scoreboard (1 min)**

1. Open **http://localhost:5175** in new tab
2. See:
   - Mobile-friendly leaderboard
   - All athletes with totals
   - Real-time rankings

### **Part 5: Record Live Attempts**

1. Go to Technical Panel (http://localhost:3003/technical)
2. Select session "Women - 49kg Category"
3. Click "Start Session"
4. Enter weight for first athlete (e.g., "75")
5. Click "Declare Attempt"
6. Click "GOOD LIFT" button
7. Watch all 3 screens update in real-time:
   - ✅ Display Screen shows result animation
   - ✅ Scoreboard updates leaderboard
   - ✅ Admin Panel refreshes data

---

## 🖥️ Multi-Screen Setup

### Professional Competition Setup:

```
┌─────────────────────────────────────────┐
│  TV/LED Screen (5174 - Full Screen)    │
│  - Audience viewing                     │
│  - Current athlete display              │
│  - Real-time leaderboard               │
│  - Result animations                    │
└─────────────────────────────────────────┘

┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Official   │  │  Public      │  │  Recording   │
│   Tablet     │  │  Scoreboard  │  │  Camera      │
│   (3003)     │  │  (5175)      │  │              │
└──────────────┘  └──────────────┘  └──────────────┘
```

---

## 🎬 Full Demo Scenario

### Setup (Day of Competition):

1. **Morning:** Competition created with 40 athletes
2. **9:00 AM:** First session starts (Women 49kg)
3. **Athletes call up:** Technical panel controls flow
4. **Live display:** Audience watches on arena TV
5. **Public scoreboard:** Real-time updates on phones/web

### During Competition:

1. **Official enters:** Athlete weight (e.g., 75kg)
2. **Referee decisions:** 3 judges click Good/No Lift
3. **System records:** Decision stored in database
4. **Auto-calculate:** Best lift and total updated
5. **All screens:** Update instantly via Socket.IO

### Results:

1. Session ends
2. Final rankings calculated automatically
3. Medals assigned (Gold/Silver/Bronze)
4. Reports generated
5. Certificates ready to print

---

## 📱 What to Show

### On Display Screen (5174):
- "Current Athlete: Alex Johnson"
- "Weight on Bar: 75kg"
- "Attempt: 1/3 Snatch"
- Result animation: "✓ GOOD LIFT" (green, animated)
- Top 5 leaderboard with scores

### On Scoreboard (5175):
- Real-time rankings
- All athletes with totals
- Snatch and C&J breakdown
- Team standings
- Medal indicators

### On Admin Panel (3003):
- Dashboard showing progress
- Technical panel showing current lifter
- All athlete data
- Session management

---

## 🧪 Testing Scenarios

### Scenario 1: Successful Lift
```
1. Select Women 49kg session
2. Start session
3. Declare attempt: 75kg
4. Click "GOOD LIFT" (3 referees)
5. Observe: Display shows GREEN CHECK, leaderboard updates
```

### Scenario 2: Failed Lift
```
1. Declare attempt: 80kg
2. Click "NO LIFT" (3 referees)
3. Observe: Display shows RED X, athlete continues to next attempt
```

### Scenario 3: Complete Session
```
1. Run through all 3 snatch attempts for athlete
2. Switch to "Clean & Jerk"
3. Run through all 3 C&J attempts
4. Move to next athlete
5. Observe: Leaderboard rankings update automatically
```

### Scenario 4: View Final Results
```
1. After session ends
2. Click "View Results" button
3. See:
   - Final rankings by total
   - Gold/Silver/Bronze medals
   - All athlete scores
```

---

## 🔌 Real-Time Features

### What Updates Instantly:

1. **Display Screen**
   - Current athlete changes
   - Result animations play
   - Leaderboard refreshes

2. **Scoreboard**
   - Rankings update
   - Athlete totals change
   - Medals assigned

3. **Admin Panel**
   - Session data refreshes
   - Stats update
   - Leaderboard table refreshes

### Technology:

- **Socket.IO:** Real-time bidirectional communication
- **Supabase Realtime:** Database change notifications
- **React State:** Auto-update UI on data changes

---

## 🎯 Key Features to Demonstrate

✅ **Multi-Session Support** - 8 different categories running
✅ **Real-Time Updates** - All screens sync instantly
✅ **Auto Calculations** - Results compute automatically
✅ **Responsive Design** - Works on phones, tablets, desktops
✅ **Professional UI** - Clean, modern interface
✅ **Complete Workflow** - From athlete registration to medals

---

## 🐛 Troubleshooting

### Display Screen shows "No Session Found"
- Make sure backend is running (port 5000)
- Make sure a session is created in admin panel

### Scoreboard not updating
- Refresh the page (Ctrl+R or Cmd+R)
- Check if backend is running

### Technical Panel won't start session
- Make sure you selected a session first
- Check browser console for errors

### No real-time updates
- Check if Socket.IO connected (browser console)
- Verify backend is running

---

## 📞 Support

All components are ready to test:
- ✅ Backend API with Supabase
- ✅ Admin Panel with workflow
- ✅ Display Screen with animations
- ✅ Scoreboard with real-time updates
- ✅ Test data with 40 athletes

**Everything is configured and ready to go!** 🚀
