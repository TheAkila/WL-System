# Technical Panel - Quick Start Guide

## 🎯 Purpose
The Technical Panel is the main control interface for competition officials to manage live weightlifting sessions.

## ✨ Features

### Session Management
- Select active sessions
- Start/pause/complete sessions
- Switch between Snatch and Clean & Jerk

### Attempt Control
- View lifting order (automatically sorted by rules)
- Declare athlete attempts with weight
- Record GOOD LIFT / NO LIFT decisions
- Automatic progression to next athlete

### Real-time Updates
- Live updates via Socket.IO
- Automatic leaderboard refresh
- Instant result broadcasting to all screens

### Display Information
- Current athlete on platform
- Next athlete in order
- Session standings
- Athlete statistics

## 🚀 How to Use

### 1. Select a Session
- Navigate to `/technical` in admin panel
- Choose from active or scheduled sessions
- Session must be created first in Sessions page

### 2. Start the Session
- Click "Start Session" to begin
- Current lift defaults to Snatch
- Use "Switch to Clean & Jerk" when ready

### 3. Manage Attempts

#### Declare an Attempt
1. Find athlete in lifting order
2. Click expand button (▼)
3. Enter weight in kilograms
4. Click "Declare Attempt"

#### Record Decision
1. After athlete completes lift
2. Click **GOOD LIFT** (green) or **NO LIFT** (red)
3. Result is automatically validated
4. System moves to next athlete

### 4. Monitor Progress
- Leaderboard updates automatically
- Rankings calculated by:
  1. Total weight
  2. Bodyweight (lighter wins tie)
  3. Start number (lower wins tie)

## 📡 API Endpoints

### Get Active Sessions
```
GET /api/technical/sessions/active
```

### Get Lifting Order
```
GET /api/technical/sessions/:sessionId/lifting-order
```

### Declare Attempt
```
POST /api/technical/attempts/declare
Body: { athleteId: UUID, weight: number }
```

### Record Quick Decision
```
POST /api/technical/attempts/:attemptId/quick-decision
Body: { decision: 'good' | 'no-lift' }
```

### Update Session Status
```
PUT /api/technical/sessions/:sessionId/status
Body: { status: 'in-progress' | 'completed' }
```

### Change Lift Type
```
PUT /api/technical/sessions/:sessionId/lift-type
Body: { liftType: 'snatch' | 'clean_and_jerk' }
```

## 🔌 Socket.IO Events

### Events Emitted by Server
- `attempt:created` - New attempt declared
- `attempt:updated` - Referee decision recorded
- `attempt:validated` - Final result confirmed
- `session:updated` - Session status changed

### Events Received by Client
- Automatic subscription to session room
- Real-time updates for all connected clients

## 🎨 Component Structure

```
TechnicalPanel (Main Page)
├── SessionSelector
│   └── Displays active sessions
├── SessionControls
│   └── Start/pause/complete session
│   └── Switch lift type
├── CurrentLiftDisplay
│   └── Shows current lift type
├── LiftingOrder
│   └── List of athletes
│   └── Attempt declaration
├── AttemptControl
│   └── Current athlete info
│   └── GOOD LIFT / NO LIFT buttons
└── Leaderboard Table
    └── Real-time standings
```

## ⚙️ Configuration

### Environment Variables
```bash
# Backend (.env)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_key
PORT=5000
```

### Database Requirements
- PostgreSQL schema deployed to Supabase
- Functions: get_lifting_order, declare_attempt
- Triggers: Auto-validation, auto-ranking
- Views: Leaderboard with rankings

## 🧪 Testing

### Test Workflow
1. Create a competition
2. Add athletes to competition
3. Create a session
4. Navigate to Technical Panel
5. Select the session
6. Start session
7. Declare attempts for athletes
8. Record decisions
9. Verify leaderboard updates

### Sample Data
Use `database/test_data.sql` to populate test competition with athletes demonstrating tie-breaking logic.

## 🐛 Troubleshooting

### No sessions appearing
- Check session status (must be 'scheduled' or 'in-progress')
- Verify sessions exist in database
- Check API endpoint response

### Lifting order not showing
- Ensure session has athletes
- Verify athletes have start numbers
- Check current_lift matches expected lift type

### Socket.IO not connecting
- Verify backend is running
- Check CORS configuration
- Ensure Socket.IO server initialized

### Decisions not recording
- Check authentication (must be technical/admin role)
- Verify attempt is in pending state
- Check attempt ID is valid UUID

## 📋 Best Practices

1. **Always declare attempts in order** - System handles sorting
2. **Record decisions immediately** - Prevents delays
3. **Monitor leaderboard** - Verify rankings update correctly
4. **Switch lifts at appropriate time** - After all snatch attempts
5. **Complete session** - Mark as completed when done

## 🔐 Security

- Routes protected with JWT authentication
- Role-based authorization (admin, technical, referee)
- Supabase Row Level Security policies
- Input validation on all endpoints

## 📱 Mobile Support

- Responsive design for tablets
- Touch-friendly buttons
- Large text for visibility
- Works on iPad and large phones
