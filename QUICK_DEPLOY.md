# Quick Deployment Guide

## TL;DR - Deploy in 5 Minutes

### Prerequisites
- Vercel account (free): https://vercel.com/signup
- Supabase project: https://supabase.com

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
vercel login
```

### Step 2: Deploy Backend
```bash
cd "/Users/akilanishan/Documents/lifting social/WL-System/apps/backend"
vercel --prod
```

**Important**: Copy the deployment URL!

### Step 3: Set Backend Environment Variables

Go to Vercel Dashboard → Your Backend Project → Settings → Environment Variables

Add these (for Production):
```
SUPABASE_URL=https://axhbgtkdvghjxtrcvbkc.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4aGJndGtkdmdoanh0cmN2YmtjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODQxNzEwMCwiZXhwIjoyMDgzOTkzMTAwfQ.I5WYN7jVvEKT6wOGgA500Dya6W5u7wiIzU8UsUEvbLs
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4aGJndGtkdmdoanh0cmN2YmtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0MTcxMDAsImV4cCI6MjA4Mzk5MzEwMH0.QOasxtbJNFtMhz_hlBukrsNi4kWSqIhMVKnEvXZcQuI
JWT_SECRET=c5600a907a1941c71e9d5565fd1b30bdeb7703736f4e8268393235ba6bafd888
JWT_EXPIRE=7d
NODE_ENV=production
SOCKET_IO_CORS_ORIGIN=https://YOUR_ADMIN_URL
```

Redeploy to apply:
```bash
vercel --prod
```

### Step 4: Update Admin Panel Config

Edit: `apps/admin-panel/.env.production`

```env
VITE_API_URL=https://YOUR_BACKEND_URL/api
VITE_SOCKET_URL=https://YOUR_BACKEND_URL
VITE_SUPABASE_URL=https://axhbgtkdvghjxtrcvbkc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4aGJndGtkdmdoanh0cmN2YmtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0MTcxMDAsImV4cCI6MjA4Mzk5MzEwMH0.QOasxtbJNFtMhz_hlBukrsNi4kWSqIhMVKnEvXZcQuI
```

### Step 5: Deploy Admin Panel
```bash
cd "/Users/akilanishan/Documents/lifting social/WL-System/apps/admin-panel"
vercel --prod
```

Copy the admin panel URL!

### Step 6: Update CORS

In Vercel Dashboard → Backend → Environment Variables:

Update:
```
SOCKET_IO_CORS_ORIGIN=https://YOUR_ADMIN_URL,https://YOUR_FRONTEND_URL
```

Redeploy:
```bash
cd "/Users/akilanishan/Documents/lifting social/WL-System/apps/backend"
vercel --prod
```

### Step 7: Test

Visit your admin panel URL and login!

---

## Using the Deploy Script

Even easier - use the automated script:

```bash
cd "/Users/akilanishan/Documents/lifting social/WL-System"
./deploy-production.sh
```

This deploys both services automatically!

---

## Troubleshooting

**Backend error?**
- Check: `vercel logs`
- Verify environment variables are set

**Admin can't connect?**
- Check `.env.production` has correct backend URL
- Verify CORS settings

**Need help?**
- Check: `DEPLOYMENT_COMPLETE_GUIDE.md`
- Or: `PRE_DEPLOYMENT_CHECKLIST.md`

---

**Estimated Time**: 5-10 minutes  
**Difficulty**: Easy ✅
