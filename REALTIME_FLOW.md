# Real-time Update Flow Documentation

## 🔄 Complete Data Flow

### When Admin Records a Lift Decision

```
1. Technical Panel UI
   ↓ User clicks "GOOD LIFT" or "NO LIFT"
   
2. Frontend API Call
   POST /api/technical/attempts/:attemptId/quick-decision
   Body: { decision: 'good' | 'no-lift' }
   ↓
   
3. Backend Controller (technical.controller.js)
   - Updates Supabase: attempts table
   - Sets referee_left, referee_center, referee_right = decision
   ↓
   
4. PostgreSQL Database Triggers (Automatic)
   ✓ validate_attempt_result trigger
     - Checks 2 out of 3 majority
     - Updates attempt.result field
   
   ✓ update_athlete_totals trigger
     - Recalculates best_snatch
     - Recalculates best_clean_and_jerk
     - Updates total = best_snatch + best_clean_and_jerk
   
   ✓ update_session_rankings trigger
     - Ranks all athletes in session
     - Applies tie-breaking: total DESC, body_weight ASC, start_number ASC
     - Updates rank field for all athletes
   ↓
   
5. Supabase Realtime (PostgreSQL LISTEN/NOTIFY)
   - Detects INSERT/UPDATE on attempts table
   - Detects UPDATE on athletes table
   ↓
   
6. Backend Socket.IO Handler (socket/index.js)
   
   On Attempt Update:
   ✓ Fetches full attempt with athlete details
   ✓ Emits 'attempt:updated' to session room
   ✓ If result changed: emits 'attempt:validated'
   ✓ Fetches updated leaderboard
   ✓ Emits 'leaderboard:updated' to session room
   
   On Athlete Update:
   ✓ Detects changes in best lifts, total, or rank
   ✓ Fetches updated leaderboard
   ✓ Emits 'leaderboard:updated' to session room
   ↓
   
7. Connected Clients Receive Updates
   
   Admin Panel:
   - Shows "GOOD LIFT" / "NO LIFT" result
   - Updates leaderboard table
   - Moves to next athlete
   
   Display Screen:
   - Shows animated result (green check / red X)
   - Updates big screen leaderboard
   - Displays next athlete
   
   Scoreboard:
   - Shows attempt result
   - Updates mobile-friendly rankings
   - Highlights changes
```

## 📡 Socket.IO Events

### Emitted by Server

| Event | Trigger | Payload | Recipients |
|-------|---------|---------|------------|
| `attempt:created` | New attempt declared | Full attempt + athlete | All clients in session room |
| `attempt:updated` | Referee decision recorded | Full attempt + athlete | All clients in session room |
| `attempt:validated` | Result finalized (good/no-lift) | Full attempt + athlete | All clients in session room |
| `leaderboard:updated` | Rankings recalculated | Array of athlete rankings | All clients in session room |
| `session:updated` | Session status/lift changed | Full session + competition | All clients in session room |

### Listened by Clients

All three frontends (admin, display, scoreboard) listen to the same events for real-time synchronization.

## 🗄️ Database Triggers

### 1. validate_attempt_result
**Table:** attempts  
**Event:** AFTER UPDATE OF referee_left, referee_center, referee_right  
**Function:** 2 out of 3 majority voting
```sql
good_count = count('good' in [referee_left, referee_center, referee_right])
result = good_count >= 2 ? 'good' : 'no-lift'
```

### 2. update_athlete_totals
**Table:** attempts  
**Event:** AFTER UPDATE OF result  
**Function:** Recalculate best lifts and total
```sql
best_snatch = MAX(weight) WHERE lift_type='snatch' AND result='good'
best_clean_and_jerk = MAX(weight) WHERE lift_type='clean_and_jerk' AND result='good'
total = best_snatch + best_clean_and_jerk
sinclair_total = total * calculate_sinclair_coefficient(body_weight, gender)
```

### 3. update_session_rankings
**Table:** athletes  
**Event:** AFTER UPDATE OF total, body_weight  
**Function:** Rank all athletes with tie-breaking
```sql
RANK() OVER (
  PARTITION BY session_id
  ORDER BY 
    total DESC,           -- Higher total wins
    body_weight ASC,      -- Lighter bodyweight wins tie
    start_number ASC      -- Lower start number wins tie
)
```

## 🔌 Supabase Realtime Subscriptions

### Backend Setup (socket/index.js)

```javascript
// Subscribe to attempts table
db.supabase
  .channel('attempts-changes')
  .on('postgres_changes', { 
    event: '*', 
    schema: 'public', 
    table: 'attempts' 
  }, handleAttemptChange)
  .subscribe()

// Subscribe to athletes table
db.supabase
  .channel('athletes-changes')
  .on('postgres_changes', { 
    event: 'UPDATE', 
    schema: 'public', 
    table: 'athletes' 
  }, handleAthleteChange)
  .subscribe()

// Subscribe to sessions table
db.supabase
  .channel('sessions-changes')
  .on('postgres_changes', { 
    event: 'UPDATE', 
    schema: 'public', 
    table: 'sessions' 
  }, handleSessionChange)
  .subscribe()
```

## 🎯 Client-Side Hooks

### Admin Panel
```javascript
// pages/TechnicalPanel.jsx
useEffect(() => {
  socketService.on('attempt:validated', (attempt) => {
    toast.success(`${attempt.athlete.name}: ${attempt.result}`);
    setCurrentAttempt(null);
    fetchLiftingOrder();
  });
  
  socketService.on('leaderboard:updated', (leaderboard) => {
    setLeaderboard(leaderboard);
  });
}, [selectedSession]);
```

### Display Screen
```javascript
// hooks/useRealtimeUpdates.js
export const useRealtimeUpdates = (sessionId) => {
  useEffect(() => {
    socketService.on('attempt:validated', (attempt) => {
      setCurrentAttempt(attempt);
      // Clear after animation
      setTimeout(() => setCurrentAttempt(null), 5000);
    });
    
    socketService.on('leaderboard:updated', (leaderboard) => {
      setLeaderboard(leaderboard);
    });
  }, [sessionId]);
};
```

### Scoreboard
```javascript
// hooks/useRealtimeUpdates.js
export const useRealtimeUpdates = (sessionId) => {
  useEffect(() => {
    socketService.on('attempt:validated', (attempt) => {
      setCurrentAttempt(attempt);
      setTimeout(() => setCurrentAttempt(null), 3000);
    });
    
    socketService.on('leaderboard:updated', (leaderboard) => {
      setLeaderboard(leaderboard);
    });
  }, [sessionId]);
};
```

## ⏱️ Timing & Performance

| Operation | Duration | Notes |
|-----------|----------|-------|
| API Request | ~50-100ms | POST decision to backend |
| Database Update | ~10-20ms | Update attempts table |
| Trigger Execution | ~20-50ms | All 3 triggers run |
| Supabase Realtime | ~50-100ms | PostgreSQL NOTIFY → Supabase → Client |
| Socket.IO Broadcast | ~10-30ms | Server → All connected clients |
| **Total Latency** | **~150-300ms** | From click to all screens updated |

## 🧪 Testing Real-time Updates

### Step-by-Step Test

1. **Setup**
   ```bash
   # Terminal 1 - Backend
   cd apps/backend
   npm run dev
   
   # Terminal 2 - Admin Panel
   cd apps/admin-panel
   npm run dev
   
   # Terminal 3 - Display Screen
   cd apps/display-screen
   npm run dev
   
   # Terminal 4 - Scoreboard
   cd apps/scoreboard
   npm run dev
   ```

2. **Open Multiple Windows**
   - Admin Panel: http://localhost:3000/technical
   - Display Screen: http://localhost:3001
   - Scoreboard: http://localhost:3002
   - Browser DevTools console on all three

3. **Test Workflow**
   - Select session in admin panel
   - Declare an attempt (athlete + weight)
   - Click "GOOD LIFT" or "NO LIFT"
   - **Observe:**
     - ✅ Admin panel shows result immediately
     - ✅ Display screen animates result
     - ✅ Scoreboard updates rankings
     - ✅ All leaderboards show new totals
     - ✅ Rankings reorder if needed

4. **Check Console Logs**
   ```
   Backend:
   📡 Attempt change detected: UPDATE
   ✅ Emitted attempt:validated to session:xxx
   📊 Emitted leaderboard:updated to session:xxx
   
   Frontend (all 3):
   Attempt validated: { result: 'good', weight: 100, ... }
   Leaderboard updated: [{ rank: 1, total: 250, ... }]
   ```

## 🐛 Debugging Real-time Issues

### No Updates Received

1. **Check Socket.IO Connection**
   ```javascript
   // In browser console
   console.log(socketService.socket.connected);
   // Should be true
   ```

2. **Verify Room Join**
   ```javascript
   // Backend logs should show:
   Socket xxx joined session:yyy
   ```

3. **Check Supabase Realtime**
   - Enable Realtime in Supabase dashboard
   - Check RLS policies allow SELECT
   - Verify channel subscriptions in backend logs

### Updates Delayed

1. **Check Database Triggers**
   ```sql
   -- Verify triggers exist
   SELECT trigger_name, event_manipulation, event_object_table 
   FROM information_schema.triggers 
   WHERE trigger_schema = 'public';
   ```

2. **Monitor Network Tab**
   - WebSocket connection should stay open
   - No reconnection loops

### Inconsistent State

1. **Force Refresh**
   ```javascript
   // Fetch latest data from API
   await fetchLiftingOrder();
   await fetchLeaderboard();
   ```

2. **Check for Race Conditions**
   - Database triggers run in transaction
   - Socket events emitted after commit

## 🔐 Security Considerations

1. **Authentication Required**
   - Technical panel endpoints require JWT token
   - Socket.IO connections should verify auth

2. **Row Level Security (RLS)**
   - Supabase RLS policies control data access
   - Realtime subscriptions respect RLS

3. **Input Validation**
   - Express validator on all API endpoints
   - Type checking in database functions

## 📊 Monitoring

### Key Metrics

- Socket.IO connections: Active clients per session
- Event emission rate: Events per second
- Database trigger execution time
- Realtime subscription lag

### Logging

All events are logged with Winston:
```
INFO: 🔌 New client connected: abc123
INFO: Socket abc123 joined session:def456
INFO: 📡 Attempt change detected: UPDATE
INFO: ✅ Emitted attempt:validated to session:def456
INFO: 📊 Emitted leaderboard:updated - 10 athletes
```

## 🚀 Optimization Tips

1. **Batch Updates** - Leaderboard emitted once after all triggers complete
2. **Debounce** - Prevent rapid successive updates
3. **Selective Subscriptions** - Only subscribe to active sessions
4. **Connection Pooling** - Reuse database connections
5. **Caching** - Cache leaderboard for 1-2 seconds

## 📱 Multi-Device Synchronization

All devices viewing the same session receive identical updates simultaneously:
- Technical official's tablet
- Big screen display
- Audience mobile phones
- Remote viewers

This creates a unified, real-time competition experience for all participants!
