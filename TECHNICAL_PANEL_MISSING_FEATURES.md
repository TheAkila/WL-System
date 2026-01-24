# Technical Panel - Missing UI Features Analysis

## Overview
After analyzing the technical panel UI against the backend implementation and database schema, the following features are **already implemented in the backend/database but NOT yet displayed in the UI**:

---

## 🔴 MISSING UI FEATURES (High Priority)

### 1. **Referee Decisions (3 Referees)**
**Status**: Backend ✅ | UI ❌

**Database Fields** (`attempts` table):
- `referee_left` (good/no-lift)
- `referee_center` (good/no-lift)
- `referee_right` (good/no-lift)

**Current UI**: Only shows `result` (pending/good/no-lift) - which is the final combined decision

**What's Missing**:
- Individual referee decision buttons/indicators for each referee (left, center, right)
- Visual display of all 3 referee decisions
- Ability to record individual referee votes
- Display of the majority decision logic

**Implementation Location**: Should be added to `AttemptCell.jsx` component

**Use Case**: Technical officials need to see which referee voted good/no-lift to understand the decision-making process

---

### 2. **Sinclair Total (Normalized Score)**
**Status**: Backend ✅ | UI ❌

**Database Field** (`athletes` table):
- `sinclair_total` (DECIMAL 8,2)

**Current UI**: Shows raw totals only

**What's Missing**:
- Display of Sinclair coefficient-adjusted total
- Column for Sinclair ranking
- Useful for comparing athletes across different weight categories

**Implementation Location**: Should be added to `SessionSheet.jsx` table columns

**Use Case**: International competitions use Sinclair total to rank athletes from different weight categories

---

### 3. **Medal Assignment (Gold/Silver/Bronze)**
**Status**: Backend ✅ | UI ❌

**Database Fields** (`athletes` table):
- `medal` (gold/silver/bronze/NULL)
- `medal_manual_override` (boolean)
- `total_completed_at` (timestamp)

**Current UI**: No medal display

**What's Missing**:
- Display of medal status (🥇🥈🥉) for top 3 athletes
- Manual override button to assign/change medals
- Visual highlighting of medalists in the sheet
- Medal ceremony ranking view

**Implementation Location**: Should be added to `SessionSheet.jsx` table and possibly new medal assignment modal

**Use Case**: Medal assignment at end of competition, with ability for manual override by officials

---

### 4. **Weight Category Display**
**Status**: Backend ✅ | UI ❌

**Database Field** (`athletes` table):
- `weight_category`

**Current UI**: Weight category is stored and used but not displayed in the sheet

**What's Missing**:
- Display weight category in a column
- Filter/sort by weight category
- Color coding different categories

**Implementation Location**: Add column to `SessionSheet.jsx` or create collapsible sections by weight category

**Use Case**: Clear organization of athletes by their competition category

---

### 5. **Gender Display**
**Status**: Backend ✅ | UI ❌

**Database Field** (`athletes` table):
- `gender` (male/female)

**Current UI**: Not displayed in the sheet

**What's Missing**:
- Display gender (M/F or male/female badge)
- Filter by gender
- Separate sections for men/women competitions

**Implementation Location**: Add column to `SessionSheet.jsx`

---

### 6. **Birth Date Display**
**Status**: Backend ✅ | UI ❌

**Database Field** (`athletes` table):
- `birth_date`

**Current UI**: Not displayed

**What's Missing**:
- Display athlete age or birth date
- Useful for junior/senior category tracking

**Implementation Location**: Add column to `SessionSheet.jsx`

---

### 7. **Lot Number (Drawing Order)**
**Status**: Backend ✅ (schema includes `lot_number`) | UI ❌

**Database Field** (`athletes` table):
- `lot_number` (athlete's drawing position)

**Current UI**: Not displayed

**What's Missing**:
- Display lot number in the sheet
- Track athlete's starting position

**Implementation Location**: Add column to `SessionSheet.jsx`

---

### 8. **Disqualification Status with Details**
**Status**: Backend ✅ | UI ⚠️ (Partial)

**Database Field** (`athletes` table):
- `is_dq` (boolean)

**Current UI**: Shows DQ toggle button but lacks detail

**What's Missing**:
- Reason for disqualification (e.g., "Failed to make opening weight", "3 misses in snatch")
- Display of DQ timestamp
- Visual styling to clearly mark DQ athletes
- DQ reason notes field

**Implementation Location**: Enhance the DQ toggle with modal/popover

---

## 🟡 PARTIALLY IMPLEMENTED FEATURES

### 1. **Best Snatch/Clean & Jerk Display**
**Status**: Backend ✅ (calculated) | UI ✅ (displayed)

**Current State**: Shows best lifts calculated from attempts

**Could Enhance**:
- Add styling to highlight the best attempt
- Show weight progression visually

---

### 2. **Ranking System**
**Status**: Backend ✅ (calculated by triggers) | UI ✅ (displayed)

**Current State**: Shows rank based on total

**Could Enhance**:
- Show Sinclair ranking separately
- Tie-breaker logic display (bodyweight used for ties)
- Live ranking updates as weights are entered

---

## 🟢 FULLY IMPLEMENTED FEATURES

✅ Attempt cells (weight + good/no-lift)
✅ Edit count limiting (3 tries max)
✅ Progressive weight validation
✅ Opening attempts from weigh-in
✅ Real-time socket updates
✅ Print/download functionality
✅ DQ toggle
✅ Search/filter athletes
✅ Start number ordering
✅ Responsive layout
✅ Collapsible sidebar

---

## 📋 RECOMMENDED IMPLEMENTATION ORDER

1. **High Priority** (Core Competition Features):
   - Referee Decisions (3 referees) - Essential for official judging
   - Medal Assignment - End of competition critical feature
   - Weight Category Display - Required for accurate grouping
   
2. **Medium Priority** (Important Details):
   - Gender Display - Competition organization
   - Sinclair Total - Multi-category competitions
   - DQ reason notes - Documentation
   
3. **Low Priority** (Nice to Have):
   - Birth Date Display - Age tracking
   - Lot Number - Historical reference

---

## 🔧 Technical Notes

**Database Queries Update Needed**:
The backend's `getSessionSheet` endpoint should include:
```javascript
// Fields to add to response:
medal,
medal_manual_override,
sinclair_total,
total_completed_at,
gender,
birth_date,
weight_category,
lot_number
```

**Frontend Components to Create**:
1. `RefereeDecisionButtons.jsx` - Display 3 referee votes
2. `MedalAssignmentModal.jsx` - Medal assignment interface
3. `AttemptSheetEnhancements` - Add missing columns to table

---

## 📞 Summary

**Total Missing Features**: 8
**Fully Implemented**: 11
**Partially Implemented**: 2

The technical panel has a solid foundation with attempt tracking and basic ranking. The main gaps are in **referee voting records, medal assignment, and demographic/organizational columns**.
