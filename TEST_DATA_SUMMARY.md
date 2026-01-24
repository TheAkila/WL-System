# WL-System - Test Data & Demo Configuration

## 📊 Comprehensive Test Data Created

### Competition Details
- **Name:** National Weightlifting Championship 2026
- **Date:** February 15, 2026
- **Location:** National Sports Complex
- **Status:** Active

---

## 👥 Athletes (40 Total)

### Female Athletes (20)
**4 Weight Categories × 5 Athletes Each:**
- **49kg Category:** 5 female athletes
- **55kg Category:** 5 female athletes
- **59kg Category:** 5 female athletes
- **64kg Category:** 5 female athletes

### Male Athletes (20)
**4 Weight Categories × 5 Athletes Each:**
- **61kg Category:** 5 male athletes
- **67kg Category:** 5 male athletes
- **73kg Category:** 5 male athletes
- **81kg Category:** 5 male athletes

---

## 🏢 Teams (6)
```
1. Elite Strength (USA)
2. Iron Warriors (Canada)
3. Olympic Club (UK)
4. Central Academy (USA)
5. Northern Force (Canada)
6. Pacific Power (Australia)
```

---

## 📅 Sessions (8 - One Per Category)

### Women's Sessions
| Session | Category | Time | Athletes |
|---------|----------|------|----------|
| Women - 49kg | 49kg | 9:00 AM | 5 |
| Women - 55kg | 55kg | 11:00 AM | 5 |
| Women - 59kg | 59kg | 1:00 PM | 5 |
| Women - 64kg | 64kg | 3:00 PM | 5 |

### Men's Sessions
| Session | Category | Time | Athletes |
|---------|----------|------|----------|
| Men - 61kg | 61kg | 5:00 PM | 5 |
| Men - 67kg | 67kg | 7:00 PM | 5 |
| Men - 73kg | 73kg | 9:00 AM Day 2 | 5 |
| Men - 81kg | 81kg | 11:00 AM Day 2 | 5 |

---

## 📝 Pre-Loaded Sample Attempts

**First session (Women 49kg):**
- **3 Athletes** with complete attempts
- **18 Total Attempts** (snatch + C&J)
- **Realistic Results** showing Good/No-Lift decisions
- **Calculated Totals** for demo display

**Example Athlete Results:**
```
Athlete: Alex Johnson (49kg category, Team: Elite Strength)

Snatch Attempts:
  1. 70kg - ✓ GOOD
  2. 75kg - ✗ NO LIFT
  3. 73kg - ✓ GOOD
  Best Snatch: 73kg

Clean & Jerk Attempts:
  1. 85kg - ✓ GOOD
  2. 90kg - ✓ GOOD
  3. 95kg - ✗ NO LIFT
  Best C&J: 90kg

Total: 163kg
```

---

## 🎯 How to Use the Test Data

### 1. View Dashboard
```
URL: http://localhost:3003/dashboard
Shows:
  ✅ Competition: National Weightlifting Championship 2026
  ✅ Athletes: 40 registered
  ✅ Sessions: 8 ready
  ✅ Progress: 0% (ready to start)
```

### 2. Check Athletes
```
URL: http://localhost:3003/athletes
Shows:
  ✅ All 40 athletes listed
  ✅ Categorized by weight/gender
  ✅ Team assignments
  ✅ Start numbers assigned
```

### 3. View Sessions
```
URL: http://localhost:3003/sessions
Shows:
  ✅ 8 sessions created
  ✅ Lifting order ready
  ✅ 5 athletes per session
  ✅ Scheduled times
```

### 4. Run Technical Panel
```
URL: http://localhost:3003/technical
Shows:
  ✅ Select any session
  ✅ See athlete lifting order
  ✅ Record attempts
  ✅ Referees enter decisions
```

### 5. Record an Attempt
```
1. Select: Women - 49kg Category
2. Click: Start Session
3. Enter: Weight on bar (e.g., 75kg)
4. Declare: Attempt
5. Referees: Click "GOOD LIFT" or "NO LIFT"
6. Result: Recorded automatically
7. Next: System moves to next athlete
```

### 6. View Live Displays
```
Display Screen (5174): Shows current athlete + leaderboard
Scoreboard (5175): Shows mobile-friendly rankings
Admin Panel (3003): Shows session data + controls
```

---

## 🔄 Data Flow for Demo

```
Technical Panel Records Attempt
    ↓
Backend validates and stores
    ↓
Supabase updates attempts table
    ↓
Realtime notification sent
    ↓
Socket.IO broadcasts to all clients
    ↓
┌─────────────────────┐
│ Display Screen: Shows result animation (GREEN/RED)
│ Scoreboard: Updates athlete ranking
│ Admin Panel: Refreshes leaderboard
│ Dashboard: Updates stats
└─────────────────────┘
```

---

## 📱 Multi-Screen Demo Setup

**Recommended Layout:**
```
┌────────────────────────────────────┐
│   Display Screen (5174)             │
│   - Full screen arena display       │
│   - Shows current athlete           │
│   - Shows result animation          │
│   - Shows top 5 leaderboard         │
└────────────────────────────────────┘

┌──────────────┐  ┌──────────────┐
│ Admin Panel  │  │  Scoreboard  │
│ Technical   │  │  (5175)      │
│ (3003)      │  │  Mobile      │
└──────────────┘  └──────────────┘
```

---

## ✨ Features to Demonstrate

### ✅ Complete Workflow
- Create competition (wizard) ✓
- Register athletes (40 ready) ✓
- Organize sessions (8 ready) ✓
- Run live session ✓
- Record attempts ✓
- Auto-calculate results ✓
- Generate reports ✓

### ✅ Real-Time Updates
- Display updates instantly
- Leaderboard refreshes live
- All screens synchronized
- Socket.IO communication
- 0-lag updates

### ✅ Professional Features
- Multiple weight categories
- Team management
- Start number system
- Lifting order management
- Referee decision recording
- Automatic ranking
- Medal assignment

---

## 🎬 5-Minute Demo Scenario

**Setup:** All 4 services running

**Minute 1:** Show Dashboard
```
http://localhost:3003/dashboard
Point out: 40 athletes, 8 sessions, ready for competition
```

**Minute 2:** Open Multi-Screen
```
Tab 1: http://localhost:5174 (Display Screen)
Tab 2: http://localhost:5175 (Scoreboard)
Tab 3: http://localhost:3003/technical (Technical Control)
```

**Minute 3-4:** Record Attempts
```
1. Select Women 49kg session
2. Click Start
3. Enter weight: 75kg
4. All referees: GOOD LIFT
5. Watch all 3 screens update
6. Record 2-3 more attempts
```

**Minute 5:** Show Results
```
View calculated totals
Show rankings update
Explain auto-medal assignment
```

---

## 🚀 Ready to Run!

Everything is pre-configured:
- ✅ 40 athletes loaded
- ✅ 8 sessions ready
- ✅ Sample attempts recorded
- ✅ All displays configured
- ✅ Real-time sync active

**Just start the services and run the demo!**

---

## 📊 Statistics

| Metric | Value |
|--------|-------|
| Total Athletes | 40 |
| Female Athletes | 20 |
| Male Athletes | 20 |
| Total Teams | 6 |
| Total Sessions | 8 |
| Weight Categories | 8 |
| Sample Attempts | 18 |
| Status | Ready ✅ |

---

## 🎯 Next Steps After Demo

1. **Create more test data** - Add more athletes/sessions
2. **Run full session** - Complete snatch + C&J rounds
3. **Generate reports** - Export PDF results
4. **Test mobile view** - Check scoreboard responsiveness
5. **Test network** - Access from other devices on WiFi

---

**Status: ✨ ALL TEST DATA CREATED AND READY FOR DEMONSTRATION**
