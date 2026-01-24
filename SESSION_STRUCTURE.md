# Session Structure - Snatch & Clean & Jerk

## Overview

Each session in the WL System **automatically includes both Snatch and Clean & Jerk lifts**. This is the standard competition format.

---

## How It Works

### 1. Creating a Session

When you create a new session:
- ✅ Enter session name, weight category, gender, start time
- ✅ Session automatically starts with `current_lift = 'snatch'`
- ✅ **Both Snatch AND Clean & Jerk are automatically included**
- ❌ You don't need to (and shouldn't) create separate sessions

**Example:**
```
Session: "Men 81kg Snatch & C&J"
├── Snatch (current_lift)
│   ├── Attempt 1
│   ├── Attempt 2
│   └── Attempt 3
└── Clean & Jerk (current_lift)
    ├── Attempt 1
    ├── Attempt 2
    └── Attempt 3
```

### 2. Progression Through Lifts

**Snatch Phase:**
- Athletes complete up to 3 snatch attempts
- Session shows: "Current Lift: Snatch"
- Display screen shows snatch results

**Transition to Clean & Jerk:**
- Once all athletes complete snatch attempts
- Admin changes `current_lift` to `'clean_and_jerk'` via Technical Panel
- Session shows: "Current Lift: Clean & Jerk"

**Clean & Jerk Phase:**
- Athletes complete up to 3 C&J attempts
- Display screen shows C&J results

### 3. Session Completion

- Session status: "completed"
- All lifts finished
- Athlete rankings calculated (total = best snatch + best C&J)

---

## Database Structure

```sql
CREATE TABLE sessions (
    id UUID PRIMARY KEY,
    competition_id UUID,
    name VARCHAR(255),           -- "Men 81kg Snatch & C&J"
    weight_category VARCHAR(10), -- "81"
    gender gender_type,          -- "male"
    status session_status,       -- "scheduled" | "in-progress" | "completed"
    current_lift lift_type,      -- "snatch" | "clean_and_jerk"
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

**Key Fields:**
- `name`: User-friendly session identifier
- `weight_category`: Weight class (e.g., "81", "89", "+109")
- `gender`: Male or Female
- `current_lift`: **Tracks which lift phase the session is in**
  - `'snatch'` = Snatch phase active
  - `'clean_and_jerk'` = Clean & Jerk phase active
- `status`: Overall session status (scheduled → in-progress → completed)

---

## UI Indicators

### Session List
```
Session: "Men 81kg"
├─ Weight Category: 81kg
├─ Gender: Male
├─ Current Lift: Snatch
└─ Lifts: Snatch + C&J ✓  ← Shows both included
```

### When Creating
```
✓ Session automatically includes both Snatch and Clean & Jerk
```

### Technical Panel
```
Snatch Section:
├─ Lifting Order (snatch athletes)
├─ Current Attempt (snatch)
└─ Referee Decision Panel

[Switch to Clean & Jerk] ← Button to change current_lift

Clean & Jerk Section:
├─ Lifting Order (C&J athletes)
├─ Current Attempt (C&J)
└─ Referee Decision Panel
```

---

## Workflow Example

### Step 1: Create Session (3:00 PM)
```
Admin Panel → Sessions → New Session
├─ Name: "Men 81kg Qualifications"
├─ Weight Category: 81
├─ Gender: Male
├─ Start Time: 3:00 PM
└─ Status: Scheduled
✓ Session created with current_lift = 'snatch'
```

### Step 2: Start Snatch (3:15 PM)
```
Technical Panel
├─ Snatch athletes in lifting order
├─ Declare snatch attempts
└─ Record referee decisions
Display Screen shows: Snatch results
```

### Step 3: Finish Snatch (5:30 PM)
```
All athletes completed 3 snatch attempts
Current status: In Progress (Snatch phase complete)
```

### Step 4: Change to Clean & Jerk (5:45 PM)
```
Technical Panel → [Change Lift to Clean & Jerk]
current_lift changed to 'clean_and_jerk'
Session shows: "Current Lift: Clean & Jerk"
Display Screen updates to show C&J phase
```

### Step 5: Complete Clean & Jerk (7:30 PM)
```
All athletes completed 3 C&J attempts
Admin marks session: Status = "Completed"
Session shows: ✓ All lifts completed
Final standings calculated
```

---

## Important Notes

✅ **One Session = Both Lifts**
- Never create separate sessions for snatch and C&J
- One session flows through both lift types

✅ **Automatic Inclusion**
- When you create a session, both lifts are automatically included
- You only need to select: name, weight category, gender, start time

✅ **Current Lift Tracking**
- `current_lift` field tracks which phase the session is in
- Automatically affects which athletes appear in lifting orders
- Controls what the display screen shows

✅ **Transition Management**
- Admin must manually change `current_lift` when switching from snatch to C&J
- This is done via "Change Lift" button in Technical Panel
- Ensures proper progression through the competition

❌ **Don't Create Multiple Sessions**
- ❌ Wrong: Create "Men 81kg Snatch" then "Men 81kg C&J"
- ✅ Right: Create "Men 81kg" (includes both automatically)

---

## API Reference

### Create Session
```bash
POST /api/sessions
Content-Type: application/json

{
  "name": "Men 81kg Qualifications",
  "weight_category": "81",
  "gender": "male",
  "start_time": "2026-01-22T15:00:00Z",
  "status": "scheduled"
  // current_lift defaults to 'snatch'
}
```

### Change Current Lift
```bash
PUT /api/technical/sessions/:sessionId/current-lift
Content-Type: application/json

{
  "liftType": "clean_and_jerk"
}
```

### Get Session Details
```bash
GET /api/sessions/:sessionId

Response:
{
  "id": "uuid",
  "name": "Men 81kg",
  "weight_category": "81",
  "gender": "male",
  "current_lift": "snatch",  // Currently in snatch phase
  "status": "in-progress",
  ...
}
```

---

## Summary

🎯 **Key Takeaway:**
Create ONE session per weight category & gender combination. Each session automatically includes both Snatch and Clean & Jerk lifts. The `current_lift` field tracks which phase the competition is in, and it's updated as you progress through the competition.

✅ **System correctly implements IWF competition format!**
