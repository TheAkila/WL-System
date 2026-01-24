# Technical Panel Overview & Workflow

## 🎯 Purpose
The Technical Panel is the **live competition control center** where officials manage real-time lifting sessions, record referee decisions, and track athlete performance.

---

## 📋 Core Components

### 1. **Session Selector**
- **Purpose**: Select which competition session to manage
- **Displays**: All available sessions with gender & weight category info
- **Action**: Clicking a session loads all related data

### 2. **Session Controls**
- **Status Management**: Change session status (Scheduled → In Progress → Completed)
- **Lift Tracking**: Toggle between Snatch and Clean & Jerk phases
- **Real-time Updates**: Broadcasts to all connected clients via WebSocket

### 3. **Dual Lift Display (Desktop)**
Side-by-side layout for simultaneous management:

#### **SNATCH SECTION (Left)**
- Current Snatch attempt display
- Referee Decision Panel (3 referees + head referee)
- Jury Override Panel (overrule referee decisions)
- Lifting Order list

#### **CLEAN & JERK SECTION (Right)**
- Current C&J attempt display
- Referee Decision Panel
- Jury Override Panel
- Lifting Order list

### 4. **Mobile Toggle View**
- Switches between Snatch/C&J tabs on smaller screens
- Same functionality, different layout

---

## 🏋️ Data Flow & Workflow

### **Entry Point**
1. User navigates to Technical Panel
2. Selects a session from dropdown
3. Page loads 3 key data sets via API + WebSocket

### **Initial Data Load** (on session selection)
```
┌─────────────────────────────────────────┐
│ Fetch Lifting Orders (Snatch & C&J)    │ → Sets liftingOrderSnatch/CleanJerk
├─────────────────────────────────────────┤
│ Fetch Current Attempts (Snatch & C&J)  │ → Sets currentAttemptSnatch/CleanJerk
├─────────────────────────────────────────┤
│ Fetch Leaderboard                       │ → Sets leaderboard
└─────────────────────────────────────────┘
            ↓
     Join WebSocket Session Room
```

### **Real-time Attempt Flow**

```
┌─────────────────────────────────────────────────────────────┐
│ ATHLETE DECLARED (via Lifting Order Component)              │
├─────────────────────────────────────────────────────────────┤
│ 1. Front-end: POST /technical/attempts/declare              │
│    - Sends: athleteId, weight, liftType                     │
│                                                              │
│ 2. Backend: Creates attempt record in DB                    │
│    - Sets: lift_type, weight, session_id, athlete_id        │
│    - Default: result = null (pending)                       │
│                                                              │
│ 3. WebSocket 'attempt:created' broadcast                    │
│    - Updates: currentAttemptSnatch/CleanJerk                │
│    - Refreshes: Lifting order                               │
│    - Shows: Toast notification                              │
└─────────────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────────┐
│ REFEREES VOTE (3 Referee Decision Panels)                   │
├─────────────────────────────────────────────────────────────┤
│ Each referee clicks: ✓ GOOD or ✗ NO LIFT                   │
│                                                              │
│ 1. POST /technical/attempts/{id}/referee-decision           │
│    - Records: referee_id, decision                          │
│    - Updates attempt's referee fields:                      │
│      * referee1_decision, referee2_decision, referee3_decision
│      * head_referee_decision (if applicable)                │
│                                                              │
│ 2. System validates if all referees voted                   │
│    IF all 3 voted → AUTOMATICALLY VALIDATES ATTEMPT         │
│                                                              │
│ 3. WebSocket 'attempt:updated' broadcast                    │
│    - Updates: Current attempt with new referee votes        │
│    - Shows referee decision icons in panel                  │
└─────────────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────────┐
│ ATTEMPT VALIDATION (Auto-triggered when all 3 voted)        │
├─────────────────────────────────────────────────────────────┤
│ 1. Backend validates based on referee majority:             │
│    - 2-3 votes "GOOD" → Result = "good" ✓                  │
│    - 2-3 votes "NO" → Result = "no_lift" ✗                 │
│                                                              │
│ 2. Update lifting order: Remove athlete from queue          │
│                                                              │
│ 3. WebSocket 'attempt:validated' broadcast                  │
│    - Clears: currentAttemptSnatch/CleanJerk                 │
│    - Refreshes: Lifting order                               │
│    - Updates: Leaderboard (recalculates totals)             │
│    - Shows: Toast with result                               │
└─────────────────────────────────────────────────────────────┘
```

### **Jury Override Flow** (optional)

```
IF referees make wrong decision OR mistake:
│
├─→ 1. Jury clicks override panel
│   ├─→ Select override decision: "GOOD" or "NO LIFT"
│   └─→ Enter jury member ID + signature
│
├─→ 2. POST /technical/attempts/{id}/jury-override
│   ├─→ Records: juryDecision, juryMemberId
│   └─→ Override all referee decisions
│
└─→ 3. Triggers full refresh (leaderboard, lifting order, etc.)
```

### **Leaderboard Updates**

```
After each validated attempt:

1. Backend recalculates:
   - best_snatch (highest successful snatch weight)
   - best_clean_and_jerk (highest successful C&J weight)
   - total = best_snatch + best_clean_and_jerk
   - rank (by total, descending)

2. WebSocket 'leaderboard:updated' broadcasts new standings

3. Front-end displays:
   ├─ Rank (1st, 2nd, 3rd...)
   ├─ Medal (🥇🥈🥉) - Manually assigned by officials
   ├─ Athlete name & country
   ├─ Best snatch/C&J/Total
   └─ Medal action buttons (Admin can override)
```

---

## 🎮 Key Interactions

### **Lifting Order Management**
- **Shows**: Current, On Deck (next), In Hole (3rd next)
- **Action**: Click athlete to declare attempt weight
- **Auto-sort**: Ordered by: completed status → weight ascending

### **Referee Decision Panel**
- **Shows**: 3 referee buttons + head referee button
- **States**:
  - ⚪ Not voted (gray)
  - ✓ GOOD (green highlight)
  - ✗ NO LIFT (red highlight)
- **Auto-validation**: Triggers when all 3 decide

### **Medal Assignment**
- **Buttons**: 🥇 🥈 🥉 per athlete
- **Behavior**: Click to assign/toggle medal
- **Backend**: Stores in athletes table

### **Attempt Entry Form** (Bulk/Manual)
- **Alternative method**: Manually enter all snatch/C&J attempts for an athlete
- **Use case**: Correction or make-up for skipped attempts
- **Triggered by**: "Open Attempt Entry Form" button

### **Announcements**
- **Live messages**: Send announcements to display screens
- **Broadcast**: Via WebSocket to all connected scoreboard/display clients

---

## 📊 Real-time Event Listeners

```
WebSocket Events the Technical Panel listens for:

1. attempt:created
   └─ New attempt declared → Updates current display

2. attempt:validated  
   └─ Referees completed voting → Clears current, updates leaderboard

3. attempt:updated
   └─ Referee voted → Shows decision in panel

4. jury:override
   └─ Jury overrode result → Refreshes all data

5. liftingOrder:updated
   └─ Lifting order changed → Updates display

6. weightChange:created/updated
   └─ Weight adjusted → Shows notification

7. timer:autoStarted
   └─ 60/120 sec timer started → Shows toast

8. session:updated
   └─ Session status changed → Updates header

9. leaderboard:updated
   └─ Standings recalculated → Updates table
```

---

## 🔄 State Management

### **React State Variables**
```
selectedSession          - Currently selected session
liftingOrderSnatch      - Snatch queue (current, on-deck, in-hole, rest)
liftingOrderCleanJerk   - C&J queue (current, on-deck, in-hole, rest)
currentAttemptSnatch    - Active snatch attempt details
currentAttemptCleanJerk - Active C&J attempt details
leaderboard            - Final standings with totals
loading                - Disable buttons during API call
activeLiftTab          - Mobile: Snatch or C&J (UI state)
showAttemptForm        - Show/hide attempt entry modal
selectedAthleteForForm - Athlete selected in form
```

---

## 🚀 API Endpoints Used

### **Get Data**
- `GET /sessions/{sessionId}/lifting-order?liftType=snatch`
- `GET /technical/sessions/{sessionId}/current-attempt?liftType=snatch`
- `GET /technical/sessions/{sessionId}/leaderboard`

### **Create/Update**
- `POST /technical/attempts/declare` (declare new attempt)
- `POST /technical/attempts/{id}/quick-decision` (add referee vote)
- `POST /technical/attempts/{id}/jury-override` (jury decision)
- `PUT /technical/athletes/{id}/medal` (assign medal)
- `PUT /sessions/{id}` (update session status)

---

## 📱 Responsive Design

### **Desktop** (lg: 1024px+)
- Side-by-side Snatch & C&J panels
- Full width leaderboard below
- Announcement panel

### **Mobile** (< 1024px)
- Snatch/C&J toggle buttons at top
- Single column view
- Same functionality, sequential layout

---

## ⚠️ Key Business Rules

1. **Lifting Order Determination**
   - Based on attempt sequence (who lifted when)
   - Current: Athlete with lowest weight (or first declared if same weight)
   - On Deck: Next in line
   - In Hole: Third in line

2. **Attempt Validation**
   - Can't proceed until 3 referees vote
   - Majority wins (2/3 votes determines result)
   - Head referee can override in tie scenarios

3. **Session Progression**
   - Must select a session first
   - Can't change session with active attempts (need to clear/validate)
   - Status: Scheduled → In Progress → Completed

4. **Medal System**
   - Automatically ranked by total
   - Medals assigned manually by officials
   - Default: 🥇 1st place, 🥈 2nd, 🥉 3rd

---

## 🎬 Example Session Flow

```
1. Admin navigates to Technical Panel
2. Selects "Women 69kg - Session 1"
3. Page loads 15 athletes in lifting order
4. Status shown as "Scheduled"

5. Official clicks "Start Session" → Status = "In Progress"

6. Athlete #1 (Maria) calls 60kg Snatch
7. Panel shows: "Maria - 60kg - Snatch" - attempt:created triggered

8. 3 referees vote:
   - Ref 1: ✓ GOOD
   - Ref 2: ✓ GOOD  
   - Ref 3: ✓ GOOD
   - System auto-validates: GOOD LIFT ✓

9. Leaderboard updates: Maria shows 60kg snatch

10. Next athlete (Anna) shows in current section

11. After Snatch phase complete, toggle to "Clean & Jerk"

12. Repeat for all athletes

13. After all attempts: Assign medals 🥇🥈🥉

14. Click "Complete Session" → Status = "Completed"

15. Leaderboard frozen, results final
```

---

## 🔧 Technical Stack

- **Frontend**: React 18 + Tailwind CSS
- **Real-time**: Socket.IO WebSocket
- **API**: Express REST endpoints
- **Database**: Supabase PostgreSQL
- **State**: React hooks (useState/useEffect)
- **Icons**: Lucide React

---

## 🚨 Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Attempt won't validate | Not all 3 referees voted | Wait for all decisions |
| Leaderboard not updating | Socket connection lost | Refresh page, check network |
| Referee can't vote | Attempt already validated | Clear and redeclare |
| Current attempt disappears | Another admin changed it | Refresh to sync |
| Lifting order wrong | Athletes declared out of order | Use Attempt Form to correct |

