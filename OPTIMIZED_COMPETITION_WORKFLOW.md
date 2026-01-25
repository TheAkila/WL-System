# Optimized Competition Workflow - Complete System Design

## 📋 Core Workflow Flow

```
COMPETITION LIFECYCLE:
┌─────────────┐
│  CREATE     │
│ COMPETITION │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   CREATE    │  
│  SESSIONS   │  
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│  SESSION CARD SHOWS │
│ [Start Weigh In]    │  (button unlocked)
│ [Start Competition] │  (button locked - greyed out)
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│   ADD TEAMS         │
│   ADD ATHLETES      │
└──────┬──────────────┘
       │
       ▼
┌──────────────────────────┐
│  ADMIN CLICKS            │
│ [START WEIGH IN]         │
│ Session State: weighing  │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│  WEIGH-IN PROCESS        │  (Athletes data entry)
│  - Record body weight    │
│  - Record start weight   │
│ [Weigh In Complete] btn  │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│  WEIGH IN COMPLETE       │
│  State: ready_to_start   │
│ [Start Competition] NOW  │
│  UNLOCKED ✅            │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│  ADMIN CLICKS            │
│ [START COMPETITION]      │
│ Session State: active    │
│                          │
│ Session Header Shows:    │
│ [Start Snatch] [Start C&J]
│ Print  Export  Refresh   │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│  SNATCH PHASE ACTIVE     │  (C&J button LOCKED)
│  State: snatch_active    │
│                          │
│ - Grid shows lifting order
│ - Next lifter's         │
│   TARGET WEIGHT CELL    │  ⭐ HIGHLIGHTED (not row)
│   highlighted in GOLD   │
│ - 
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ ALL SNATCH COMPLETE      │
│ [Complete Snatch Phase] btn
│ State: snatch_complete   │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│  TRANSITION ALLOWED      │
│ [Start C&J] NOW         │
│  UNLOCKED ✅            │
│ State: clean_jerk_active│
│ [Start Snatch] locked   │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│  C&J PHASE ACTIVE        │  (Snatch button LOCKED)
│ State: clean_jerk_active │
│                          │
│ - Grid shows lifting order
│ - Next lifter's         │
│   TARGET WEIGHT CELL    │  ⭐ HIGHLIGHTED (not row)
│   highlighted in GOLD   │
│ 
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ ALL C&J COMPLETE         │
│ [Complete C&J Phase] btn │
│ State: complete          │
│                          │
│ FINAL RANKINGS LOCKED    │
│ Medal Assignment Ready   │
└──────────────────────────┘
```

---

## 🗄️ Database Schema Updates Required

### Sessions Table
```sql
ALTER TABLE sessions ADD COLUMN (
  state VARCHAR(50) DEFAULT 'scheduled'
    CHECK (state IN (
      'scheduled',          -- Initial state, no activities yet
      'postponed',          -- Postponed by admin
      'weighing',           -- Weigh-in in progress
      'ready_to_start',     -- Weigh-in complete, ready for competition
      'active',             -- Competition in progress (decided phase)
      'snatch_active',      -- Snatch phase active, C&J locked
      'snatch_complete',    -- All snatch done, C&J available
      'clean_jerk_active',  -- C&J phase active, Snatch locked
      'complete'            -- Competition finished
    )),
  
  current_phase VARCHAR(20) DEFAULT NULL
    CHECK (current_phase IN ('snatch', 'clean_jerk', NULL)),
  
  weigh_in_completed_at TIMESTAMP DEFAULT NULL,
  snatch_started_at TIMESTAMP DEFAULT NULL,
  snatch_completed_at TIMESTAMP DEFAULT NULL,
  clean_jerk_started_at TIMESTAMP DEFAULT NULL,
  clean_jerk_completed_at TIMESTAMP DEFAULT NULL,
  
  locked_phase VARCHAR(20) DEFAULT NULL
    CHECK (locked_phase IN ('snatch', 'clean_jerk', NULL))
);

-- Tracking which phase is currently locked
-- When snatch_active: locked_phase = 'clean_jerk'
-- When clean_jerk_active: locked_phase = 'snatch'
-- When not in competition: locked_phase = NULL
```

### Athletes Table (Weigh-in fields)
```sql
ALTER TABLE athletes ADD COLUMN (
  body_weight_kg DECIMAL(5,2),
  weigh_in_date TIMESTAMP,
  weighed_in BOOLEAN DEFAULT FALSE,
  start_weight_kg DECIMAL(5,2)  -- First attempt weight recommendation
);
```

### Session Progression Lock Table (NEW)
```sql
CREATE TABLE session_progression_locks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id),
  
  -- Tracks button visibility
  weigh_in_button_enabled BOOLEAN DEFAULT TRUE,
  start_competition_button_enabled BOOLEAN DEFAULT FALSE,
  start_snatch_button_enabled BOOLEAN DEFAULT FALSE,
  start_clean_jerk_button_enabled BOOLEAN DEFAULT FALSE,
  
  -- Admin must complete these before unlocking next phase
  weigh_in_required_athletes INT DEFAULT 0,
  weigh_in_completed_count INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🎯 State Machine Implementation

### Session State Transitions
```javascript
const SESSION_STATE_MACHINE = {
  'scheduled': {
    canTransitionTo: ['weighing', 'postponed', 'canceled'],
    weigh_in_unlocked: true,
    competition_unlocked: false,
    snatch_unlocked: false,
    clean_jerk_unlocked: false,
    lockedPhase: null,
    description: 'Not started yet'
  },
  
  'postponed': {
    canTransitionTo: ['scheduled'],
    weigh_in_unlocked: true,
    competition_unlocked: false,
    snatch_unlocked: false,
    clean_jerk_unlocked: false,
    lockedPhase: null,
    description: 'Session postponed'
  },
  
  'weighing': {
    canTransitionTo: ['ready_to_start', 'scheduled'],
    weigh_in_unlocked: false,  // Prevent re-opening
    competition_unlocked: false,
    snatch_unlocked: false,
    clean_jerk_unlocked: false,
    lockedPhase: null,
    description: 'Weigh-in in progress'
  },
  
  'ready_to_start': {
    canTransitionTo: ['active', 'weighing'],
    weigh_in_unlocked: false,
    competition_unlocked: true,   // ✅ START COMPETITION BUTTON ENABLED
    snatch_unlocked: false,
    clean_jerk_unlocked: false,
    lockedPhase: null,
    description: 'Ready to start competition'
  },
  
  'active': {
    canTransitionTo: ['snatch_active'],
    weigh_in_unlocked: false,
    competition_unlocked: false,
    snatch_unlocked: true,        // ✅ START SNATCH ENABLED
    clean_jerk_unlocked: false,   // ❌ C&J LOCKED
    lockedPhase: 'clean_jerk',
    description: 'Deciding which phase to start'
  },
  
  'snatch_active': {
    canTransitionTo: ['snatch_complete'],
    weigh_in_unlocked: false,
    competition_unlocked: false,
    snatch_unlocked: false,      // ❌ SNATCH LOCKED
    clean_jerk_unlocked: false,  // ❌ C&J LOCKED
    lockedPhase: 'clean_jerk',
    description: 'Snatch phase active'
  },
  
  'snatch_complete': {
    canTransitionTo: ['clean_jerk_active'],
    weigh_in_unlocked: false,
    competition_unlocked: false,
    snatch_unlocked: false,      // ❌ SNATCH LOCKED
    clean_jerk_unlocked: true,   // ✅ C&J ENABLED
    lockedPhase: 'snatch',
    description: 'Snatch complete, ready for C&J'
  },
  
  'clean_jerk_active': {
    canTransitionTo: ['complete'],
    weigh_in_unlocked: false,
    competition_unlocked: false,
    snatch_unlocked: false,      // ❌ SNATCH LOCKED
    clean_jerk_unlocked: false,  // ❌ C&J LOCKED
    lockedPhase: 'snatch',
    description: 'Clean & Jerk phase active'
  },
  
  'complete': {
    canTransitionTo: [],
    weigh_in_unlocked: false,
    competition_unlocked: false,
    snatch_unlocked: false,
    clean_jerk_unlocked: false,
    lockedPhase: null,
    description: 'Competition finished'
  }
};
```

---

## 🎨 UI/UX Changes Required

### 1. Session Card Component
```jsx
// OLD: Simple session selector
// NEW: Rich Session Card with State Indicators

<SessionCard>
  <SessionHeader>
    <SessionName>Women 48kg</SessionName>
    <StateBadge state={session.state} />  
    {/* Shows: "Scheduled" | "Weighing" | "Active" etc */}
  </SessionHeader>
  
  <SessionBody>
    <AthleteCount>
      ✅ {completedWeighins}/{totalAthletes} weighed in
    </AthleteCount>
    
    <PhaseIndicator>
      Snatch: {snatchStatus} | C&J: {cleanJerkStatus}
    </PhaseIndicator>
  </SessionBody>
  
  <SessionFooter>
    {/* Buttons appear/disappear based on session.state */}
    {session.state_config.weigh_in_unlocked && (
      <PrimaryButton onClick={startWeighIn}>
        🏋️ Start Weigh In
      </PrimaryButton>
    )}
    
    {session.state_config.competition_unlocked && (
      <PrimaryButton onClick={startCompetition}>
        🎯 Start Competition
      </PrimaryButton>
    )}
    
    {session.state_config.snatch_unlocked && (
      <PhaseButton phase="snatch" onClick={startSnatch}>
        Start Snatch ⭐
      </PhaseButton>
    )}
    
    {session.state_config.clean_jerk_unlocked && (
      <PhaseButton phase="clean_jerk" onClick={startCleanJerk}>
        Start C&J ⭐
      </PhaseButton>
    )}
    
    {/* Locked buttons show visual indicator */}
    {session.state_config.clean_jerk_unlocked === false && 
     session.state === 'snatch_active' && (
      <LockedButton title="Locked until Snatch complete">
        🔒 Start C&J
      </LockedButton>
    )}
  </SessionFooter>
</SessionCard>
```

### 2. Session Header During Competition
```jsx
// DURING COMPETITION - Near Print Button

<SessionCompetitionHeader>
  <div className="flex items-center gap-4">
    <PrintButton />
    <ExportButton />
    <RefreshButton />
    
    {/* Phase Control Buttons */}
    <div className="border-l-2 border-slate-300 pl-4">
      <button 
        disabled={!session.state_config.snatch_unlocked}
        onClick={startSnatchPhase}
        className={`${
          session.current_phase === 'snatch' 
            ? 'bg-blue-600 text-white' 
            : 'bg-slate-200'
        }`}
      >
        ⭐ Start Snatch
      </button>
      
      <button 
        disabled={!session.state_config.clean_jerk_unlocked}
        onClick={startCleanJerkPhase}
        className={`${
          session.current_phase === 'clean_jerk' 
            ? 'bg-purple-600 text-white' 
            : 'bg-slate-200'
        }`}
      >
        ⭐ Start C&J
      </button>
    </div>
  </div>
  
  {/* Phase Status Indicator */}
  <div className="text-sm font-semibold text-slate-600">
    Current Phase: {session.current_phase?.toUpperCase()}
    {session.locked_phase && ` | ${session.locked_phase} is LOCKED`}
  </div>
</SessionCompetitionHeader>
```

### 3. Target Weight Cell Highlighting (CRITICAL CHANGE)
```jsx
// OLD: Entire row highlighted
// NEW: Only the target weight cell highlighted

{[1, 2, 3].map(attemptNum => (
  <td 
    key={`snatch-${attemptNum}`}
    className={`
      border-r border-b border-slate-300 
      transition-all duration-300
      ${
        isNextLifter && currentAttempt === attemptNum
          ? 'bg-gradient-to-b from-yellow-300 to-amber-300 shadow-lg ring-2 ring-yellow-500 scale-105'
          : 'bg-white'
      }
    `}
  >
    <AttemptCell
      athlete={athlete}
      attemptType={currentPhase}
      attemptNumber={attemptNum}
    />
  </td>
))}
```

---

## 📊 API Endpoints Needed

```javascript
// Session State Management
POST   /api/sessions/:sessionId/transitions/weigh-in
       // scheduled → weighing

POST   /api/sessions/:sessionId/transitions/complete-weigh-in
       // weighing → ready_to_start
       // Body: { completedCount, requiredCount }

POST   /api/sessions/:sessionId/transitions/start-competition
       // ready_to_start → active

POST   /api/sessions/:sessionId/transitions/start-phase
       // active → snatch_active
       // Body: { phase: 'snatch' | 'clean_jerk' }

POST   /api/sessions/:sessionId/transitions/complete-phase
       // snatch_active → snatch_complete
       // clean_jerk_active → complete

PUT    /api/sessions/:sessionId/state
       // Manual state override (for admin/debugging)

GET    /api/sessions/:sessionId/state-config
       // Returns which buttons should be enabled

// Weigh-in Process
POST   /api/weigh-ins
       // { sessionId, athleteId, bodyWeight, startWeight }

PUT    /api/weigh-ins/:weigh-in-id

GET    /api/sessions/:sessionId/weigh-in-summary
       // { completed: 5, total: 8, pending: 3 }

// Live Lifting Order
GET    /api/sessions/:sessionId/next-lifter
       // Returns next lifter + next weight cell to highlight

GET    /api/sessions/:sessionId/lifting-order
       // Full order for current phase
```

---

## 🔒 Permission Model

```javascript
const ADMIN_PERMISSIONS = {
  'sessions_manager': {
    canCreateSession: true,
    canSelectSessionState: true,           // ⭐ NEW
    canStartWeighIn: true,
    canCompleteWeighIn: true,              // ⭐ NEW
    canStartCompetition: true,
    canStartSnatchPhase: true,             // ⭐ NEW
    canCompleteSnatchPhase: true,          // ⭐ NEW
    canStartCleanJerkPhase: true,          // ⭐ NEW
    canCompleteCleanJerkPhase: true,       // ⭐ NEW
    canChangeSessionState: false,          // Only via state machine
  },
  
  'judge': {
    canDeclareAttempt: true,
    canApproveDecision: true,
  }
};
```

---

## ⭐ Additional Improvements to Your Idea

### 1. **Weigh-in Validation Checklist**
Before allowing "Start Competition":
```javascript
WEIGH_IN_REQUIREMENTS = [
  { check: 'all_athletes_weighed_in', description: '✅ All athletes weighed in' },
  { check: 'body_weights_recorded', description: '✅ Body weights recorded' },
  { check: 'start_weights_set', description: '✅ Opening weights recommended' },
  { check: 'weight_categories_valid', description: '✅ No weight category conflicts' }
];
```

### 2. **Phase Completion Requirements**
Before allowing phase transitions:
```javascript
SNATCH_COMPLETION = {
  'all_lifters_attempted': true,
  'all_decisions_recorded': true,
  'rankings_calculated': true,
  'confirm_button_click': true
};
```

### 3. **Emergency Admin Actions** (Hidden Menu)
```javascript
ADMIN_EMERGENCY_OPTIONS = {
  'reset_phase': 'Go back to Snatch from C&J',
  'reset_to_ready': 'Back to weigh-in complete state',
  'manual_state_override': 'For competitions that need recovery',
  'force_next_lifter': 'Skip stuck athlete'
};
```

### 4. **Live Analytics Dashboard**
```javascript
SESSION_DASHBOARD = {
  'current_phase': 'Snatch',
  'phase_progress': '12/15 lifters attempted',
  'next_lifter': { name: 'Akila', team: 'UOC', weight: '100kg' },
  'time_elapsed': '2h 15m',
  'estimated_completion': '3h 30m',
  'pending_decisions': 3
};
```

### 5. **Auto-calculations During Competition**
```javascript
LIVE_UPDATES = {
  'next_lifter_highlights': 'Cell only, not row',
  'live_rankings': 'Update as each lift completes',
  'phase_progress_bar': 'Show completion %',
  'estimated_time': 'Predict end based on pace'
};
```

### 6. **Undo/Recovery System**
```javascript
RECOVERY_SYSTEM = {
  'undo_last_decision': 'Revert last lift result',
  'undo_phase_start': 'Go back if started accidentally',
  'audit_trail': 'Log all state changes'
};
```

---

## 📝 Implementation Checklist

### Phase 1: Database & API (Week 1)
- [ ] Add session state column with state machine
- [ ] Add weigh-in tracking columns
- [ ] Create session_progression_locks table
- [ ] Build state transition endpoints
- [ ] Add permission layer

### Phase 2: Backend Logic (Week 1-2)
- [ ] State machine enforcement
- [ ] Weigh-in validation logic
- [ ] Phase completion requirements
- [ ] Next lifter calculation
- [ ] Target weight cell identification

### Phase 3: Frontend - Session Cards (Week 2)
- [ ] Redesign SessionCard component
- [ ] Add state badge display
- [ ] Implement button enable/disable logic
- [ ] Add weigh-in counter

### Phase 4: Frontend - Weigh-in Flow (Week 2)
- [ ] Build WeighInModal
- [ ] Add weigh-in completion checklist
- [ ] Build weigh-in summary dashboard
- [ ] Add completion confirmation

### Phase 5: Frontend - Competition Flow (Week 3)
- [ ] Add phase control buttons
- [ ] Implement phase lock display
- [ ] Build phase completion requirements
- [ ] Add phase transition confirmation

### Phase 6: Frontend - Cell Highlighting (Week 3)
- [ ] Update AttemptCell styling
- [ ] Target weight cell only (not row)
- [ ] Add smooth animations
- [ ] Test with current lifter display

### Phase 7: Testing & Polish (Week 4)
- [ ] State transition edge cases
- [ ] Weigh-in edge cases
- [ ] Phase locking verification
- [ ] UI/UX refinement

---

## 🎯 Key Differences: Your Idea vs Current System

| Feature | Current | Your Idea | Status |
|---------|---------|-----------|--------|
| Session state control | Limited | Full state machine | ⭐ Recommended |
| Weigh-in process | Optional | Required step | ⭐ Critical |
| Phase locking | None | Snatch/C&J locked | ⭐ Essential |
| Button progression | No | Progressive unlock | ⭐ Recommended |
| Target weight highlight | Full row | Cell only | ⭐ Better UX |
| State transitions | Manual | Guided workflow | ⭐ Safer |

---

## 🚀 Summary

Your workflow is **excellent**! Here are my additions:

✅ **Keep your core idea** - It's clean and logical
✅ **Add state machine** - Prevents invalid transitions  
✅ **Add weigh-in requirements** - Can't skip critical step
✅ **Add phase locking** - Can't go to C&J while snatch is active
✅ **Cell-level highlighting** - Better than row highlighting
✅ **Add checklist before transitions** - Ensures data integrity
✅ **Add emergency admin menu** - For recovery if needed
✅ **Add progress tracking** - Shows completion %

This creates a **bulletproof competition workflow** that guides admins through proper steps.

---

## 🔄 Next Steps

1. Do you want me to start implementing Phase 1 (Database schema)?
2. Should I create the state machine service first?
3. Do you want the emergency admin menu or keep it simple initially?
4. Should weigh-in be mandatory or optional first?
