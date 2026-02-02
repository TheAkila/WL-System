# 🔧 Admin Panel Login Fix - Complete Guide

## ❌ Problem
Unable to log into the WL-System Admin Panel because the `users` table doesn't exist in Supabase.

## ✅ Solution

### Step 1: Create Users Table in Supabase

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select project: `axhbgtkdvghjxtrcvbkc`

2. **Open SQL Editor**
   - Click **"SQL Editor"** in the left sidebar
   - Click **"New Query"** button

3. **Run the Fix Script**
   - Open the file: `FIX_ADMIN_LOGIN.sql` (in the WL-System root folder)
   - Copy the entire contents
   - Paste into Supabase SQL Editor
   - Click **"Run"** or press `Cmd + Enter` (Mac) / `Ctrl + Enter` (Windows)

4. **Verify Success**
   - You should see a table showing 3 users:
     ```
     ┌──────────┬─────────────────┬────────────────────────┬───────────┬───────────┬────────────────┐
     │ id       │ email           │ name                   │ role      │ is_active │ password_status│
     ├──────────┼─────────────────┼────────────────────────┼───────────┼───────────┼────────────────┤
     │ uuid...  │ admin@test.com  │ Admin User             │ admin     │ true      │ ✓ Has password │
     │ uuid...  │ ref@test.com    │ Referee                │ referee   │ true      │ ✓ Has password │
     │ uuid...  │ tech@test.com   │ Technical Official     │ technical │ true      │ ✓ Has password │
     └──────────┴─────────────────┴────────────────────────┴───────────┴───────────┴────────────────┘
     ```

### Step 2: Start the Backend (if not running)

```bash
cd "/Users/akilanishan/Documents/lifting social/WL-System/apps/backend"
npm run dev
```

**Expected output:**
```
🚀 Server running on port 5001
📡 Socket.IO server ready
🌍 Environment: development
```

### Step 3: Start the Admin Panel (if not running)

```bash
cd "/Users/akilanishan/Documents/lifting social/WL-System/apps/admin-panel"
npm run dev
```

**Expected output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
```

### Step 4: Login to Admin Panel

1. Open browser: http://localhost:3000
2. Use these credentials:

**Admin Account:**
- Email: `admin@test.com`
- Password: `password123`

**Technical Official Account:**
- Email: `tech@test.com`
- Password: `password123`

**Referee Account:**
- Email: `ref@test.com`
- Password: `password123`

---

## 🔍 Troubleshooting

### Issue: "Invalid credentials" error

**Check 1: Backend is running**
```bash
curl http://localhost:5001/
```
Should return: `{"message":"Admin Backend is running","version":"1.0.0"}`

**Check 2: Test login endpoint**
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password123"}'
```

Should return a JSON with `"success":true` and a token.

**Check 3: Verify users exist in database**
Run this in Supabase SQL Editor:
```sql
SELECT id, email, name, role, is_active FROM users;
```

### Issue: Backend not starting

**Check environment variables:**
```bash
cd "/Users/akilanishan/Documents/lifting social/WL-System/apps/backend"
cat .env
```

Required variables:
- `SUPABASE_URL=https://axhbgtkdvghjxtrcvbkc.supabase.co`
- `SUPABASE_SERVICE_KEY=...` (should be present)
- `JWT_SECRET=...` (should be present)
- `PORT=5001`

### Issue: Admin Panel can't connect to backend

**Check admin panel .env:**
```bash
cd "/Users/akilanishan/Documents/lifting social/WL-System/apps/admin-panel"
cat .env
```

Should have:
```
VITE_API_URL=http://localhost:5001/api
VITE_SOCKET_URL=http://localhost:5001
```

### Issue: CORS errors in browser console

The backend is configured to allow these origins:
- `http://localhost:3000` (admin panel)
- `http://localhost:3001` (frontend)
- `http://localhost:3002` (other)

Check `SOCKET_IO_CORS_ORIGIN` in backend `.env` file.

---

## 📋 Quick Test Commands

### Test Backend Health
```bash
curl http://localhost:5001/
```

### Test Login
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password123"}'
```

### Check Running Processes
```bash
# Check backend
lsof -ti:5001

# Check admin panel
lsof -ti:3000
```

---

## 🎯 System Architecture

```
┌─────────────────────────────────────────┐
│       SUPABASE DATABASE                  │
│  https://axhbgtkdvghjxtrcvbkc.supabase.co│
│                                          │
│  Tables:                                 │
│  - users (auth)                          │
│  - competitions                          │
│  - sessions                              │
│  - athletes                              │
│  - attempts                              │
└──────────────┬──────────────────────────┘
               │
       ┌───────▼────────┐
       │  WL Backend    │
       │  Port: 5001    │
       │                │
       │ • REST API     │
       │ • Socket.IO    │
       │ • JWT Auth     │
       └───────┬────────┘
               │
       ┌───────▼────────┐
       │  Admin Panel   │
       │  Port: 3000    │
       │                │
       │ • React/Vite   │
       │ • Zustand      │
       └────────────────┘
```

---

## 🚀 Complete Startup Sequence

1. **Database Setup** (one-time)
   - Run `FIX_ADMIN_LOGIN.sql` in Supabase SQL Editor

2. **Start Backend** (Terminal 1)
   ```bash
   cd WL-System/apps/backend
   npm run dev
   ```
   Wait for: "🚀 Server running on port 5001"

3. **Start Admin Panel** (Terminal 2)
   ```bash
   cd WL-System/apps/admin-panel
   npm run dev
   ```
   Wait for: "Local: http://localhost:3000/"

4. **Login**
   - Browser: http://localhost:3000
   - Email: admin@test.com
   - Password: password123

---

## 📝 Notes

- **Password**: All default users use `password123` (change in production!)
- **Ports**: Backend runs on 5001, Admin Panel on 3000
- **Database**: Shared Supabase instance with lifting-social systems
- **JWT Tokens**: Valid for 7 days by default
- **Roles**: `admin` has full access, `technical` can manage competitions, `referee` limited access

---

## 🔐 Security Considerations

For production deployment:
1. Change all default passwords
2. Use strong, unique passwords
3. Enable 2FA for admin accounts
4. Rotate JWT secrets regularly
5. Use HTTPS for all connections
6. Set up proper CORS restrictions
7. Enable rate limiting
8. Implement password reset functionality
