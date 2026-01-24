# 🚀 Quick Start: IWF Implementation

## ⚡ 3 Steps to Complete Setup

### 1️⃣ Apply Database Migration (2 minutes)
```
1. Open: https://supabase.com/dashboard
2. Select your project
3. Click: SQL Editor → New Query
4. Copy/paste: database/migrations/APPLY_THIS_IN_SUPABASE.sql
5. Click: Run (or Cmd+Enter)
6. ✅ Should see 4 rows in result
```

### 2️⃣ Restart Backend
```bash
cd apps/backend
pkill -f "node src/server.js"
npm start
```

### 3️⃣ Test Weigh-In
```
1. Open: http://localhost:3000/weigh-in
2. Select session
3. Enter: Body weight (70.50), Opening snatch (100), Opening C&J (120)
4. Click: Complete Weigh-In
5. Click: Assign Lot Numbers
6. ✅ Done!
```

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `database/migrations/APPLY_THIS_IN_SUPABASE.sql` | ⭐ **RUN THIS FIRST** |
| `apps/admin-panel/src/pages/WeighIn.jsx` | New weigh-in component |
| `IWF_IMPLEMENTATION_COMPLETE.md` | Full documentation |

---

## ✅ What's Working Now

✅ Opening attempt declarations (snatch + C&J)  
✅ Lot number assignment (random, tie-breaking)  
✅ Body weight tracking  
✅ Weigh-in completion timestamp  
✅ Edit/clear functionality  
✅ Visual progress tracking  

---

## 🎯 What's Next (Future)

⏳ Lifting order algorithm  
⏳ Attempt weight changes  
⏳ Clock management (1-minute countdown)  

---

## 🆘 Troubleshooting

**Problem**: Can't apply migration  
**Solution**: Use Supabase SQL Editor (not psql)

**Problem**: Frontend errors  
**Solution**: Rebuild: `cd apps/admin-panel && npm run build`

**Problem**: Backend not responding  
**Solution**: Restart: `pkill -f "node src/server.js" && cd apps/backend && npm start`

**Problem**: Image uploads timing out  
**Solution**: Already fixed! Test and report results.

---

## 📊 New Database Fields

```sql
athletes table:
  - opening_snatch       INTEGER     (first snatch attempt)
  - opening_clean_jerk   INTEGER     (first C&J attempt)
  - lot_number           INTEGER     (tie-breaker, random 1-N)
  - weigh_in_completed_at TIMESTAMP  (when weigh-in done)
```

---

**That's it! Apply the SQL and you're ready to go! 🏋️‍♀️🏋️‍♂️**
