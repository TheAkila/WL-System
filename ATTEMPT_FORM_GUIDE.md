# Attempt Entry Form Implementation Guide

## Overview

The Attempt Entry Form is a comprehensive form for managing athlete attempts in snatch and clean & jerk lifts. It's based on the PDF form structure from the previous system and allows technical staff to enter all three attempts for both lifts for a single athlete.

## Form Structure

### Snatch Section (Blue Theme)
- **3 Attempt Rows**: Each with:
  - Weight field (kg, accepts decimals like 47.5)
  - Result dropdown: "No Result", "✓ Good", "✗ No Lift"
- **Best Snatch Display**: Shows highest weight with "good" result
- **Color Coding**: Blue accents for Snatch

### Clean & Jerk Section (Red Theme)
- **3 Attempt Rows**: Identical to Snatch section
- **Best C&J Display**: Shows highest weight with "good" result
- **Color Coding**: Red accents for Clean & Jerk

### Summary Section (Purple Theme)
- **Total Display**: Automatically calculates best_snatch + best_clean_jerk
- **Live Updates**: Updates as user changes weights/results

## How to Access the Form

### Method 1: Quick Access Button
1. Go to **Technical Panel**
2. Look for the purple "Open Attempt Entry Form" button
3. Click to open the form
4. Click "Select an athlete..." message to proceed

### Method 2: Direct from Leaderboard
1. Go to **Technical Panel** → Scroll to **Current Standings**
2. Find the athlete in the leaderboard table
3. Click the purple **✎ (Edit)** icon in the **Actions** column
4. The Attempt Entry Form opens with that athlete pre-selected

## How to Use the Form

### Step 1: Select an Athlete
When the form opens, select an athlete from the current session (if not already selected from leaderboard).

### Step 2: Enter Snatch Attempts
- Enter weight for Attempt 1 (e.g., 45, 47.5)
- Select result (Good Lift / No Lift / No Result)
- Repeat for Attempts 2 and 3
- Best Snatch automatically shows the highest successful (good) attempt

### Step 3: Enter Clean & Jerk Attempts
- Follow the same process as Snatch
- Enter all three attempts with weights and results
- Best C&J automatically calculated

### Step 4: Review Total
- See the Total (sum of best snatch + best C&J) at the bottom
- Should match the competition rules

### Step 5: Save
1. Click **"Save Attempts"** button
2. Form validates that at least one weight is entered
3. On success:
   - Toast notification confirms save
   - Lifting order updates automatically
   - Leaderboard refreshes
   - Form closes

## Form Features

### Auto-Calculations
- **Best Snatch**: Maximum weight with "good" result (0 if no good attempts)
- **Best C&J**: Maximum weight with "good" result (0 if no good attempts)
- **Total**: Best Snatch + Best C&J (0 if both are 0)

### Input Validation
- Weights: Accept decimal numbers (e.g., 47.5kg)
- Required: At least one weight must be entered
- No negative weights allowed
- Numeric input only

### Data Persistence
- Form loads existing attempts for the athlete if available
- Can update individual attempts without re-entering all
- Attempts are stored with athlete and session context

### Real-Time Integration
- After save, all systems update:
  - Lifting order recalculates based on new weights
  - Leaderboard reflects new totals
  - Display screens show updated weights
  - Socket.io broadcasts changes to all connected clients

## API Integration

### Endpoints Used

#### 1. Get Athlete Attempts
```
GET /attempts/athlete/:athlete_id?session_id=:session_id
```
**Response**: Array of attempt objects with fields:
- `id`: Attempt ID
- `attempt_number`: 1, 2, or 3
- `weight`: Weight in kg
- `lift_type`: "snatch" or "clean_and_jerk"
- `result`: "good" or "no_lift"

#### 2. Create New Attempt
```
POST /attempts
Body: {
  athlete_id: number,
  session_id: number,
  lift_type: "snatch" | "clean_and_jerk",
  attempt_number: 1 | 2 | 3,
  weight: number,
  result: "good" | "no_lift" | ""
}
```

#### 3. Update Existing Attempt
```
PUT /attempts/:attempt_id
Body: {
  weight: number,
  result: "good" | "no_lift" | ""
}
```

## Component Architecture

### File Location
```
/apps/admin-panel/src/components/technical/AttemptForm.jsx (508 lines)
```

### Component Props
```jsx
<AttemptForm
  session={selectedSession}           // Current session object
  selectedAthlete={athlete}           // Athlete { id, name, body_weight, faculty }
  onClose={() => {}}                  // Callback when form closes
  onSuccess={() => {}}                // Callback when attempts saved successfully
/>
```

### State Management
- `loading`: Boolean for async operations
- `attempts`: Object with `snatch` and `clean_and_jerk` arrays
  - Each array has 3 attempt objects: `{ attempt_number, weight, result, id }`

### Key Functions
- `loadAttempts()`: Fetch existing attempts from API
- `handleAttemptChange()`: Update attempt in local state
- `getBestAttempt()`: Calculate best weight (filters for "good" results)
- `handleSave()`: Validate and save all attempts

## UI/UX Details

### Color Scheme
- **Snatch**: Blue (#3B82F6) - represents the explosive snatch lift
- **Clean & Jerk**: Red (#EF4444) - represents the powerful C&J lift
- **Total**: Purple (#9333EA) - represents the combined achievement

### Responsive Design
- **Desktop**: Side-by-side snatch and C&J sections
- **Mobile**: Stacked layout with collapsible sections

### Toast Notifications
- Success: "✓ Attempts saved for [Athlete Name]"
- Error: "Failed to save attempts"
- Error: "Please select an athlete"
- Error: "Please enter at least one weight"

## Workflow Example

```
1. Open Technical Panel
   ↓
2. Select a session
   ↓
3. Click "Open Attempt Entry Form"
   ↓
4. (From leaderboard) Click ✎ icon on athlete
   ↓
5. Form opens with athlete selected
   ↓
6. Enter Snatch:
   - Attempt 1: 45kg ✓ Good
   - Attempt 2: 47.5kg ✗ No Lift
   - Attempt 3: blank
   Best Snatch: 45kg
   ↓
7. Enter Clean & Jerk:
   - Attempt 1: 55kg ✓ Good
   - Attempt 2: 58kg ✓ Good
   - Attempt 3: 60kg ✗ No Lift
   Best C&J: 58kg
   ↓
8. Total: 45 + 58 = 103kg
   ↓
9. Click "Save Attempts"
   ↓
10. Form validates & saves all 6 attempts
    ↓
11. Toast: "✓ Attempts saved for [Athlete Name]"
    ↓
12. Lifting order updates
    ↓
13. Leaderboard refreshes
    ↓
14. All connected displays update in real-time
```

## Integration Points

### TechnicalPanel.jsx
- Hosts the AttemptForm
- Manages form visibility state
- Passes session and selected athlete
- Handles refresh callbacks (lifting order, leaderboard)

### LiftingOrder.jsx
- Uses attempt weights to calculate lifting order
- Refreshes after attempts are saved
- Orders athletes by best snatch, then best C&J

### RefereeDecisionPanel.jsx
- Works alongside AttemptForm
- AttemptForm sets initial weights
- Referee panel records live decisions

## Data Flow

```
AttemptForm (User Input)
    ↓
loadAttempts() [GET /attempts/athlete/:id]
    ↓
User enters weights and results
    ↓
handleSave()
    ├─ POST /attempts (new attempts)
    ├─ PUT /attempts/:id (update existing)
    ↓
onSuccess callback
    ├─ fetchLiftingOrders()
    ├─ fetchLeaderboard()
    ├─ fetchCurrentAttempts()
    ↓
Socket.io broadcasts updates
    ↓
Display Screens, Scoreboard, and all clients update
```

## Edge Cases & Validation

### Empty Weights
- At least one weight required across all 6 attempts
- Empty attempts (no weight) are skipped in the save process

### No Good Lifts
- If no "good" result for a lift type, best shows 0
- Total correctly calculates as 0 + other_lift_best

### Updating Existing Attempts
- Form detects if attempt.id exists
- Updates via PUT instead of POST
- User can change result from good to no_lift or vice versa

### Weight Constraints
- Decimal weights supported (47.5kg)
- Positive numbers only
- IWF rules validation handled by backend

## Performance Considerations

- Form loads attempts on mount (useEffect)
- Local state updates are instant (no API call)
- API calls only on save (batch all 6 attempts)
- Toast notifications for user feedback

## Testing Checklist

- [ ] Select athlete from leaderboard edit button
- [ ] Enter snatch attempts and see best snatch update
- [ ] Enter clean & jerk and see best C&J update
- [ ] See total calculate correctly
- [ ] Save form and verify success toast
- [ ] Check lifting order updates
- [ ] Check leaderboard reflects new totals
- [ ] Open form again and verify attempts are loaded
- [ ] Update an attempt and save
- [ ] Test decimal weights (e.g., 47.5)
- [ ] Test changing result from good to no_lift
- [ ] Test modal close button
- [ ] Test on mobile responsive layout

## Future Enhancements

- Add confirmation dialog before save
- Add validation for IWF minimum weight increases
- Add undo/revert button
- Add bulk athlete import
- Add print/export functionality
- Add template attempts from previous sessions
- Add weight history graph per athlete
