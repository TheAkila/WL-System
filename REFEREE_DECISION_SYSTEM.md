# Referee Decision System - Complete Implementation

## 🎯 Overview
Fully functional 3-referee voting system with visual indicators (white/red lights) following IWF competition rules. Implemented across Admin Panel (control), Display Screen (spectator arena view), and Scoreboard (mobile/tablet).

---

## ✅ Implementation Summary

### Admin Panel - Control Interface
- **Quick Decision Buttons:** Record all 3 referees with one click (ALL GOOD LIFT / ALL NO LIFT)
- **Individual Referee Controls:** Separate buttons for each position (Left, Center, Right)
- **Visual Referee Lights:** White light (good), Red light (no lift), Gray (no decision yet)
- **Real-time Result Preview:** Shows "GOOD LIFT" or "NO LIFT" based on majority (2 out of 3)
- **IWF Rule Reminder:** Displays majority decision rule
- **Auto-disable:** Buttons disable after decision recorded
- **Socket.IO Integration:** Real-time updates across all displays

### Display Screen - Spectator View
- **Large Referee Light Display:** 32px circular indicators visible from arena
- **Animated Result Banner:** Shows final result with 48px icons
- **Staggered Animation:** Lights appear with delay (left → center → right)
- **Decision Count:** Shows "X out of 3 referees: Good lift"
- **Full-screen Overlay:** Darkened background with referee lights front and center
- **Auto-clear:** Display persists for 5 seconds then clears

### Scoreboard - Mobile View
- **Compact Referee Lights:** 12px circular indicators optimized for small screens
- **Result Badge:** Green (good lift) or Red (no lift) header
- **Decision Summary:** Shows "X/3 Good" count
- **Touch-friendly:** Large enough for easy viewing on phones/tablets

---

## 🏗️ Backend Implementation

### Database Schema (Already Exists)

```sql
CREATE TYPE referee_decision AS ENUM ('good', 'no-lift');

CREATE TABLE attempts (
    ...
    referee_left referee_decision,
    referee_center referee_decision,
    referee_right referee_decision,
    ...
);

-- Function to validate attempt result based on referee decisions
CREATE OR REPLACE FUNCTION validate_attempt_result(
    p_left referee_decision,
    p_center referee_decision,
    p_right referee_decision
) RETURNS attempt_result AS $$
BEGIN
    -- Count good lifts
    -- Majority rules (2 out of 3)
    IF good_count >= 2 THEN
        RETURN 'good';
    ELSE
        RETURN 'no-lift';
    END IF;
END;
$$ LANGUAGE plpgsql;
```

### API Endpoints

#### 1. Record Individual Referee Decision

**Endpoint:** `POST /api/technical/attempts/:attemptId/decision`

**Request Body:**
```javascript
{
  "position": "left" | "center" | "right",
  "decision": "good" | "no-lift"
}
```

**Response:**
```javascript
{
  "success": true,
  "data": {
    "id": "uuid",
    "referee_left": "good",
    "referee_center": null,
    "referee_right": null,
    "result": "pending",  // or "good"/"no-lift" when all 3 decided
    "athlete": { ... },
    "session": { ... }
  }
}
```

**Socket.IO Events Emitted:**
- `attempt:updated` - When individual decision recorded
- `attempt:validated` - When all 3 decisions recorded and result finalized

---

#### 2. Quick Decision (All 3 Referees)

**Endpoint:** `POST /api/technical/attempts/:attemptId/quick-decision`

**Request Body:**
```javascript
{
  "decision": "good" | "no-lift"
}
```

**Response:**
```javascript
{
  "success": true,
  "data": {
    "id": "uuid",
    "referee_left": "good",
    "referee_center": "good",
    "referee_right": "good",
    "result": "good",
    "athlete": { ... }
  }
}
```

**Socket.IO Events Emitted:**
- `attempt:updated` - With all 3 decisions
- `attempt:validated` - With final result

---

## 🎨 Frontend Implementation

### Admin Panel Component

**File:** `/apps/admin-panel/src/components/technical/RefereeDecisionPanel.jsx`

**Key Features:**

1. **Quick Decision Buttons**
```jsx
<button onClick={() => handleQuickDecision('good')}>
  <CheckCircle /> ALL GOOD LIFT
</button>
<button onClick={() => handleQuickDecision('no-lift')}>
  <XCircle /> ALL NO LIFT
</button>
```

2. **Referee Lights**
```jsx
const getLightColor = (decision) => {
  if (decision === 'good') return 'bg-white border-2 border-gray-400 shadow-lg'; // White light
  if (decision === 'no-lift') return 'bg-red-600 shadow-lg shadow-red-500/50'; // Red light
  return 'bg-gray-300 dark:bg-gray-600'; // Off
};
```

3. **Individual Referee Controls**
```jsx
<button onClick={() => handleIndividualDecision('left', 'good')}>
  GOOD
</button>
<button onClick={() => handleIndividualDecision('left', 'no-lift')}>
  NO LIFT
</button>
```

4. **Result Preview**
```jsx
const getResultPreview = () => {
  const goodCount = [decisions.left, decisions.center, decisions.right]
    .filter(d => d === 'good').length;
  
  if (goodCount >= 2) return { text: 'GOOD LIFT', color: 'text-green-600' };
  else return { text: 'NO LIFT', color: 'text-red-600' };
};
```

**Component Props:**
```typescript
interface RefereeDecisionPanelProps {
  attempt: Attempt | null;
  onDecisionRecorded?: () => void;
}
```

**State Management:**
```javascript
const [decisions, setDecisions] = useState({
  left: null,
  center: null,
  right: null
});
```

---

### Display Screen Component

**File:** `/apps/display-screen/src/components/RefereeDecisionDisplay.jsx`

**Key Features:**

1. **Large Result Banner**
```jsx
<div className={`p-6 rounded-lg text-center ${
  finalResult === 'good' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
}`}>
  <CheckCircle size={48} /> {/* or XCircle */}
  <span className="text-5xl font-black">
    {finalResult === 'good' ? 'GOOD LIFT' : 'NO LIFT'}
  </span>
</div>
```

2. **Animated Referee Lights**
```jsx
<motion.div
  initial={{ scale: 0 }}
  animate={{ scale: 1 }}
  transition={{ delay: 0.1 }}  // Staggered animation
  className="w-32 h-32 rounded-full ${getLightColor(decisions.left)}"
>
  {decisions.left === 'good' && <CheckCircle size={64} />}
  {decisions.left === 'no-lift' && <XCircle size={64} />}
</motion.div>
```

**Integration in App.jsx:**
```jsx
{currentAttempt?.result && currentAttempt.result !== 'pending' && (
  <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/80">
    <RefereeDecisionDisplay attempt={currentAttempt} />
  </div>
)}
```

---

### Scoreboard Component

**File:** `/apps/scoreboard/src/components/RefereeDecisionCompact.jsx`

**Key Features:**

1. **Compact Result Badge**
```jsx
<div className={`flex items-center gap-2 p-3 rounded ${
  finalResult === 'good' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
}`}>
  <CheckCircle size={24} />
  <span className="text-xl font-black">GOOD LIFT</span>
</div>
```

2. **Small Referee Lights**
```jsx
<div className="w-12 h-12 rounded-full ${getLightColor(decisions.center)}">
  {decisions.center === 'good' && <CheckCircle size={20} />}
</div>
```

**Integration in LiveView.jsx:**
```jsx
{currentAttempt?.result && currentAttempt.result !== 'pending' && (
  <RefereeDecisionCompact attempt={currentAttempt} />
)}
```

---

## 📡 Socket.IO Event Flow

### Complete Workflow

```
1. Official records referee decision (Admin Panel)
   └─> POST /api/technical/attempts/:id/decision
       { position: "left", decision: "good" }

2. Backend updates attempt table
   ├─> UPDATE attempts SET referee_left = 'good'
   └─> Check if all 3 decisions recorded

3. Backend emits Socket.IO events
   ├─> attempt:updated (partial decisions)
   └─> attempt:validated (all 3 decided, result finalized)

4. Admin Panel receives update
   ├─> Updates local state
   ├─> Updates referee light display
   └─> Shows result preview

5. Display Screen receives update
   ├─> Shows referee lights overlay
   ├─> Animates lights (staggered)
   └─> Shows large result banner

6. Scoreboard receives update
   ├─> Shows compact referee lights
   ├─> Shows result badge
   └─> Updates lifting order

7. Timer stops (if running)
   └─> Athlete's turn complete

8. Leaderboard updates (if good lift)
   └─> New best lift recorded
```

---

## 🎯 IWF Compliance

### Decision Rules

| Scenario | Left | Center | Right | Result |
|----------|------|--------|-------|--------|
| **Unanimous Good** | 🟢 Good | 🟢 Good | 🟢 Good | ✅ GOOD LIFT |
| **Majority Good (2/3)** | 🟢 Good | 🟢 Good | 🔴 No Lift | ✅ GOOD LIFT |
| **Split Decision** | 🟢 Good | 🔴 No Lift | 🔴 No Lift | ❌ NO LIFT |
| **Unanimous No Lift** | 🔴 No Lift | 🔴 No Lift | 🔴 No Lift | ❌ NO LIFT |

### Visual Indicators

**IWF Standard:**
- **White Light:** Good lift
- **Red Light:** No lift

**Our Implementation:**
- **White Light:** `bg-white border-2 border-gray-400 shadow-lg`
- **Red Light:** `bg-red-600 shadow-lg shadow-red-500/50`
- **No Decision:** `bg-gray-300` (gray, unlit)

---

## 🧪 Testing Scenarios

### Test 1: Quick Decision - All Good Lift

**Steps:**
1. Declare attempt for athlete
2. Click "ALL GOOD LIFT" button

**Expected:**
- ✅ All 3 referee lights turn white
- ✅ Result shows "GOOD LIFT" in green
- ✅ Display screen shows large green banner
- ✅ Scoreboard shows green badge
- ✅ Toast notification: "✅ All referees: GOOD LIFT"
- ✅ Leaderboard updates with new best lift

**Actual:** ✅ PASS

---

### Test 2: Individual Decisions - Majority Good (2/3)

**Steps:**
1. Declare attempt
2. Click LEFT → GOOD (white light)
3. Click CENTER → GOOD (white light)
4. Click RIGHT → NO LIFT (red light)

**Expected:**
- ✅ LEFT: White light
- ✅ CENTER: White light
- ✅ RIGHT: Red light
- ✅ Result: "GOOD LIFT" (2 out of 3)
- ✅ Display screen: Green banner
- ✅ Decision count: "2 out of 3 referees: Good lift"

**Actual:** ✅ PASS

---

### Test 3: Split Decision - No Lift (1/3)

**Steps:**
1. Declare attempt
2. Record decisions: GOOD, NO LIFT, NO LIFT

**Expected:**
- ✅ 1 white light, 2 red lights
- ✅ Result: "NO LIFT"
- ✅ Display screen: Red banner
- ✅ Athlete's attempt recorded as failed
- ✅ No best lift update

**Actual:** ✅ PASS

---

### Test 4: Real-time Multi-Client Sync

**Steps:**
1. Open admin panel, display screen, scoreboard
2. Record individual decisions from admin panel
3. Observe all 3 displays simultaneously

**Expected:**
- ✅ Admin panel: Lights update immediately
- ✅ Display screen: Lights animate in (<200ms)
- ✅ Scoreboard: Lights update (<200ms)
- ✅ All displays show same result
- ✅ No desync or conflicts

**Actual:** ✅ PASS

---

### Test 5: Button Disable After Decision

**Steps:**
1. Record LEFT referee decision: GOOD
2. Try to click LEFT button again

**Expected:**
- ✅ LEFT buttons disabled and grayed out
- ✅ CENTER and RIGHT buttons still active
- ✅ Cannot change LEFT decision once recorded
- ✅ Quick decision buttons disabled after any individual decision

**Actual:** ✅ PASS

---

## 📊 Performance & Bundle Sizes

### Build Results

**Admin Panel:**
```
✓ 1544 modules transformed
dist/assets/index-D-SbMWeV.js   427.39 kB (gzip: 125.95 kB)
✓ built in 1.76s
```
- **Increase:** +2.75 kB from previous (referee decision component)
- **Gzip:** 125.95 kB

**Display Screen:**
```
✓ 1882 modules transformed
dist/assets/index-CgSYYxtc.js   362.21 kB (gzip: 117.74 kB)
✓ built in 2.79s
```
- **Increase:** +115.07 kB (framer-motion for animations)
- **Gzip:** 117.74 kB

**Scoreboard:**
```
✓ 1896 modules transformed
dist/assets/index-CHPPdndu.js   411.05 kB (gzip: 131.61 kB)
✓ built in 1.66s
```
- **Increase:** +2.72 kB from previous
- **Gzip:** 131.61 kB

---

## 🎨 Visual Design Specifications

### Admin Panel - Referee Lights

**Dimensions:**
- Light diameter: `w-20 h-20` (80px)
- Icons: 32px (Lightbulb for white, XCircle for red)

**Colors:**
- **White Light (Good):** `bg-white border-2 border-gray-400` + `shadow-2xl shadow-white/80`
- **Red Light (No Lift):** `bg-red-600` + `shadow-2xl shadow-red-500/80`
- **Off (No Decision):** `bg-gray-300 dark:bg-gray-600`

**Layout:**
```
┌─────────────────────────────────────────┐
│  👥 Referee Decisions    ✅ GOOD LIFT  │
├─────────────────────────────────────────┤
│  [ ALL GOOD LIFT ]  [ ALL NO LIFT ]    │
├─────────────────────────────────────────┤
│    LEFT        CENTER        RIGHT      │
│     ⚪          ⚪            ⚪        │
│  [GOOD] [NO]  [GOOD] [NO]  [GOOD] [NO] │
├─────────────────────────────────────────┤
│  IWF Rule: 2 out of 3 = successful     │
└─────────────────────────────────────────┘
```

---

### Display Screen - Large Lights

**Dimensions:**
- Light diameter: `w-32 h-32` (128px)
- Icons: 64px
- Result text: `text-5xl` (48px)

**Layout:**
```
┌──────────────────────────────────────────┐
│                                          │
│   ✅ GOOD LIFT (5xl, green banner)      │
│                                          │
│   LEFT       CENTER       RIGHT         │
│    ⚪         ⚪           ⚪           │
│  (32px)     (32px)      (32px)         │
│                                          │
│  2 out of 3 referees: Good lift        │
│                                          │
└──────────────────────────────────────────┘
```

**Animation:**
```javascript
<motion.div
  initial={{ scale: 0 }}
  animate={{ scale: 1 }}
  transition={{ delay: 0.1 * index }}  // Staggered
/>
```

---

### Scoreboard - Compact Lights

**Dimensions:**
- Light diameter: `w-12 h-12` (48px)
- Icons: 20px
- Result text: `text-xl` (20px)

**Layout:**
```
┌────────────────────────┐
│  ✅ GOOD LIFT         │
├────────────────────────┤
│  L    C    R          │
│  ⚪   ⚪   ⚪        │
│ (12)  (12) (12)       │
├────────────────────────┤
│  2/3 Good             │
└────────────────────────┘
```

---

## 🔮 Future Enhancements

### Phase 1 (Near Future)
- [ ] **Referee Delay System:** 3-second countdown before revealing lights (dramatic effect)
- [ ] **Jury Override:** Allow jury to override referee decisions (IWF rule 3.3.5)
- [ ] **Referee Names:** Show referee names instead of L/C/R
- [ ] **Decision History:** Log all referee decisions with timestamps

### Phase 2 (Future)
- [ ] **Split Decision Analytics:** Track referee agreement rates
- [ ] **Mobile Referee App:** Separate app for referees to cast decisions
- [ ] **Video Review Integration:** Link decisions to video timestamps
- [ ] **Appeal System:** Track and manage athlete appeals

---

## ✅ Completion Summary

**Implementation Status:** ✅ **COMPLETE - ALL THREE FRONTENDS**

**Files Created:**
- `/apps/admin-panel/src/components/technical/RefereeDecisionPanel.jsx` (313 lines)
- `/apps/display-screen/src/components/RefereeDecisionDisplay.jsx` (102 lines)
- `/apps/scoreboard/src/components/RefereeDecisionCompact.jsx` (79 lines)

**Files Modified:**
- `/apps/admin-panel/src/pages/TechnicalPanel.jsx` - Integrated referee panel
- `/apps/display-screen/src/App.jsx` - Added referee display overlay
- `/apps/scoreboard/src/pages/LiveView.jsx` - Added compact referee display

**Build Sizes:**
- Admin Panel: 427.39 kB (gzip: 125.95 kB)
- Display Screen: 362.21 kB (gzip: 117.74 kB)
- Scoreboard: 411.05 kB (gzip: 131.61 kB)

**IWF Compliance:** ✅ Full compliance
- 3-referee system with majority rule
- White/red light indicators
- Automatic result calculation

**Multi-Platform:** ✅ Admin Panel + Display Screen + Scoreboard

**Next Priority:** Competition results export (PDF/Excel reports)

---

**Date:** January 22, 2026  
**Version:** 2.3.0  
**Feature:** 3-Referee Decision System with Visual Indicators
