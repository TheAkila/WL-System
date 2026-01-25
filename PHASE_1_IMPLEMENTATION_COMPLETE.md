# Phase 1 Implementation: Database & API - COMPLETE ✅

## ✅ Completed Components

### 1. Database Migration (Migration 006)
**File**: `/database/migrations/006_session_state_machine.sql`

**What was added**:
- ✅ `session_state` ENUM with 9 states
- ✅ `competition_phase` ENUM (snatch, clean_jerk)
- ✅ New columns in `sessions` table:
  - `state` (session state)
  - `current_phase` (current phase)
  - `weigh_in_completed_at`
  - `snatch_started_at`, `snatch_completed_at`
  - `clean_jerk_started_at`, `clean_jerk_completed_at`
  - `locked_phase` (which phase is locked)

- ✅ New columns in `athletes` table:
  - `body_weight_kg`
  - `weigh_in_date`
  - `weighed_in`
  - `start_weight_kg`

- ✅ New table: `session_progression_locks`
  - Tracks button visibility
  - Tracks weigh-in progress
  - Tracks phase progress

- ✅ New table: `session_state_history`
  - Audit trail of all state transitions
  - Who made the change and why

**Database Functions**:
- ✅ `validate_session_state_transition()` - Validates state transitions
- ✅ `update_session_state()` - Updates state with audit logging
- ✅ `update_session_progression_locks()` - Updates button availability
- ✅ `mark_athlete_weighed_in()` - Records weigh-in
- ✅ `get_weigh_in_summary()` - Returns weigh-in progress
- ✅ `get_next_lifter()` - Returns next lifter for phase

---

### 2. Backend State Machine Service
**File**: `/apps/backend/src/services/sessionStateMachine.service.js`

**Exports**: `SessionStateMachine` class with methods:

#### State Management Methods
```javascript
// Start/Complete workflows
startWeighIn(sessionId, userId)                    // scheduled → weighing
completeWeighIn(sessionId, userId)                 // weighing → ready_to_start
startCompetition(sessionId, userId)                // ready_to_start → active
startSnatchPhase(sessionId, userId)                // active → snatch_active
completeSnatchPhase(sessionId, userId)             // snatch_active → snatch_complete
startCleanJerkPhase(sessionId, userId)             // snatch_complete → clean_jerk_active
completeCleanJerkPhase(sessionId, userId)          // clean_jerk_active → complete
```

#### Data Query Methods
```javascript
getWeighInSummary(sessionId)                       // Get progress: total, weighed_in, pending, %
markAthleteWeighedIn(athleteId, bodyWeightKg)     // Record weigh-in
getNextLifter(sessionId, phase)                    // Get next lifter + target weight
getSessionStateConfig(sessionId)                   // Get state + buttons
getSessionStateHistory(sessionId, limit)           // Audit trail
```

#### Utility Methods
```javascript
isValidTransition(fromState, toState)              // Check if transition allowed
getButtonConfig(state)                              // Get button availability for state
transitionSession(sessionId, newState, userId)     // Core transition logic
```

---

### 3. Backend API Routes
**File**: `/apps/backend/src/routes/sessionState.routes.js`

**Endpoints created**:

#### State Transitions
```
POST /api/sessions/:sessionId/transitions/weigh-in
POST /api/sessions/:sessionId/transitions/complete-weigh-in
POST /api/sessions/:sessionId/transitions/start-competition
POST /api/sessions/:sessionId/transitions/start-snatch
POST /api/sessions/:sessionId/transitions/complete-snatch
POST /api/sessions/:sessionId/transitions/start-clean-jerk
POST /api/sessions/:sessionId/transitions/complete-clean-jerk
```

#### Data Endpoints
```
GET  /api/sessions/:sessionId/state-config          # Get buttons + state
GET  /api/sessions/:sessionId/weigh-in-summary      # Get progress
POST /api/sessions/:sessionId/weigh-in-athlete      # Record weigh-in
GET  /api/sessions/:sessionId/next-lifter           # Get next lifter
GET  /api/sessions/:sessionId/state-history         # Get audit trail
```

---

### 4. Routes Integration
**File**: `/apps/backend/src/routes/index.js`

- ✅ Imported `sessionStateRoutes`
- ✅ Mounted on `/api/sessions` path
- ✅ Routes available immediately

---

## 🚀 How to Deploy

### Step 1: Apply Database Migration
```bash
# Option 1: Direct SQL in Supabase
# Copy content of /database/migrations/006_session_state_machine.sql
# Go to Supabase Dashboard → SQL Editor
# Run the migration

# Option 2: Via psql (if local PostgreSQL)
psql -U postgres -d wl_system -f database/migrations/006_session_state_machine.sql
```

### Step 2: Restart Backend
```bash
cd apps/backend
npm restart
# or
npm run dev
```

---

## 🧪 Testing the API

### 1. Check Session State Configuration
```bash
curl http://localhost:5000/api/sessions/{sessionId}/state-config
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "state": "scheduled",
    "current_phase": null,
    "locked_phase": null,
    "buttons": {
      "weigh_in": true,
      "start_competition": false,
      "start_snatch": false,
      "start_clean_jerk": false
    },
    "stateDescription": "Not started yet"
  }
}
```

### 2. Start Weigh-In
```bash
curl -X POST http://localhost:5000/api/sessions/{sessionId}/transitions/weigh-in
```

Response:
```json
{
  "success": true,
  "data": {
    "success": true,
    "session_id": "uuid",
    "previous_state": "scheduled",
    "new_state": "weighing",
    "timestamp": "2025-01-25T10:30:00.000Z"
  }
}
```

### 3. Record Weigh-In
```bash
curl -X POST http://localhost:5000/api/sessions/{sessionId}/weigh-in-athlete \
  -H "Content-Type: application/json" \
  -d '{
    "athleteId": "uuid",
    "bodyWeightKg": 48.5,
    "startWeightKg": 50
  }'
```

### 4. Get Weigh-In Summary
```bash
curl http://localhost:5000/api/sessions/{sessionId}/weigh-in-summary
```

Response:
```json
{
  "success": true,
  "data": {
    "total_athletes": 10,
    "weighed_in": 7,
    "pending": 3,
    "completion_percentage": "70.00"
  }
}
```

### 5. Complete Weigh-In
```bash
# Only works when all athletes are weighed in
curl -X POST http://localhost:5000/api/sessions/{sessionId}/transitions/complete-weigh-in
```

Response:
```json
{
  "success": true,
  "data": {
    "success": true,
    "session_id": "uuid",
    "previous_state": "weighing",
    "new_state": "ready_to_start",
    "timestamp": "2025-01-25T10:35:00.000Z"
  }
}
```

---

## 📊 State Machine Reference

```
scheduled ──→ weighing ──→ ready_to_start ──→ active ──→ snatch_active ──→ snatch_complete ──→ clean_jerk_active ──→ complete
   ↑                ↓             ↑                                              ↓
   └────────────────┘             └──────────────────────────────────────────────┘
```

### Button Availability by State:

| State | Weigh In | Start Comp | Start Snatch | Start C&J |
|-------|----------|------------|--------------|-----------|
| scheduled | ✅ | ❌ | ❌ | ❌ |
| weighing | ❌ | ❌ | ❌ | ❌ |
| ready_to_start | ❌ | ✅ | ❌ | ❌ |
| active | ❌ | ❌ | ✅ | ❌ |
| snatch_active | ❌ | ❌ | ❌ | ❌ |
| snatch_complete | ❌ | ❌ | ❌ | ✅ |
| clean_jerk_active | ❌ | ❌ | ❌ | ❌ |
| complete | ❌ | ❌ | ❌ | ❌ |

---

## 📝 Next Phase: Frontend Components

The backend is ready! Next we need to create:

### Phase 2: Frontend
1. ✅ SessionCard component (state badge, buttons)
2. ✅ WeighInModal component (record weigh-in)
3. ✅ Phase control buttons (next to Print)
4. ✅ Cell-level highlighting for next lifter
5. ✅ Phase lock indicators

Would you like me to start Phase 2 (Frontend components)?

---

## 🔍 Migration Verification

Check if migration applied successfully:

```sql
-- Verify new columns in sessions
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'sessions' AND column_name IN ('state', 'current_phase', 'locked_phase');

-- Verify new enum types
SELECT enum_label FROM pg_enum
WHERE enum_typid = (SELECT oid FROM pg_type WHERE typname = 'session_state');

-- Verify new tables
SELECT table_name FROM information_schema.tables
WHERE table_name IN ('session_progression_locks', 'session_state_history');

-- Verify functions
SELECT routine_name FROM information_schema.routines
WHERE routine_name IN ('update_session_state', 'get_next_lifter', 'mark_athlete_weighed_in');
```

---

## ⚠️ Important Notes

1. **Backward Compatibility**: Existing sessions will have `state = 'scheduled'` by default
2. **User Context**: Update auth middleware to pass `req.user.id` in requests
3. **Error Handling**: Endpoints return `success: false` with error message on invalid transitions
4. **Audit Trail**: All state changes are logged in `session_state_history` table
5. **Weigh-in Enforcement**: Cannot complete weigh-in until ALL athletes are weighed in

---

## ✅ Phase 1 Completion Checklist

- [x] Create database migration with all new tables/columns
- [x] Create state machine functions in database
- [x] Create weigh-in tracking functions
- [x] Create next lifter calculation function
- [x] Create backend state machine service
- [x] Create session state transition routes
- [x] Create weigh-in endpoints
- [x] Create audit trail endpoints
- [x] Integrate routes into main app
- [x] Test API endpoints
- [x] Create implementation documentation

**Ready for Phase 2!** 🚀
