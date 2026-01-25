# Phase 2 Implementation Plan: Frontend Components

## 🎯 Components to Build

### 1. SessionCard Component (Complete Redesign)

**Current Location**: Find existing SessionSelector/SessionCard

**New Features**:
```jsx
<SessionCard session={session}>
  {/* Header */}
  <div className="flex justify-between items-start">
    <h3>{session.name}</h3>
    <StateBadge state={session.state} />  
    {/* Shows: Scheduled | Weighing | Ready | Active | Snatch Active | C&J Active | Complete */}
  </div>

  {/* Progress Indicators */}
  {session.state === 'weighing' && (
    <WeighInProgress 
      completed={5} 
      total={10} 
      percentage={50}
    />
  )}

  {session.state === 'snatch_active' && (
    <PhaseProgress
      phase="snatch"
      completed={7}
      total={10}
    />
  )}

  {/* Buttons - Conditional based on state */}
  <div className="flex gap-2">
    {session.buttons.weigh_in && (
      <PrimaryButton onClick={startWeighIn}>
        🏋️ Start Weigh In
      </PrimaryButton>
    )}

    {session.buttons.start_competition && (
      <PrimaryButton onClick={startCompetition}>
        🎯 Start Competition
      </PrimaryButton>
    )}

    {/* Locked buttons show visual indicator */}
    {!session.buttons.start_snatch && session.state !== 'weighing' && (
      <DisabledButton title="Will be enabled after competition starts">
        Start Snatch
      </DisabledButton>
    )}
  </div>
</SessionCard>
```

**Styling**:
- State badge: Different color for each state
- Progress bar: Animated, shows percentage
- Button styles: Enabled (blue), Locked (grey with lock icon)
- Card shadow: Highlight active session

---

### 2. WeighInModal Component (Completely New)

```jsx
<WeighInModal session={session} onClose={onClose}>
  {/* Summary */}
  <div className="mb-6">
    <p className="text-sm text-slate-600">
      {weighed_in}/{total} athletes weighed in
    </p>
    <ProgressBar progress={percentage} />
  </div>

  {/* Athletes List */}
  <div className="max-h-[400px] overflow-y-auto">
    {athletes.map(athlete => (
      <WeighInRow key={athlete.id}>
        <div>{athlete.name}</div>
        <div>{athlete.team}</div>
        
        {athlete.weighed_in ? (
          <div className="text-green-600">
            ✅ {athlete.body_weight_kg}kg
          </div>
        ) : (
          <input
            type="number"
            step="0.1"
            placeholder="Weight"
            onChange={(e) => handleWeighIn(athlete.id, e.target.value)}
          />
        )}
      </WeighInRow>
    ))}
  </div>

  {/* Complete Button */}
  <button 
    onClick={completeWeighIn}
    disabled={weighed_in < total}
    className="w-full mt-6"
  >
    {weighed_in === total ? '✅ Complete Weigh-In' : `Complete (${weighed_in}/${total})`}
  </button>
</WeighInModal>
```

**Features**:
- Show athlete list in order
- Indicate who's weighed in ✅
- Form to record weights
- Auto-calculate start weight (body_weight + 5kg)
- Progress bar at top
- Disable complete button until all done
- Success message on completion

---

### 3. Session Header Component (Enhancement)

**Location**: SessionSheet component header

```jsx
<SessionHeader>
  {/* Left side - Print, Export, Refresh */}
  <div className="flex gap-2">
    <PrintButton />
    <ExportButton />
    <RefreshButton />
  </div>

  {/* Middle - Phase Indicator */}
  <div className="text-center">
    <span className="font-semibold">
      Current Phase: <PhaseBadge>{currentPhase}</PhaseBadge>
    </span>
    {lockedPhase && (
      <span className="ml-4 text-red-600">
        🔒 {lockedPhase} is LOCKED
      </span>
    )}
  </div>

  {/* Right side - Phase Control Buttons */}
  <div className="flex gap-2">
    {/* Start Snatch */}
    <PhaseButton
      onClick={startSnatch}
      disabled={!buttons.start_snatch}
      active={currentPhase === 'snatch'}
      phase="snatch"
    >
      ⭐ Start Snatch
    </PhaseButton>

    {/* Start C&J */}
    <PhaseButton
      onClick={startCleanJerk}
      disabled={!buttons.start_clean_jerk}
      active={currentPhase === 'clean_jerk'}
      phase="clean_jerk"
    >
      ⭐ Start C&J
    </PhaseButton>

    {/* Complete Phase Button - appears during active phase */}
    {currentPhase === 'snatch' && (
      <button onClick={completeSnatch}>
        ✅ Complete Snatch
      </button>
    )}

    {currentPhase === 'clean_jerk' && (
      <button onClick={completeCJ}>
        ✅ Complete C&J
      </button>
    )}
  </div>
</SessionHeader>
```

**Styling**:
- Buttons: Active state (blue with checkmark), Locked (grey, disabled)
- Phase indicator: Clear, bold display
- Lock icon: Show which phase is locked
- Separated sections with borders

---

### 4. Cell-Level Highlighting (Enhancement)

**Location**: SessionSheet.jsx, AttemptCell rendering

```jsx
{[1, 2, 3].map(attemptNum => (
  <td
    key={`${attemptType}-${attemptNum}`}
    className={`
      transition-all duration-300
      border-r border-b border-slate-300
      ${
        isNextLifter && currentAttempt === attemptNum
          ? `
            bg-gradient-to-b from-yellow-300 via-amber-300 to-yellow-200
            shadow-lg shadow-yellow-400
            ring-2 ring-yellow-500 ring-offset-1
            animate-pulse-subtle
          `
          : 'bg-white hover:bg-slate-50'
      }
    `}
  >
    <AttemptCell
      athlete={athlete}
      attemptType={attemptType}
      attemptNumber={attemptNum}
      isHighlighted={isNextLifter && currentAttempt === attemptNum}
    />
  </td>
))}
```

**Features**:
- Only target cell highlighted (not row)
- Gold/yellow gradient background
- Subtle shadow effect
- Ring border with offset
- Pulse animation (optional)
- Clear visual focus

---

### 5. Phase Lock Indicator Component (New)

```jsx
<PhaseLockIndicator>
  {session.locked_phase && (
    <div className="bg-red-100 border-l-4 border-red-600 p-3 rounded">
      <div className="flex items-center gap-2">
        <Lock size={20} className="text-red-600" />
        <div>
          <p className="font-semibold text-red-800">
            {session.locked_phase.toUpperCase()} is LOCKED
          </p>
          <p className="text-sm text-red-700">
            {session.locked_phase === 'snatch' 
              ? 'Cannot start snatch until C&J is complete'
              : 'Cannot start C&J until snatch is complete'
            }
          </p>
        </div>
      </div>
    </div>
  )}
</PhaseLockIndicator>
```

---

## 📁 File Structure After Phase 2

```
/apps/admin-panel/src/
├── components/
│   ├── technical/
│   │   ├── SessionSheet.jsx (UPDATED - add header)
│   │   ├── SessionCard.jsx (REDESIGNED)
│   │   ├── WeighInModal.jsx (NEW)
│   │   ├── PhaseLockIndicator.jsx (NEW)
│   │   └── AttemptCell.jsx (UPDATED - cell highlighting)
│   │
│   └── common/
│       ├── StateBadge.jsx (NEW)
│       ├── ProgressBar.jsx (NEW)
│       ├── PhaseButton.jsx (NEW)
│       └── PhaseProgress.jsx (NEW)
│
├── pages/
│   └── TechnicalPanel.jsx (UPDATED - add state management)
│
├── hooks/
│   └── useSessionState.js (NEW - fetch state config)
│
└── services/
    └── sessionStateApi.js (NEW - API calls)
```

---

## 🔄 Frontend State Management

### Option 1: React Context (Simpler)
```javascript
// useSessionState.js hook
export function useSessionState(sessionId) {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSessionState();
    // Poll every 5 seconds for live updates
    const interval = setInterval(fetchSessionState, 5000);
    return () => clearInterval(interval);
  }, [sessionId]);

  async function fetchSessionState() {
    const response = await api.get(`/sessions/${sessionId}/state-config`);
    setState(response.data);
  }

  async function transitionTo(endpoint) {
    const response = await api.post(endpoint);
    setState(response.data);
  }

  return {
    state: state?.data,
    buttons: state?.buttons,
    loading,
    error,
    startWeighIn: () => transitionTo(`/sessions/${sessionId}/transitions/weigh-in`),
    completeWeighIn: () => transitionTo(`/sessions/${sessionId}/transitions/complete-weigh-in`),
    startCompetition: () => transitionTo(`/sessions/${sessionId}/transitions/start-competition`),
    // ... other transitions
  };
}
```

### Option 2: Redux (More Robust)
- Create session slice with state/buttons/actions
- Subscribe to WebSocket updates
- Sync with server

---

## 📋 Implementation Order for Phase 2

1. **Create utility components first**
   - StateBadge.jsx
   - ProgressBar.jsx
   - PhaseButton.jsx

2. **Create hooks**
   - useSessionState.js hook

3. **Create major components**
   - SessionCard.jsx (redesign)
   - WeighInModal.jsx (new)
   - PhaseLockIndicator.jsx (new)

4. **Update existing components**
   - SessionSheet.jsx (add header with phase buttons)
   - AttemptCell.jsx (cell-level highlighting)
   - TechnicalPanel.jsx (integrate new components)

5. **Test flow**
   - Test all state transitions
   - Test button enable/disable
   - Test weigh-in modal
   - Test cell highlighting

---

## 🎨 Design Notes

### Colors by State
```javascript
const STATE_COLORS = {
  'scheduled': 'bg-blue-100 text-blue-800',
  'weighing': 'bg-purple-100 text-purple-800',
  'ready_to_start': 'bg-green-100 text-green-800',
  'active': 'bg-yellow-100 text-yellow-800',
  'snatch_active': 'bg-blue-200 text-blue-900',
  'snatch_complete': 'bg-blue-100 text-blue-800',
  'clean_jerk_active': 'bg-purple-200 text-purple-900',
  'complete': 'bg-slate-200 text-slate-800',
};
```

### Button States
```javascript
const BUTTON_STYLES = {
  enabled: 'bg-blue-600 text-white cursor-pointer hover:bg-blue-700',
  locked: 'bg-slate-300 text-slate-600 cursor-not-allowed opacity-60',
  active: 'bg-green-600 text-white',
};
```

---

## 🧪 Testing Phase 2

```javascript
// Test scenarios
1. Create session → Card shows "Scheduled" badge
2. Click "Start Weigh In" → Modal opens, state shows "Weighing"
3. Record weights for all athletes → Progress bar updates
4. Click "Complete Weigh In" → State shows "Ready to Start"
5. Click "Start Competition" → Phase buttons appear
6. Click "Start Snatch" → C&J button locked, highlights appear
7. Record attempts → Next lifter cell highlighted (not row)
8. Complete snatch → C&J button unlocked
9. Click "Start C&J" → Snatch button locked
10. Complete competition → State shows "Complete"
```

---

## ⏳ Timeline

- Phase 2a (Utility Components): 1 day
- Phase 2b (Major Components): 1.5 days
- Phase 2c (Integration): 1 day
- Phase 2d (Testing & Polish): 1 day

**Total: ~4 days for complete frontend**

---

Ready to start Phase 2? I recommend starting with the utility components so you have building blocks for the major components!
