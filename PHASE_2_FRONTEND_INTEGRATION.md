# Phase 2 Frontend Integration Guide

## ✅ Components Created

### 1. SessionCard.jsx (Enhanced)
**File**: `/apps/admin-panel/src/components/technical/SessionCard.jsx`
**Status**: ✅ Complete

Features:
- State badge with color coding for all 9 states
- Weigh-in progress bar when in weighing state
- Phase lock indicator when in snatch/C&J active states
- 6 context-aware buttons (Weigh In, Start Competition, Start Snatch, etc.)
- Loading and error states
- API integration for state transitions

Usage:
```jsx
import SessionCard from './components/technical/SessionCard';

<SessionCard
  session={session}
  onStateChange={handleStateChange}
  onRefresh={handleRefresh}
  selectedSession={isSelected}
/>
```

### 2. WeighInModal.jsx (New)
**File**: `/apps/admin-panel/src/components/technical/WeighInModal.jsx`
**Status**: ✅ Complete

Features:
- Modal dialog for weigh-in process
- List of athletes with weight input
- Progress bar showing weigh-in completion
- Individual athlete weight recording
- Complete weigh-in button (only enabled when all weighed in)
- Success/error messaging
- API integration

Usage:
```jsx
import WeighInModal from './components/technical/WeighInModal';

const [showWeighInModal, setShowWeighInModal] = useState(false);

<WeighInModal
  session={session}
  onClose={() => setShowWeighInModal(false)}
  onComplete={() => {
    setShowWeighInModal(false);
    onRefresh();
  }}
/>
```

### 3. PhaseControlButtons.jsx (New)
**File**: `/apps/admin-panel/src/components/technical/PhaseControlButtons.jsx`
**Status**: ✅ Complete

Features:
- Two buttons: Snatch phase and Clean & Jerk phase
- Lock/unlock based on session state
- Active state indication with ring and "ACTIVE" label
- Context-aware enabling/disabling
- Compact mode for header placement

Usage:
```jsx
import PhaseControlButtons from './components/technical/PhaseControlButtons';

<PhaseControlButtons
  session={session}
  onStateChange={handleStateChange}
  onRefresh={handleRefresh}
  compact={true}
/>
```

### 4. AttemptCell Highlighting (Guide)
**File**: `/ATTEMPT_CELL_HIGHLIGHTING_GUIDE.md`
**Status**: ✅ Guide Complete

Three implementation options:
1. Simple wrapper component (AttemptCellHighlighter)
2. Context-based approach (SessionStateContext)
3. Direct modification of existing AttemptCell.jsx

---

## 🔗 API Endpoints Used

All components integrate with these Phase 1 API endpoints:

### State Management
```
POST   /api/sessions/:id/transitions/weigh-in
POST   /api/sessions/:id/transitions/complete-weigh-in
POST   /api/sessions/:id/transitions/start-competition
POST   /api/sessions/:id/transitions/start-snatch
POST   /api/sessions/:id/transitions/complete-snatch
POST   /api/sessions/:id/transitions/start-clean-jerk
POST   /api/sessions/:id/transitions/complete-clean-jerk
```

### Data Retrieval
```
GET    /api/sessions/:id/state-config          (button visibility)
GET    /api/sessions/:id/weigh-in-summary      (progress tracking)
GET    /api/sessions/:id/next-lifter           (target cell highlighting)
GET    /api/sessions/:id/state-history         (audit trail)
POST   /api/sessions/:id/weigh-in-athlete      (weight recording)
```

---

## 📋 Integration Steps

### Step 1: Update SessionSelector to use SessionCard

**File**: `/apps/admin-panel/src/components/technical/SessionSelector.jsx`

Replace the button rendering with SessionCard:

```jsx
import SessionCard from './SessionCard';

// In the return statement:
{sessions.map((session) => (
  <SessionCard
    key={session.id}
    session={session}
    onStateChange={onSelectSession}
    selectedSession={selectedSession?.id === session.id}
    className="cursor-pointer"
  />
))}
```

### Step 2: Add WeighInModal to Session View

**File**: `/apps/admin-panel/src/pages/TechnicalPanel.jsx` (or wherever sessions are displayed)

```jsx
import WeighInModal from '../components/technical/WeighInModal';

const TechnicalPanel = () => {
  const [showWeighInModal, setShowWeighInModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  return (
    <>
      {/* Existing content */}
      
      {showWeighInModal && selectedSession && (
        <WeighInModal
          session={selectedSession}
          onClose={() => setShowWeighInModal(false)}
          onComplete={() => {
            setShowWeighInModal(false);
            handleRefresh();
          }}
        />
      )}
    </>
  );
};
```

### Step 3: Add Phase Control Buttons to Session Header

**File**: `/apps/admin-panel/src/components/technical/SessionControls.jsx` (or similar)

Add next to Print button:

```jsx
import PhaseControlButtons from './PhaseControlButtons';

// In the header/controls area:
<div className="flex gap-2 items-center">
  <PhaseControlButtons
    session={selectedSession}
    onStateChange={handleStateChange}
    onRefresh={handleRefresh}
    compact={true}
  />
  
  <PrintButton /> {/* Existing print button */}
</div>
```

### Step 4: Implement Cell Highlighting (Choose Option)

Use one of the approaches in `ATTEMPT_CELL_HIGHLIGHTING_GUIDE.md`:

**Option 1**: Simple wrapper (easiest)
```jsx
import { AttemptCellHighlighter } from '../components/technical/AttemptCellHighlight';

<AttemptCellHighlighter session={session} athlete={athlete} attemptType="snatch" attemptNumber={1}>
  <AttemptCell {...props} />
</AttemptCellHighlighter>
```

**Option 2**: Create context (most scalable)
```jsx
import { SessionStateProvider } from '../context/SessionStateContext';

<SessionStateProvider session={selectedSession}>
  <SessionSheet />
</SessionStateProvider>
```

Then in AttemptCell.jsx, use the `useSessionState()` hook to get `nextLifter` data.

---

## 🎯 Expected Behavior

### Session Selector
- Each session card shows current state with color-coded badge
- Buttons are dynamically enabled/disabled based on state
- Clicking buttons transitions the session state
- API calls are made automatically

### Weigh-In Flow
1. Admin clicks "Start Weigh In" button
2. Session state changes to "weighing"
3. WeighInModal appears (or can be opened manually)
4. Admin enters weight for each athlete
5. System shows progress bar
6. Once all athletes weighed in, "Complete Weigh-In" button enables
7. Session transitions to "ready_to_start"

### Competition Flow
1. Admin clicks "Start Competition"
2. Session state changes to "active"
3. "Start Snatch" button enables
4. Admin clicks "Start Snatch"
5. Session state changes to "snatch_active"
6. Clean & Jerk button locks (shows lock icon)
7. AttemptCell for target weight highlights in gold with 🎯
8. Admin clicks "Complete Snatch"
9. Session state changes to "snatch_complete"
10. Snatch button locks, Clean & Jerk button enables
11. Repeat for Clean & Jerk phase

---

## 🧪 Testing Checklist

### SessionCard Tests
- [ ] State badge displays correct color for each state
- [ ] Button enables/disables based on state
- [ ] Clicking button transitions state
- [ ] Weigh-in progress shows correct numbers
- [ ] Phase lock indicator appears when appropriate
- [ ] Error messages display if API fails

### WeighInModal Tests
- [ ] Modal opens when requested
- [ ] Lists all athletes in session
- [ ] Weight input accepts decimal numbers
- [ ] Clicking ✓ marks athlete as weighed in
- [ ] Progress bar updates correctly
- [ ] Complete button only enables when all weighed in
- [ ] Pressing "Complete Weigh-In" transitions state

### PhaseControlButtons Tests
- [ ] Snatch button only appears in correct states
- [ ] Clean & Jerk button only appears in correct states
- [ ] Active button shows ring and "ACTIVE" label
- [ ] Locked button shows lock icon
- [ ] Clicking button transitions phase

### AttemptCell Highlighting Tests
- [ ] Target cell has gold background
- [ ] 🎯 icon appears on target cell
- [ ] Highlighting updates when next lifter changes
- [ ] Non-target cells remain normal

---

## 🔌 Database / API Connection

All components use the `api` utility from `/config/api.js`:

```javascript
import api from '../../config/api';

// All requests include:
// - Base URL: http://localhost:5000 (configurable)
// - Headers: Content-Type, Authorization
// - Error handling with try/catch
```

Make sure:
1. Backend server is running (`npm run dev` in `/apps/backend`)
2. All 12 API endpoints are available
3. Session has athletes assigned
4. Database migration has been applied

---

## 📱 Responsive Design

All components are responsive:
- SessionCard: Grid layout adjusts for mobile
- WeighInModal: Full-screen on mobile, dialog on desktop
- PhaseControlButtons: Flex layout with wrapping
- AttemptCell: Maintains highlight on all screen sizes

---

## 🚀 Deployment Checklist

Before deploying Phase 2 to production:

- [ ] Test all components locally
- [ ] Test with actual Supabase database
- [ ] Run through complete weigh-in flow
- [ ] Run through complete competition flow
- [ ] Test error cases (network failures, invalid data)
- [ ] Test on mobile devices
- [ ] Check accessibility (keyboard navigation, screen readers)
- [ ] Update user documentation
- [ ] Train staff on new UI

---

## 📚 File Summary

```
Components Created:
├─ SessionCard.jsx (240 lines)
├─ WeighInModal.jsx (280 lines)
└─ PhaseControlButtons.jsx (200 lines)

Guides Created:
├─ ATTEMPT_CELL_HIGHLIGHTING_GUIDE.md
└─ PHASE_2_FRONTEND_INTEGRATION.md (this file)

Total Phase 2 Code: 720+ lines
```

---

## 🎓 Learning Resources

### Understanding State Machine
See: `/OPTIMIZED_COMPETITION_WORKFLOW.md` and `/COMPLETE_IMPLEMENTATION_OVERVIEW.md`

### API Documentation
See: `/PHASE_1_IMPLEMENTATION_COMPLETE.md`

### Database Schema
See: `/database/migrations/006_session_state_machine.sql`

### State Transitions
See: `/PHASE_2_FRONTEND_PLAN.md` for visual flowcharts

---

## ✨ Next Steps

1. **Deploy Phase 1** (if not done yet)
   - Apply database migration
   - Restart backend
   - Test API endpoints

2. **Integrate Phase 2 Components**
   - Update SessionSelector to use SessionCard
   - Add WeighInModal to session view
   - Add PhaseControlButtons to header
   - Choose and implement cell highlighting approach

3. **Test Thoroughly**
   - Run through all weigh-in flows
   - Run through all competition flows
   - Test error cases
   - Test on different screen sizes

4. **Deploy to Staging**
   - Deploy Phase 2 frontend
   - Do full end-to-end testing
   - Get feedback from staff

5. **Deploy to Production**
   - Create backup
   - Deploy frontend
   - Monitor for errors
   - Be ready to rollback

---

**Phase 2 Frontend Implementation: Ready to Integrate** 🚀
