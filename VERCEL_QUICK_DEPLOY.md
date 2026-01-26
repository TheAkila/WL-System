# Quick Vercel Deployment - 3 Apps

**Time to Deploy:** 30 minutes  
**Apps:** Admin Panel, Display Screen, Scoreboard

---

## 🚀 Quick Start (3 Steps)

### Step 1: Deploy Backend First ⚡

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import `TheAkila/WL-System` from GitHub
3. **Configure:**
   - Root Directory: `apps/backend`
   - Framework: Other
4. **Add Environment Variables:**
   ```
   NODE_ENV=production
   SUPABASE_URL=https://axhbgtkdvghjxtrcvbkc.supabase.co
   SUPABASE_KEY=<your-service-role-key>
   PORT=5000
   ```
5. Deploy → **Copy the URL** (e.g., `https://wl-backend-xyz.vercel.app`)

---

### Step 2: Deploy 3 Frontend Apps 📱

Do this 3 times (Admin, Display, Scoreboard):

#### A. Admin Panel
1. New Project → Import same repo
2. Root Directory: `apps/admin-panel`
3. Framework: Vite
4. Environment Variables:
   ```
   VITE_API_URL=https://YOUR-BACKEND-URL.vercel.app/api
   VITE_SOCKET_URL=https://YOUR-BACKEND-URL.vercel.app
   VITE_SUPABASE_URL=https://axhbgtkdvghjxtrcvbkc.supabase.co
   VITE_SUPABASE_ANON_KEY=<your-anon-key>
   ```
5. Deploy

#### B. Display Screen
1. New Project → Import same repo
2. Root Directory: `apps/display-screen`
3. Framework: Vite
4. Same environment variables as Admin
5. Deploy

#### C. Scoreboard
1. New Project → Import same repo
2. Root Directory: `apps/scoreboard`
3. Framework: Vite
4. Same environment variables as Admin
5. Deploy

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
