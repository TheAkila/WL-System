# IWF Competition Flow Implementation

## ✅ Changes Implemented

### 1. Database Schema Updates

**New Migration:** `004_opening_attempts_and_lot_numbers.sql`

Added fields to `athletes` table:
- `opening_snatch` (INTEGER) - Opening snatch attempt declared at weigh-in
- `opening_clean_jerk` (INTEGER) - Opening clean & jerk attempt declared at weigh-in
- `lot_number` (INTEGER) - Random number for tie-breaking when same declared weight
- `weigh_in_completed_at` (TIMESTAMP) - When official weigh-in was completed

### 2. Weigh-In Process (Complete Rewrite)

**File:** `apps/admin-panel/src/pages/WeighIn.jsx`

**New Features:**
- ✅ Record body weight (existing)
- ✅ Declare opening snatch attempt
- ✅ Declare opening clean & jerk attempt
- ✅ Assign random lot numbers to all athletes in session
- ✅ Complete validation before submission
- ✅ Visual indicators for completed weigh-ins
- ✅ Edit/clear weigh-in data

**UI Improvements:**
- Three-input form: Body Weight, Opening Snatch, Opening C&J
- "Assign Lot Numbers" button for random lot generation
- Progress tracking per session
- Visual cards showing all weigh-in data
- Green highlight for completed weigh-ins

### 3. Correct Competition Flow

**Phase 1: Setup (Admin)**
```
1. Create Competition
2. Create Sessions (by weight category + gender)
3. Create Teams/Clubs
```

**Phase 2: Registration (Technical Official)**
```
4. Register Athletes
   - Name, country, DOB, gender, weight category
   - MANUAL team selection (dropdown)
   - Auto-assign session by weight category
   - Assign start number
```

**Phase 3: Weigh-In (Technical Official)**
```
5. Official Weigh-In (2 hours before session)
   - Record body weight
   - Declare opening snatch attempt
   - Declare opening clean & jerk attempt
   - System assigns lot numbers randomly
```

**Phase 4: Competition**
```
6. Snatch Phase
   - Calculate lifting order (lowest weight → lot number)
   - 3 attempts per athlete

7. Clean & Jerk Phase
   - Recalculate lifting order
   - 3 attempts per athlete

8. Results
   - Total = Best Snatch + Best C&J
   - Tie-breaker: Lower bodyweight wins
   - Medals assigned automatically
```

## 🔧 How to Apply Changes

### Step 1: Run Database Migration

**Option A: Using Supabase Dashboard**
1. Go to your Supabase project
2. Navigate to SQL Editor
3. Copy content from `database/migrations/004_opening_attempts_and_lot_numbers.sql`
4. Execute the SQL

**Option B: Using Migration Script**
```bash
cd database/migrations
node run-migration-004.js
```

### Step 2: Restart Backend
```bash
cd apps/backend
npm start
```

### Step 3: Rebuild Frontend
```bash
cd apps/admin-panel
npm run build
```

### Step 4: Test Weigh-In Process

1. Create a competition
2. Create sessions
3. Create teams
4. Register athletes (with manual team selection)
5. Go to Weigh-In page
6. Select a session
7. Complete weigh-in for athletes:
   - Enter body weight
   - Enter opening snatch
   - Enter opening C&J
8. Click "Assign Lot Numbers" to randomly assign lot numbers

## ✅ What's Correct Now

1. ✅ Manual team assignment during registration
2. ✅ Opening attempts declared during weigh-in
3. ✅ Lot numbers for tie-breaking
4. ✅ Complete weigh-in validation
5. ✅ Proper IWF competition flow
6. ✅ All data needed for lifting order calculation

## 🔜 Next Steps (Future Enhancements)

1. **Lifting Order Calculation**
   - Algorithm to determine athlete order based on:
     - Declared weight (lowest first)
     - Lot number (tie-breaker)
     - Attempt history

2. **Technical Panel Enhancements**
   - Display lifting order in real-time
   - Show next athlete on deck
   - Weight change management

3. **Competition Rules**
   - 2-minute clock between attempts
   - Weight increase rules (minimum 1kg)
   - Failed attempt handling in lifting order

## 📋 Testing Checklist

- [ ] Database migration applied successfully
- [ ] Athletes table has new columns
- [ ] Backend restartedwithout errors
- [ ] Frontend built successfully
- [ ] Can complete weigh-in with all three fields
- [ ] Lot numbers assign randomly
- [ ] Weigh-in data displays correctly
- [ ] Can edit/clear weigh-in data

## 🎯 Key Benefits

1. **IWF Compliance** - Follows official competition procedures
2. **Fair Competition** - Lot numbers ensure fair tie-breaking
3. **Complete Data** - All information needed for proper lifting order
4. **Professional** - Matches real competition flow
5. **Flexible** - Can edit/clear data if needed
