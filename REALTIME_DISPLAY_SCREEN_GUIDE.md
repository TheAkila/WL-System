# Real-Time Display Screen Update Guide

## 🎯 Overview

The Display Screen updates in **real-time** during competition by listening to live events from the backend via **Socket.IO**. Every action in the Technical Panel instantly appears on the "behind the platform" screen without any delay or refresh needed.

---

## 🔄 Real-Time Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    REAL-TIME COMPETITION FLOW                   │
└─────────────────────────────────────────────────────────────────┘

   TECHNICAL PANEL              BACKEND (Socket.IO)         DISPLAY SCREEN
   (Control/Admin)              (Real-time Relay)           (Big Screen/TV)
   
        │                              │                            │
        │                              │◄─── LISTENS FOR ─────────┐ │
        │                              │     ALL UPDATES           │ │
        │                              │                            │ │
        ├─ [1] Record Decision ──────►│                            │ │
        │   (Good Lift/No Lift)        │─ [2] Update Database     │ │
        │                              │                            │ │
        │                              │─ [3] Supabase Detects     │ │
        │                              │     Change                │ │
        │                              │                            │ │
        │                              │─ [4] Emit Socket Event   │ │
        │                              │     (attempt:validated)  │ │
        │                              │                            │ │
        │                              │─────────────────────────►│ │
        │                              │                            ├─┤
        │                              │                            │ [5] Update UI
        │                              │                            │     Show Result
        │                              │                            │ [6] Play Animation
        │                              │                            │     (Green/Red)
```

---

## 📊 Step-by-Step Real-Time Update Process

### **Step 1: Admin Declares Attempt Result**

**Location**: `apps/admin-panel/src/components/technical/AttemptCell.jsx`

When the technical official marks a result in the admin panel:

```jsx
const markGoodLift = async () => {
  const updatedAttempt = {
    ...attempt,
    result: 'good'  // ✓ GOOD LIFT
  };
  
  await onUpdate(updatedAttempt);
  toast.success('✓ Good Lift');
};

const markNoLift = async () => {
  const updatedAttempt = {
    ...attempt,
    result: 'no_lift'  // ✗ NO LIFT
  };
  
  await onUpdate(updatedAttempt);
  toast.error('✗ No Lift');
};
```

### **Step 2: Backend Updates Database**

**Location**: `apps/backend/src/routes/attempt.routes.js`

The update is sent to the backend API:

```javascript
// Admin marks result: PATCH /api/attempts/:attemptId
{
  result: 'good'  // or 'no_lift'
}

// Database Update
UPDATE attempts
SET result = 'good',
    validated_at = NOW()
WHERE id = attemptId
```

### **Step 3: Supabase Detects Change**

**Location**: `apps/backend/src/socket/index.js`

The backend subscribes to database changes:

```javascript
const attemptsChannel = supabase
  .channel('attempts-changes')
  .on('postgres_changes', 
    {
      event: 'UPDATE',  // ← This triggers when result changes
      schema: 'public',
      table: 'attempts'
    },
    async (payload) => {
      // payload.old = { result: 'pending', ... }
      // payload.new = { result: 'good', ... }
      
      if (payload.old?.result === 'pending' && 
          payload.new?.result !== 'pending') {
        // Result has changed from pending to good/no-lift
        logger.info('✅ Attempt validated');
      }
    }
  )
  .subscribe();
```

### **Step 4: Backend Emits Socket Event**

**Location**: `apps/backend/src/socket/index.js`

When a change is detected, the backend broadcasts the event:

```javascript
if (payload.old?.result === 'pending' && payload.new?.result !== 'pending') {
  // Fetch full attempt with athlete and team data
  const { data: attempt } = await supabase
    .from('attempts')
    .select('*, athlete:athletes(*), session:sessions(*)')
    .eq('id', payload.new?.id)
    .single();

  // Broadcast to all displays watching this session
  io.to(`session:${sessionId}`).emit('attempt:validated', attempt);
  
  logger.info(`✅ Emitted attempt:validated to session:${sessionId}`);
}
```

### **Step 5: Display Screen Receives Event**

**Location**: `apps/display-screen/src/hooks/useRealtimeUpdates.js`

The Display Screen listens for the event:

```javascript
socketService.on('attempt:validated', (attempt) => {
  console.log('📥 Attempt validated:', attempt);
  setCurrentAttempt(attempt);
  
  // Clear after showing result for 5 seconds
  setTimeout(() => {
    setCurrentAttempt(null);
  }, 5000);
});
```

### **Step 6: Display Screen Updates UI**

**Location**: `apps/display-screen/src/App.jsx`

The UI instantly shows the result:

```jsx
{currentAttempt && currentAttempt.result !== 'pending' ? (
  /* RESULT DISPLAY */
  <div className="text-center">
    <div className={`text-9xl font-black mb-8 ${
      currentAttempt.result === 'good' ? 'text-green-500' : 'text-red-500'
    }`}>
      {currentAttempt.result === 'good' ? '✓ GOOD LIFT' : '✗ NO LIFT'}
    </div>
  </div>
) : null}
```

---

## 🔌 Socket Events Flow

### **Events Emitted by Display Screen**

| Event | Trigger | Payload |
|-------|---------|---------|
| `join:session` | Screen loads | `{ sessionId }` |
| `display:switch` | Admin clicks "Display" button | `{ sessionId }` |

### **Events Received by Display Screen**

| Event | Source | Purpose | Payload |
|-------|--------|---------|---------|
| `display:switch` | Admin Panel | **Activate/Switch Session** | `{ sessionId }` |
| `attempt:created` | Backend | **New attempt declared** | `{ id, athlete, weight, lift_type, ... }` |
| `attempt:updated` | Backend | **Weight or data changed** | `{ id, athlete, weight, ... }` |
| `attempt:validated` | Backend | **Result recorded (GOOD/NO LIFT)** | `{ id, result, athlete, ... }` |
| `leaderboard:updated` | Backend | **Rankings changed** | `[ { athlete, rank, total, ... } ]` |
| `timer:tick` | Backend | **Competition timer update** | `{ timeRemaining, isRunning, mode }` |
| `timer:started` | Backend | **Timer started** | `{ duration, mode }` |
| `timer:paused` | Backend | **Timer paused** | `{ timeRemaining }` |
| `timer:reset` | Backend | **Timer reset** | `{ duration }` |
| `session:updated` | Backend | **Session status changed** | `{ status, phase, ... }` |

---

## 🚀 Real-Time Update Sequence (Example)

### **Scenario: Recording a Snatch Result**

```
TIME    LOCATION              ACTION                          DISPLAY SCREEN
────────────────────────────────────────────────────────────────────────────

0ms     Admin Panel           Shows "Snatch 1 - 75kg"
                              Pending decision buttons

100ms   Admin Clicks          "Good Lift ✓" button
                              (Admin Panel)

110ms   Backend API           Updates: attempts.result = 'good'
                              (Database)

120ms   Supabase Change       Detects UPDATE on attempts table
        Detection             Old: result = 'pending'
                              New: result = 'good'

130ms   Socket.IO Event       Backend emits:
        Emission              io.to(`session:${id}`).emit(
                                'attempt:validated',
                                { id, result: 'good', weight: 75, ... }
                              )

150ms   Display Screen ◄─────────────────────────────────────────────┐
        Receives Event        attempt:validated event arrives

160ms   React Update          setCurrentAttempt(attempt)
                              setCurrentAttempt shows:
                              - Athlete Name
                              - Weight: 75 KG
                              - Result: ✓ GOOD LIFT (GREEN)

170ms   Animation             UI animates result display

5 SEC   Auto Clear            Result hidden, waiting for next attempt
```

---

## 📱 What Display Screen Shows at Each Stage

### **Stage 1: Waiting for Session**

```
Screen State: "Waiting for active session..."
Socket Status: ● Connected
When: Before admin clicks "Display" button
```

### **Stage 2: Session Activated**

```
Screen State: Shows current athlete
Background: Blue header with competition info
When: Admin clicks "Display" button
```

### **Stage 3: Pending Attempt**

```
Display Shows:
┌─────────────────────────────────────────────┐
│     ALEX JOHNSON              ATTEMPT 1     │
│     🇬🇧 Great Britain        75 KG         │
│     BIB #23                  OF 3           │
└─────────────────────────────────────────────┘
When: New attempt is declared
```

### **Stage 4: Result Shown**

```
Display Shows:
┌─────────────────────────────────────────────┐
│                                             │
│            ✓ GOOD LIFT                     │
│                                             │
│        (Green background, animated)         │
│                                             │
└─────────────────────────────────────────────┘

OR

┌─────────────────────────────────────────────┐
│                                             │
│            ✗ NO LIFT                       │
│                                             │
│        (Red background, animated)           │
│                                             │
└─────────────────────────────────────────────┘

When: Admin records result (Good Lift / No Lift)
```

---

## ⚙️ How to Activate Display Screen

### **Option 1: From Technical Panel (Recommended)**

1. Open **Technical Panel** → Select **Session**
2. Click **"Display"** button (Monitor icon) in top right toolbar
3. Display Screen instantly shows the session

```
Display Button Location:
[← Back] | [Phase Controls] | [Display] | [Print] | [Export] | [Clear]
                                ↑
                          Click this button
```

### **Option 2: Using URL Parameter**

```
http://localhost:3001?session=SESSION_UUID
```

The Display Screen will load the session immediately without requiring the button click.

### **Option 3: Auto-Select First Session**

```
http://localhost:3001
```

Automatically selects the first in-progress session from the database.

---

## 🔧 Testing Real-Time Updates

### **Test Checklist**

- [ ] **Step 1**: Start all services (Backend, Admin Panel, Display Screen)
- [ ] **Step 2**: Open Display Screen in separate window/monitor
- [ ] **Step 3**: Display shows "Waiting for active session..."
- [ ] **Step 4**: Go to Technical Panel and select a session
- [ ] **Step 5**: Click "Display" button
- [ ] **Step 6**: Display screen shows current session info
- [ ] **Step 7**: In Admin Panel, declare an attempt (GOOD LIFT / NO LIFT)
- [ ] **Step 8**: Display screen instantly shows the result
- [ ] **Step 9**: Verify result animates and displays correctly
- [ ] **Step 10**: Verify browser console shows socket events in real-time

### **Console Debug Output**

**Admin Panel Console** (Press F12):
```
✅ Socket connected with ID: abc123
👂 Listening for display:switch events
📋 Initial current attempt loaded: { id: ..., weight: 75, ... }
📥 Attempt validated: { result: 'good', ... }
```

**Display Screen Console** (Press F12):
```
✅ Socket connected with ID: xyz789
✅ Joined session room: session-uuid
📥 Attempt validated: { result: 'good', weight: 75, ... }
🏆 Initial leaderboard loaded: [ ... ]
```

---

## 🎨 Real-Time Features Summary

| Feature | Real-Time | Latency | Source |
|---------|-----------|---------|--------|
| **Athlete Display** | ✅ Yes | ~150ms | attempt:created |
| **Weight Updates** | ✅ Yes | ~150ms | attempt:updated |
| **Result Animation** | ✅ Yes | ~150ms | attempt:validated |
| **Leaderboard** | ✅ Yes | ~200ms | leaderboard:updated |
| **Timer Display** | ✅ Yes | ~100ms | timer:tick |
| **Session Switch** | ✅ Yes | ~200ms | display:switch |
| **Background Color** | ✅ Yes | ~150ms | session:updated |

---

## 📊 Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                     REAL-TIME ARCHITECTURE                        │
└──────────────────────────────────────────────────────────────────┘

ADMIN PANEL                          BACKEND                   DISPLAY SCREEN
┌──────────────┐                  ┌──────────┐                ┌──────────────┐
│ Technical    │                  │ Socket   │                │ Display      │
│ Panel        │                  │ Server   │                │ Screen       │
│              │                  │          │                │              │
│ - Mark       │◄──API────────────┤ - Listen │◄───Supabase───┤ - Show       │
│   Result     │     Request      │ for DB   │  Real-time    │   Attempt    │
│ - Change     │                  │ changes  │               │ - Show       │
│   Weight     │                  │          │               │   Result     │
│ - Declare    │                  │ - Emit   │───Socket.IO──►│ - Animate    │
│   Attempt    │                  │   Events │   Broadcast   │   Result     │
│              │                  │          │               │              │
└──────────────┘                  └──────────┘               └──────────────┘
    :3000                            :5000                         :3001
```

---

## 🔍 Troubleshooting Real-Time Issues

### **Display Screen Not Updating?**

**Check 1**: Socket Connection
```javascript
// In Display Screen console:
console.log(socketConnected);  // Should be true
```

**Check 2**: Session Joined
```javascript
// In Display Screen console:
// Should see: "✅ Joined session room: session-uuid"
```

**Check 3**: Backend Emitting Events
```javascript
// In Backend console:
// Should see: "✅ Emitted attempt:validated to session:..."
```

**Check 4**: Browser Network Tab
```
Look for Socket.IO handshake and message frames
Example: /socket.io/?EIO=4&transport=websocket
```

### **Delayed Updates?**

- Check network latency (aim for <200ms)
- Verify Supabase realtime is connected
- Check backend logs for processing delays
- Verify database indexes on `attempts.session_id`

### **Result Not Showing?**

1. Verify attempt result is actually changing in database
2. Check if `attempt:validated` event is being emitted
3. Verify Display Screen is joined to correct session
4. Clear browser cache (Cmd+Shift+Delete)

---

## 🎯 Best Practices

### **For Smooth Real-Time Experience**

1. **Keep Display Screen Connection Active**
   - Don't close or refresh the Display Screen window
   - Minimize browser tabs for better performance

2. **Use Stable Network**
   - Wired Ethernet for critical competition use
   - Avoid switching WiFi networks mid-competition

3. **Monitor Backend Logs**
   - Watch for database errors
   - Watch for Socket.IO connection drops

4. **Test Before Competition**
   - Run through full workflow
   - Test with real athlete data
   - Verify TV display quality and size

5. **Have Backup Display**
   - Keep second display ready (laptop/tablet)
   - In case primary display fails

---

## 📞 Technical Support Commands

```bash
# Check if all services are running
ps aux | grep node

# View Backend Socket events (realtime)
tail -f backend.log | grep "attempt:"

# View Display Screen Connection status
# (Open browser console: F12)

# Restart if experiencing issues
npm run dev  # (in each app directory)
```

---

**Last Updated**: January 2026  
**System Version**: WL-System v1.0  
**Display Screen**: Production Ready ✅
