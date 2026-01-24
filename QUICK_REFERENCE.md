# 🚀 Quick Reference - Full System Integration

## ⚡ 60-Second Setup

```bash
# Terminal 1: Backend
cd apps/backend
npm install
npm run dev
# → http://localhost:5000

# Terminal 2: Admin Panel
cd apps/admin-panel
npm run dev
# → http://localhost:3000

# Optional Terminal 3: Display Screen
cd apps/display-screen
npm run dev
# → http://localhost:3001

# Optional Terminal 4: Scoreboard
cd apps/scoreboard
npm run dev
# → http://localhost:3002
```

---

## 🔐 Test Credentials

```
Email:    admin@test.com
Password: password123

OR

Email:    tech@test.com
Password: password123
```

---

## 📋 What's Integrated

### ✅ Admin Panel (3000)
- Competitions: Create, Read, Update, Delete
- Athletes: Register, Update, Delete
- Sessions: Create, Update, Delete, Status Control
- Technical Panel: Real-time session control
- Dashboard: Statistics & quick actions

### ✅ Display Screen (3001)
- Auto-detects active sessions
- Shows current athlete & lift
- Real-time result updates
- Broadcast-ready display

### ✅ Scoreboard (3002)
- Live competition view
- Leaderboard
- Medal table
- Session results

### ✅ Backend (5000)
- RESTful API (all endpoints)
- WebSocket real-time updates
- JWT authentication
- Supabase database

---

## 🔄 Complete Workflow

### 1. Create Competition (Admin Panel)
```
Competitions → New Competition → Fill form → Create
```

### 2. Register Athletes (Admin Panel)
```
Athletes → Register Athlete → Fill form → Register
```

### 3. Create Session (Admin Panel)
```
Sessions → New Session → Select competition → Create
```

### 4. Start Competition (Technical Panel)
```
Technical Panel → Select Session → Start monitoring
```

### 5. Display Results (All Apps)
```
Admin Panel → Technical Panel (declare attempts)
Display Screen ← Real-time updates (auto)
Scoreboard ← Real-time updates (auto)
```

---

## 🔗 API Base Endpoints

```
http://localhost:5000/api/competitions
http://localhost:5000/api/athletes
http://localhost:5000/api/sessions
http://localhost:5000/api/technical/sessions/active
http://localhost:5000/api/auth/login
```

---

## 📡 WebSocket Events

**Real-time events automatically broadcast to all connected clients:**

```
attempt:created        ← New lift declared
attempt:validated      ← Lift judged (good/no-lift)
session:updated        ← Session status changed
leaderboard:updated    ← Scores updated
```

---

## ✅ Feature Checklist

### Admin Panel
- [x] Login/Authentication
- [x] Competitions CRUD
- [x] Athletes CRUD
- [x] Sessions CRUD
- [x] Technical Control
- [x] Real-time Updates
- [x] Dashboard

### Display Screen
- [x] Auto-session detection
- [x] Athlete display
- [x] Real-time updates
- [x] Result animation
- [x] Leaderboard

### Scoreboard
- [x] Live view
- [x] Leaderboard
- [x] Medals
- [x] Results

### Backend
- [x] Database connected
- [x] All APIs working
- [x] WebSocket active
- [x] Authentication
- [x] Error handling

---

## 🧪 Test This

### 5-Minute Test
1. Start backend & admin panel
2. Login: `admin@test.com` / `password123`
3. Create competition
4. Register athlete
5. Create session
6. ✅ Verify all appear in lists

### 15-Minute Full Test
1. Complete 5-minute test
2. Start display-screen app
3. Create/update data in admin panel
4. ✅ Verify real-time updates in display-screen
5. Check browser console for no errors

### 30-Minute Production Test
1. Complete 15-minute test
2. Start scoreboard app
3. Create multiple competitions/athletes/sessions
4. Test filtering & searching
5. Test edit & delete operations
6. Verify real-time sync across all apps
7. ✅ All systems working = Ready to go!

---

## 🐛 If Something Doesn't Work

### Backend not starting?
```bash
lsof -i :5000  # Check if port in use
npm install    # Ensure dependencies installed
```

### API calls failing?
- Verify backend running: `http://localhost:5000/api/competitions`
- Check `.env` file in `apps/backend`
- Check browser Network tab for actual error

### WebSocket not connecting?
- Open browser DevTools Console
- Look for Socket.IO errors
- Verify backend WebSocket enabled

### Data not showing?
- Refresh page
- Check browser Network tab
- Verify backend response with data

---

## 📚 Full Documentation

| Document | Purpose |
|----------|---------|
| TESTING_GUIDE.md | Complete testing procedures |
| FULL_INTEGRATION_COMPLETE.md | Detailed integration overview |
| SETUP_CHECKLIST.md | Initial project setup |
| SUPABASE_SETUP.md | Database configuration |

---

## 🎯 What You Can Do Now

✅ **Manage Competitions**
- Create, edit, delete competitions
- Filter and search
- Track status

✅ **Register Athletes**
- Register athletes for competitions
- Update athlete info
- Search and filter by gender

✅ **Create Sessions**
- Create lifting sessions
- Manage session status
- Control current lift type

✅ **Display Real-time Results**
- View on Display Screen
- View on Scoreboard
- All apps auto-update

✅ **Control Live Competition**
- Monitor technical panel
- Track lifting order
- Manage attempts
- Update leaderboard

---

## 🚀 Performance Notes

- Real-time updates: **WebSocket** (not polling)
- Database: **Supabase PostgreSQL**
- Authentication: **JWT tokens**
- Scalable to: **Multiple venues/sessions**

---

## 📱 App URLs

```
Admin Panel:     http://localhost:3000
Display Screen:  http://localhost:3001
Scoreboard:      http://localhost:3002
Backend API:     http://localhost:5000/api
```

---

## 💡 Pro Tips

1. **Desktop Only**: Admin panel only works on desktop (1024px+)
2. **Display Screen**: Best on large TVs/projectors
3. **Auto-refresh**: All apps auto-update via WebSocket
4. **Error Messages**: Check toast notifications for feedback
5. **Real-time**: No need to refresh pages

---

## 🎊 You're Ready!

```
✅ All systems integrated
✅ All features working
✅ Real-time sync active
✅ Documentation complete
✅ Testing procedures ready

STATUS: 🟢 PRODUCTION READY
```

---

**Questions?** Check `TESTING_GUIDE.md` or review backend logs.

**Ready to run the competition!** 🏋️

