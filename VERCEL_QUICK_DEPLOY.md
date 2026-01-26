# Quick Vercel Deployment - 3 Apps

**Time to Deploy:** 30 minutes  
**Apps:** Admin Panel, Display Screen, Scoreboard

---

## 🚀 Quick Start (3 Steps)

### Step 1: Deploy Backend First ⚡

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import `TheAkila/WL-System` from GitHub
3. **Configure:**
   - Project Name: `wl-system-backend` (⚠️ Must start with letter, only letters/digits/underscores)
   - Root Directory: `apps/backend`
   - Framework: Other
4. **Add Environment Variables:**
   - Scroll down to find "Environment Variables" section
   - Click "Add" or the input fields
   - Add each variable one by one:
     ```
     Key: NODE_ENV          Value: production
     Key: SUPABASE_URL      Value: https://axhbgtkdvghjxtrcvbkc.supabase.co
     Key: SUPABASE_KEY      Value: <paste your service role key>
     Key: PORT              Value: 5000
     ```
   - **Where to get SUPABASE_KEY:**
     1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
     2. Select your project
     3. Click Settings (gear icon) → API
     4. Copy the `service_role` key (⚠️ Keep this secret!)
5. Deploy → **Copy the URL** (e.g., `https://wl-system-backend.vercel.app`)

---

### Step 2: Deploy 3 Frontend Apps 📱

Do this 3 times (Admin, Display, Scoreboard):

#### A. Admin Panel
1. New Project → Import same repo
2. **Project Name:** `wl-system-admin` (start with letter, no spaces)
3. Root Directory: `apps/admin-panel`
4. Framework: Vite
5. **Add Environment Variables** (in Environment Variables section):
   ```
   Key: VITE_API_URL          Value: https://wl-system-backend.vercel.app/api
   Key: VITE_SOCKET_URL       Value: https://wl-system-backend.vercel.app
   Key: VITE_SUPABASE_URL     Value: https://axhbgtkdvghjxtrcvbkc.supabase.co
   Key: VITE_SUPABASE_ANON_KEY Value: <paste anon key from Supabase>
   ```
   - Replace `wl-system-backend` with your actual backend URL from Step 1
   - **Get ANON_KEY:** Supabase Dashboard → Settings → API → `anon` key (public, safe to use)
6. Deploy

#### B. Display Screen
1. New Project → Import same repo
2. **Project Name:** `wl-system-display`
3. Root Directory: `apps/display-screen`
4. Framework: Vite
5. Same environment variables as Admin
6. Deploy

#### C. Scoreboard
1. New Project → Import same repo
2. **Project Name:** `wl-system-scoreboard`
3. Root Directory: `apps/scoreboard`
4. Framework: Vite
5. Same environment variables as Admin
6. Deploy

---

### Step 3: Test Everything ✅

Visit each URL:
- Admin: `https://wl-admin-xyz.vercel.app`
- Display: `https://wl-display-xyz.vercel.app`
- Scoreboard: `https://wl-scoreboard-xyz.vercel.app`

Test login, create session, verify real-time updates work.

---

## 📋 Environment Variables Cheat Sheet

### Backend
```bash
NODE_ENV=production
SUPABASE_URL=https://axhbgtkdvghjxtrcvbkc.supabase.co
SUPABASE_KEY=<get from Supabase Dashboard → Settings → API → service_role>
PORT=5000
```

### All Frontend Apps (Admin, Display, Scoreboard)
```bash
VITE_API_URL=<your-backend-url>/api
VITE_SOCKET_URL=<your-backend-url>
VITE_SUPABASE_URL=https://axhbgtkdvghjxtrcvbkc.supabase.co
VITE_SUPABASE_ANON_KEY=<get from Supabase Dashboard → Settings → API → anon>
```

⚠️ Replace `<your-backend-url>` with actual backend URL from Step 1

---

## 🔧 Using Vercel CLI (Faster)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy each app
cd apps/backend && vercel --prod
cd apps/admin-panel && vercel --prod
cd apps/display-screen && vercel --prod
cd apps/scoreboard && vercel --prod
```

Set environment variables when prompted.

---

## 🐛 Common Issues

### "Cannot find module"
- Solution: Check package.json has all dependencies
- Run `npm install` locally first

### "CORS error"
- Solution: Add frontend URLs to backend CORS config
- Update `SOCKET_IO_CORS_ORIGIN` in backend env vars

### "API calls failing"
- Solution: Verify `VITE_API_URL` is correct
- Should end with `/api`

### Routes returning 404
- Solution: vercel.json should have catch-all route (already configured)

---

## 📱 After Deployment

Share these URLs:
- **Organizers:** Admin Panel URL
- **Venue Staff:** Display Screen URL
- **Spectators:** Scoreboard URL (create QR code)

---

## 🔄 Auto-Deploy on Push

Vercel auto-deploys when you push to GitHub:

```bash
git add .
git commit -m "Update"
git push origin main
```

Vercel rebuilds all 4 apps automatically!

---

**That's it!** 🎉 Your system is now live on Vercel.

For detailed guide, see `VERCEL_DEPLOYMENT_GUIDE.md`
