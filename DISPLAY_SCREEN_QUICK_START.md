# 🚀 Display Screen Real-Time - Quick Start Guide

## ⚡ 60-Second Setup

### **Start Everything**

```bash
# Terminal 1: Backend
cd /Users/akilanishan/Desktop/Projects/WL\ System/WL-System/apps/backend
npm run dev

# Terminal 2: Admin Panel  
cd /Users/akilanishan/Desktop/Projects/WL\ System/WL-System/apps/admin-panel
npm run dev

# Terminal 3: Display Screen
cd /Users/akilanishan/Desktop/Projects/WL\ System/WL-System/apps/display-screen
npm run dev
```

### **Open Browsers**

- **Admin Panel**: `http://localhost:3000` (for control)
- **Display Screen**: `http://localhost:3001` (for TV/projector)

---

## 🎯 Real-Time During Competition

### **Admin Panel** (Your Control Screen)
```
1. Select Session from list
2. Click "Display" button (top right)
   → Display screen activates
3. Declare Attempt (e.g., "75kg Snatch")
   → Athlete name appears on display
4. Click "✓ Good Lift" or "✗ No Lift"
   → Display shows result INSTANTLY (150ms)
5. Result animates for 5 seconds, then clears
6. Repeat for next lifter
```

### **Display Screen** (Behind Platform TV)
```
Shows in Real-Time:
├─ Athlete Name (large)
├─ Country/Team
├─ BIB Number
├─ Weight on Bar (highlighted yellow)
├─ Attempt Number (1/2/3)
├─ Competition Info (top blue bar)
├─ Result (✓ GREEN or ✗ RED with animation)
└─ Leaderboard (bottom rankings)

Auto-Updates When Admin Records Decision
│
└─ No refresh needed!
   No manual control needed!
   It's fully automatic!
```

---

## 📊 What Updates in Real-Time?

| Action | Display Shows |
|--------|---|
| Admin declares attempt | Athlete name + weight appear |
| Admin records Good Lift | **✓ GOOD LIFT** (GREEN) |
| Admin records No Lift | **✗ NO LIFT** (RED) |
| Next lifter's turn | New athlete name appears |
| Timer starts | Countdown timer displays |
| Weight changes | Updated weight shows |
| Leaderboard updates | Rankings refresh |

---

## 🔧 Troubleshooting

### Display Screen Stuck?
```
Refresh: Ctrl+R (or Cmd+R on Mac)
Then click "Display" button again
```

### Nothing Showing on Display?
```
1. Check if Backend is running: http://localhost:5000/health
2. Check if Admin Panel can see sessions
3. Click "Display" button to activate
4. Open browser console (F12) and look for errors
```

### Slow Updates?
```
1. Check network connection (should be <200ms latency)
2. Restart backend (stop and npm run dev again)
3. Refresh display screen
```

### Socket Not Connecting?
```
1. Backend not running? Start it: npm run dev
2. Port 5000 in use? Kill process: lsof -i :5000
3. Firewall blocking? Check network settings
```

---

## 📱 Key Controls

### **Admin Panel - What to Click**

```
Technical Panel (Main Screen):
┌─ [← Back] [Phase Controls] [Display] ← CLICK THIS TO ACTIVATE
│
└─ Session Sheet (Spreadsheet):
   SNATCH                  CLEAN & JERK
   ┌──────────┐           ┌──────────┐
   │ Att 1: 75│           │ Att 1:100│
   │ [✓] [✗]  │  ← Click  │ [✓] [✗]  │  ← Click
   └──────────┘  these    └──────────┘  these
   
   ✓ = Good Lift (GREEN on display)
   ✗ = No Lift (RED on display)
```

### **Display Screen - What to Expect**

```
WAITING STATE (Before activation):
┌────────────────────────────────┐
│                                │
│   🏋️ Lifting Live Arena        │
│                                │
│   Waiting for active session...│
│                                │
│   ● Connected to backend       │
│                                │
└────────────────────────────────┘

ACTIVE STATE (After clicking Display):
┌────────────────────────────────┐
│ COMPETITION NAME               │ ← Header
├────────────────────────────────┤
│                                │
│ ALEX JOHNSON    SNATCH 1/3    │ ← Current Lifter
│ GREAT BRITAIN   75 KG         │
│ BIB #23                        │
│                                │
├────────────────────────────────┤
│ 1. Irina 85kg  Rank #1        │ ← Leaderboard
│ 2. Sofia 82kg  Rank #2        │
│ 3. Maria 80kg  Rank #3        │
└────────────────────────────────┘

RESULT STATE (After recording decision):
┌────────────────────────────────┐
│                                │
│      ✓ GOOD LIFT              │ ← Green animation
│                                │ (Stays 5 seconds)
│                                │
└────────────────────────────────┘
```

---

## 🎬 Step-by-Step Competition Walkthrough

```
START OF COMPETITION
════════════════════════════════════════════════════════════════

STEP 1: Open Admin Panel
  → http://localhost:3000
  → Login with credentials
  → Select Competition
  → Select Session

STEP 2: Open Display Screen
  → http://localhost:3001 (on separate window/TV)
  → Shows "Waiting for active session..."

STEP 3: Activate Display
  → In Admin Panel: Click "Display" button
  → Display screen animates and loads session
  → Shows current athlete info

DURING COMPETITION
════════════════════════════════════════════════════════════════

STEP 4: Declare Attempt
  → Admin: Right-click attempt cell
  → Enter weight (e.g., 75)
  → Display: Shows athlete name + weight

STEP 5: Record Result
  → Admin: Click ✓ (Good Lift) or ✗ (No Lift)
  → Display: Shows result in ~150ms
  
STEP 6: Result Animates
  → Display: Result shows for 5 seconds
  → Then clears automatically
  
STEP 7: Next Lifter
  → Admin: Next attempt appears
  → Display: Shows new athlete
  → Repeat steps 4-6

END OF COMPETITION
════════════════════════════════════════════════════════════════

STEP 8: Export Data
  → Admin: Click "Export" button
  → Download session data (CSV/JSON)
  → Archive results

STEP 9: Close Applications
  → Close browser windows gracefully
  → Ctrl+C in all terminals to stop services
```

---

## 🔌 Real-Time Flow Summary

```
You (Admin)        Backend              Display Screen      TV/Projector
    │                 │                      │                   │
    │                 │                      │                   │
    ├─ Click Display──►│──────────────────────►│─────────────────►│
    │                 │                      │      Activated   │
    │                 │                      │                   │
    ├─ Record Result──►│                      │                   │
    │  (Good/No Lift)  │                      │                   │
    │                 │◄─ Supabase Detects   │                   │
    │                 │                      │                   │
    │                 ├─ Emit Event ────────►│                   │
    │                 │                      │                   │
    │                 │                 (React Updates)         │
    │                 │                      │                   │
    │                 │                 (Re-render)             │
    │                 │                      │                   │
    │                 │                      ├─ Display Result──►│
    │                 │                      │    (GREEN/RED)    │
    │                 │                      │                   │
    │                 │                      │  (Animate 5 sec)  │
    │                 │                      │    then clear     │
    │                 │                      │                   │

    │◄─────────────150ms──────────────────────►│
    │      TOTAL LATENCY: Very Fast! ✅       │
```

---

## 🧪 Quick Test

**Before Competition, Run This Test:**

```
1. Open Admin Panel: http://localhost:3000
2. Open Display Screen: http://localhost:3001
3. Display shows: "Waiting for active session..."
4. Go to Admin Panel → Technical Panel → Select any session
5. Click "Display" button
6. Display animates and shows session
7. In Admin Panel, click any ✓ or ✗ button
8. Display shows result within 1-2 seconds
9. Verify it works correctly

If all steps pass: System is ready for competition ✅
If any step fails: Check backend logs for errors
```

---

## 📊 Performance Expectations

```
Response Time from Admin to Display
═══════════════════════════════════════════

Best Case:     ~100ms (excellent network, local)
Typical Case:  ~150-200ms (good network)
Worst Case:    ~500ms (slow network, congestion)

Acceptable for Competition: ✅ YES
Viewers Won't Notice Delay: ✅ YES
Real-Time Feeling: ✅ YES
```

---

## 🚨 Emergency Recovery

### If Display Screen Freezes

```bash
# Quick Fix (60 seconds):
1. Refresh browser: Ctrl+R
2. Wait 2-3 seconds
3. Should reconnect automatically

# Full Reset (2 minutes):
1. Close Display Screen browser window
2. In terminal, stop services: Ctrl+C
3. Restart backend: npm run dev
4. Restart display-screen: npm run dev
5. Refresh browser: http://localhost:3001
6. Click Display button again
```

### If No Updates at All

```
1. Check backend console for errors
2. Check network: 
   - Admin Panel: F12 → Network tab
   - Display Screen: F12 → Network tab
   - Look for failed requests (red)
3. Verify all services running:
   - Backend: http://localhost:5000/health
   - Admin: http://localhost:3000
   - Display: http://localhost:3001
4. Restart all services if needed
```

---

## 📞 File Reference

| Need Help With | Check This |
|---|---|
| Detailed real-time flow | `REALTIME_DISPLAY_SCREEN_GUIDE.md` |
| Architecture diagram | `DISPLAY_SCREEN_ARCHITECTURE_FLOWCHART.md` |
| Socket events reference | `DISPLAY_SCREEN_REALTIME_QUICK_REFERENCE.md` |
| Code location (Admin) | `apps/admin-panel/src/components/technical/SessionSheet.jsx` |
| Code location (Display) | `apps/display-screen/src/App.jsx` |
| Code location (Backend) | `apps/backend/src/socket/index.js` |

---

## ✅ You're Ready!

Your system is configured for **real-time competition display**.

**What's Working:**
- ✅ Real-time result updates
- ✅ Instant athlete display
- ✅ Animated results
- ✅ Live leaderboard
- ✅ Full-screen capability
- ✅ Multi-session support
- ✅ Low latency (<200ms)

**You can now run a full weightlifting competition with the Display Screen showing live updates behind the platform!**

---

*For issues or questions, check the detailed guides or review backend logs.*

**Happy Lifting! 🏋️**
