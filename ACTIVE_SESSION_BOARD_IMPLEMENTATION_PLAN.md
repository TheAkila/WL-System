# Active Session Board - Live Competition Technical Panel

## 📋 Overview

Transform the Technical Panel from a static sheet into a **live competition board** that shows real-time lifting order, current lifter, and next athletes - just like professional weightlifting competitions.

## 🎯 Current State Analysis

### ✅ What Already Exists

1. **Database Function:** `get_lifting_order(session_id)` 
   - Already calculates lifting order based on:
     - Requested weight (lightest first)
     - Attempt number (lower first)  
     - Start number (tie-breaker)
   - Returns sorted list of who lifts next

2. **Backend API:** `/api/technical/sessions/:sessionId/lifting-order`
   - Endpoint ready to fetch lifting order
   - Real-time updates via Socket.IO

3. **Frontend Component:** `LiftingOrder.jsx`
   - Displays "Current", "On Deck", "In The Hole"
   - Shows top 3 lifters with color coding
   - Full lifting order list below
   - Weight change functionality

4. **Session State:** `sessions.current_lift`
   - Tracks if competition is in Snatch or Clean & Jerk phase
   - Can be toggled by technical officials

### ❌ What's Missing

1. **Integration:** LiftingOrder component NOT integrated into SessionSheet
2. **Visual Hierarchy:** Sheet doesn't highlight current/next lifters
3. **Auto-sorting:** Sheet stays in start_number order (not lifting order)
4. **Active State:** No visual indication of "who's up next"
5. **Attempt Status:** Can't see pending vs completed attempts at a glance

## 🏆 Standard IWF Competition Board Features

### Essential (Must Have)

1. **Current Lifter Highlight**
   - Large, prominent display
   - Shows: Name, Country, Weight, Attempt #
   - Blue/prominent color background
   - Position: Top of board or highlighted row

2. **Next 2-3 Lifters**
   - "On Deck" (warming up, going 2nd)
   - "In The Hole" (warming up, going 3rd)  
   - Green and Orange color coding
   - Shows same info as current

3. **Auto-Sorted Order**
   - Lightest weight goes first
   - Automatically reorders after each lift
   - Real-time updates when weights change

4. **Attempt Tracking**
   - Visual indicators: Pending ⏳ | Good ✓ | No-Lift ✗
   - Shows attempt number (1/3, 2/3, 3/3)
   - Grays out completed attempts

5. **Lift Phase Indicator**
   - Clear "SNATCH" or "CLEAN & JERK" header
   - Switch button for technical officials
   - Color-coded sections

### Nice to Have

6. **Competition Timer** ⏱️
   - 1-minute or 2-minute countdown
   - Starts when current lifter is called
   - Audio/visual alerts

7. **Bar Loading Calculator** 🏋️
   - Shows which plates to load
   - Example: "145kg = 25+20+10+5"
   - Helps loaders prepare bar

8. **Progress Indicators**
   - X of Y attempts completed
   - Session completion percentage
   - Estimated time remaining

9. **Athlete Photos**
   - Thumbnail next to name
   - Helps officials identify lifters
   - From weigh-in photos

10. **Lot Numbers**
    - Display lot number for tie-breakers
    - Important when weights are equal

## 🎨 Proposed Implementation

### Option 1: Dual View (Recommended)

**Keep both views side-by-side:**

```
┌─────────────────────────────────────────────────┐
│  Technical Panel - Session: Men 81kg           │
├─────────────────────────────────────────────────┤
│                                                 │
│  [Sheet View] [Live Order View] ← Toggle Tabs  │
│                                                 │
│  ┌─ LIVE ORDER VIEW ─────────────────┐         │
│  │                                    │         │
│  │  🎯 CURRENT: #3 John Smith        │         │
│  │     USA • 125kg • Snatch 2/3      │         │
│  │                                    │         │
│  │  🟢 ON DECK: #5 Carlos Rodriguez  │         │
│  │     MEX • 125kg • Snatch 1/3      │         │
│  │                                    │         │
│  │  🟠 IN HOLE: #7 Mike Johnson      │         │
│  │     CAN • 130kg • Snatch 3/3      │         │
│  │                                    │         │
│  │  ─── Full Lifting Order ───       │         │
│  │  4. #2 Emma Wilson - 130kg        │         │
│  │  5. #8 Maria Garcia - 135kg       │         │
│  │  6. #1 Sarah Jones - 135kg        │         │
│  │                                    │         │
│  └────────────────────────────────────┘         │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Option 2: Enhanced Sheet with Live Indicators

**Add live indicators to existing SessionSheet:**

```
┌─────────────────────────────────────────────────────────┐
│ No │ Status │ Name         │ Team │ Snatch │ C&J │ ... │
├────┼────────┼──────────────┼──────┼────────┼─────┼─────┤
│ 3  │ 🎯 UP  │ John Smith   │ USA  │ 120/✓  │     │     │  ← BLUE BG
│ 5  │ 🟢 DECK│ Carlos R.    │ MEX  │ 125/-  │     │     │  ← GREEN BG
│ 7  │ 🟠 HOLE│ Mike J.      │ CAN  │ 125/✓  │     │     │  ← ORANGE BG
│ 2  │        │ Emma Wilson  │ CAN  │ 130/-  │     │     │
│ 8  │        │ Maria Garcia │ MEX  │ 135/-  │     │     │
│ 1  │        │ Sarah Jones  │ USA  │ 135/-  │     │     │
└────┴────────┴──────────────┴──────┴────────┴─────┴─────┘
```

### Option 3: Hybrid (Best of Both)

**Top section = Live Board, Bottom = Full Sheet:**

```
┌─────────────────────────────────────────────────┐
│  SNATCH PHASE - Attempt 5 of 18               │
├─────────────────────────────────────────────────┤
│                                                 │
│  🎯 CURRENT LIFTER                             │
│  ┌──────────────────────────────────────────┐  │
│  │  #3 John Smith (USA)          125 kg    │  │
│  │  Snatch - Attempt 2/3                   │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  🟢 ON DECK: #5 Carlos (MEX) - 125kg - 1/3    │
│  🟠 IN HOLE: #7 Mike (CAN) - 130kg - 3/3      │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  ══ COMPLETE SESSION SHEET ══                  │
│  [Full table with all athletes...]             │
│                                                 │
└─────────────────────────────────────────────────┘
```

## 🔧 Technical Implementation Steps

### Step 1: Add Live Order Data Fetching

**File:** `SessionSheet.jsx`

```javascript
const [liftingOrder, setLiftingOrder] = useState([]);
const [currentLifter, setCurrentLifter] = useState(null);

const fetchLiftingOrder = async () => {
  try {
    const response = await api.get(
      `/technical/sessions/${session.id}/lifting-order`
    );
    const order = response.data.data || [];
    setLiftingOrder(order);
    setCurrentLifter(order[0] || null);
  } catch (error) {
    console.error('Failed to fetch lifting order:', error);
  }
};

useEffect(() => {
  fetchLiftingOrder();
  const interval = setInterval(fetchLiftingOrder, 5000); // Refresh every 5s
  return () => clearInterval(interval);
}, [session.id]);
```

### Step 2: Add Live Order Section

**File:** `SessionSheet.jsx` (before the table)

```jsx
{/* Live Competition Board */}
<div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 
                dark:from-blue-900/20 dark:to-purple-900/20 
                rounded-xl p-6 border-2 border-blue-300 dark:border-blue-700">
  
  {/* Current Lift Phase */}
  <div className="text-center mb-4">
    <h2 className="text-3xl font-bold text-blue-600 dark:text-blue-400">
      {session.current_lift === 'snatch' ? 'SNATCH PHASE' : 'CLEAN & JERK PHASE'}
    </h2>
  </div>

  {/* Top 3 Lifters */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {/* Current Lifter */}
    {liftingOrder[0] && (
      <div className="bg-blue-500 text-white rounded-lg p-4">
        <div className="text-xs font-bold mb-1">🎯 CURRENT</div>
        <div className="text-xl font-bold">{liftingOrder[0].athlete_name}</div>
        <div className="text-sm">{liftingOrder[0].country}</div>
        <div className="text-3xl font-black mt-2">
          {liftingOrder[0].requested_weight} kg
        </div>
        <div className="text-xs mt-1">
          Attempt {liftingOrder[0].attempt_number}/3
        </div>
      </div>
    )}

    {/* On Deck */}
    {liftingOrder[1] && (
      <div className="bg-green-500 text-white rounded-lg p-4">
        <div className="text-xs font-bold mb-1">🟢 ON DECK</div>
        <div className="text-lg font-bold">{liftingOrder[1].athlete_name}</div>
        <div className="text-sm">{liftingOrder[1].country}</div>
        <div className="text-2xl font-black mt-2">
          {liftingOrder[1].requested_weight} kg
        </div>
        <div className="text-xs mt-1">
          Attempt {liftingOrder[1].attempt_number}/3
        </div>
      </div>
    )}

    {/* In The Hole */}
    {liftingOrder[2] && (
      <div className="bg-orange-500 text-white rounded-lg p-4">
        <div className="text-xs font-bold mb-1">🟠 IN HOLE</div>
        <div className="text-lg font-bold">{liftingOrder[2].athlete_name}</div>
        <div className="text-sm">{liftingOrder[2].country}</div>
        <div className="text-2xl font-black mt-2">
          {liftingOrder[2].requested_weight} kg
        </div>
        <div className="text-xs mt-1">
          Attempt {liftingOrder[2].attempt_number}/3
        </div>
      </div>
    )}
  </div>
</div>
```

### Step 3: Highlight Athletes in Sheet Table

**File:** `SessionSheet.jsx` (modify row rendering)

```jsx
// Determine if athlete is current/next
const athleteLifterStatus = (athleteId) => {
  const index = liftingOrder.findIndex(lo => lo.athlete_id === athleteId);
  if (index === 0) return 'current';
  if (index === 1) return 'on-deck';
  if (index === 2) return 'in-hole';
  return null;
};

// In the table row rendering:
<tr
  key={athlete.id}
  className={`border-b ${
    athleteLifterStatus(athlete.id) === 'current' 
      ? 'bg-blue-100 dark:bg-blue-900/30 border-l-4 border-l-blue-500' 
      : athleteLifterStatus(athlete.id) === 'on-deck'
      ? 'bg-green-100 dark:bg-green-900/30 border-l-4 border-l-green-500'
      : athleteLifterStatus(athlete.id) === 'in-hole'
      ? 'bg-orange-100 dark:bg-orange-900/30 border-l-4 border-l-orange-500'
      : athlete.is_dq 
      ? 'opacity-50 bg-slate-100 dark:bg-zinc-800/50' 
      : index % 2 === 0 
      ? 'bg-slate-50/50 dark:bg-zinc-900/30' 
      : ''
  }`}
>
```

### Step 4: Add Status Column

**File:** `SessionSheet.jsx` (add column to table)

```jsx
{/* Add after "No" column header */}
<th className="px-2 py-3 text-center text-sm font-semibold">Status</th>

{/* Add in table body */}
<td className="px-2 py-2 text-center">
  {athleteLifterStatus(athlete.id) === 'current' && (
    <span className="text-2xl">🎯</span>
  )}
  {athleteLifterStatus(athlete.id) === 'on-deck' && (
    <span className="text-2xl">🟢</span>
  )}
  {athleteLifterStatus(athlete.id) === 'in-hole' && (
    <span className="text-2xl">🟠</span>
  )}
</td>
```

### Step 5: Add Real-time Updates

**File:** `SessionSheet.jsx` (socket integration)

```javascript
useEffect(() => {
  // Listen for attempt updates
  socketService.on('attempt:declared', () => {
    fetchLiftingOrder(); // Refresh order
    fetchSheetData(); // Refresh sheet
  });

  socketService.on('attempt:completed', () => {
    fetchLiftingOrder();
    fetchSheetData();
  });

  return () => {
    socketService.off('attempt:declared');
    socketService.off('attempt:completed');
  };
}, []);
```

## 📊 Data Flow

```
Competition Flow:
1. Technical official declares attempt (weight)
   ↓
2. Backend calculates new lifting order
   ↓
3. Socket.IO broadcasts update
   ↓
4. Frontend fetches new lifting order
   ↓
5. UI updates:
   - Current lifter changes
   - Next athletes reorder
   - Sheet highlights update
   ↓
6. Athlete lifts, official records result
   ↓
7. Cycle repeats
```

## 🎨 Visual Design Standards

### Color Coding
- **Blue (#3B82F6):** Current lifter on platform
- **Green (#10B981):** On deck (next, warming up)
- **Orange (#F97316):** In the hole (3rd in line)
- **Gray (#64748B):** Completed attempts
- **Red (#EF4444):** Failed/No-lift attempts
- **Green (#22C55E):** Successful attempts

### Typography
- **Current lifter:** 3xl font, bold
- **On deck/In hole:** 2xl font, semi-bold
- **Weight display:** 4xl font, extra bold
- **Attempt info:** xs font, regular

### Spacing
- Top section (live board): 6 padding
- Card gaps: 4 spacing
- Table rows: 2 padding

## ✅ Implementation Checklist

### Phase 1: Core Functionality
- [ ] Add lifting order state to SessionSheet
- [ ] Fetch lifting order from API
- [ ] Display top 3 lifters (Current, On Deck, In Hole)
- [ ] Add status column to table
- [ ] Highlight current/next athletes in sheet
- [ ] Real-time updates via Socket.IO

### Phase 2: Enhanced Features
- [ ] Auto-refresh every 5 seconds
- [ ] Progress indicator (X of Y attempts)
- [ ] Lift phase toggle button
- [ ] Empty state when no pending attempts
- [ ] Loading states and error handling

### Phase 3: Advanced Features
- [ ] Competition timer integration
- [ ] Bar loading calculator
- [ ] Athlete photos in live board
- [ ] Sound alerts for current lifter
- [ ] Fullscreen mode for TV display

### Phase 4: Polish
- [ ] Responsive design (mobile/tablet)
- [ ] Dark mode optimization
- [ ] Print stylesheet (for paper records)
- [ ] Keyboard shortcuts
- [ ] Animation transitions

## 🚀 Quick Start Commands

### Test Lifting Order API
```bash
curl http://localhost:5000/api/technical/sessions/{SESSION_ID}/lifting-order
```

### Expected Response
```json
{
  "success": true,
  "data": [
    {
      "athlete_id": "uuid",
      "athlete_name": "John Smith",
      "start_number": 3,
      "lift_type": "snatch",
      "attempt_number": 2,
      "requested_weight": 125,
      "lifting_order": 1
    }
  ]
}
```

## 📚 Reference Materials

### IWF Competition Standards
- Lifting order determined by requested weight (lightest first)
- Same weight: lower attempt number goes first
- Same weight + attempt: lower lot/start number goes first
- 1-minute clock for first attempt, 2-minute for consecutive
- Officials can change weights until 30 seconds before lift

### Similar Systems
- IWF Results Management System
- Weighlifting House Scoreboard
- Hercules Weightlifting Software
- Eleiko Competition Software

## 💡 Best Practices

1. **Always show top 3:** Even if only 1 athlete remaining
2. **Auto-update frequently:** 3-5 second refresh interval
3. **Clear visual hierarchy:** Current > On Deck > In Hole
4. **Responsive feedback:** Loading states, success/error toasts
5. **Accessibility:** Color + text labels (not just color)
6. **Print-friendly:** Sheet must be printable for records
7. **Socket fallback:** Polling backup if socket fails

## 🎯 Success Metrics

### Functional
- ✅ Lifting order matches IWF rules 100%
- ✅ Updates propagate to all screens in <1 second
- ✅ No data loss or desync issues
- ✅ Works with 50+ athletes in session

### User Experience
- ✅ Technical officials can see "who's next" instantly
- ✅ Loaders know which weight to prepare
- ✅ Coaches can track their athletes' positions
- ✅ Spectators see live competition status

## 📝 Summary

The system **already has** the core infrastructure:
- ✅ Database function for lifting order
- ✅ Backend API endpoint
- ✅ LiftingOrder component
- ✅ Socket.IO real-time updates

**What's needed:**
- 🔄 Integrate LiftingOrder into SessionSheet
- 🔄 Add visual highlights to sheet table
- 🔄 Display top 3 lifters prominently
- 🔄 Auto-refresh lifting order
- 🔄 Add status indicators

**Estimated effort:** 4-6 hours for Phase 1 core functionality

**Impact:** Transform static sheet into professional live competition board matching IWF standards
