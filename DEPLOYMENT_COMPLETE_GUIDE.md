# Complete Deployment Guide - WL System

## Overview
This guide covers deploying both the **Admin Panel** (Vite/React) and **Backend** (Express.js) to Vercel.

## Current Deployment URLs
- **Backend**: https://backend-xi-five-83.vercel.app
- **Admin Panel**: (To be deployed)

---

## Part 1: Backend Deployment (Vercel)

### Step 1: Verify Backend Configuration

#### 1.1 Check `vercel.json` is properly configured
Location: `/WL-System/apps/backend/vercel.json`

Already configured ✅

#### 1.2 Verify Serverless Entry Point
Location: `/WL-System/apps/backend/api/index.js`

Already configured ✅

### Step 2: Deploy Backend to Vercel

```bash
cd "/Users/akilanishan/Documents/lifting social/WL-System/apps/backend"

# Login to Vercel (if not already)
npx vercel login

# Deploy to production
npx vercel --prod
```

#### Environment Variables to Set in Vercel Dashboard:
Navigate to: Project Settings → Environment Variables

```env
# Supabase
SUPABASE_URL=https://axhbgtkdvghjxtrcvbkc.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4aGJndGtkdmdoanh0cmN2YmtjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODQxNzEwMCwiZXhwIjoyMDgzOTkzMTAwfQ.I5WYN7jVvEKT6wOGgA500Dya6W5u7wiIzU8UsUEvbLs
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4aGJndGtkdmdoanh0cmN2YmtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0MTcxMDAsImV4cCI6MjA4Mzk5MzEwMH0.QOasxtbJNFtMhz_hlBukrsNi4kWSqIhMVKnEvXZcQuI

# JWT
JWT_SECRET=c5600a907a1941c71e9d5565fd1b30bdeb7703736f4e8268393235ba6bafd888
JWT_EXPIRE=7d

# Server
NODE_ENV=production
PORT=5000

# CORS Origins (comma-separated)
SOCKET_IO_CORS_ORIGIN=https://your-admin-panel.vercel.app,https://your-frontend.vercel.app

# Email (if using)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=theliftingsocial@gmail.com
EMAIL_PASS=vzakuqzdtpvabrnz
```

### Step 3: Test Backend Deployment

```bash
# Test health endpoint
curl https://your-backend-url.vercel.app/api/health

# Should return: {"status":"ok"}
```

---

## Part 2: Admin Panel Deployment (Vercel)

### Step 1: Update Production Environment File

Location: `/WL-System/apps/admin-panel/.env.production`

**Already configured** with your backend URL ✅

### Step 2: Build and Test Locally

```bash
cd "/Users/akilanishan/Documents/lifting social/WL-System/apps/admin-panel"

# Build production version
npm run build

# Preview production build locally
npx vite preview --port 4173
```

Open http://localhost:4173 to test the production build.

### Step 3: Deploy Admin Panel to Vercel

```bash
cd "/Users/akilanishan/Documents/lifting social/WL-System/apps/admin-panel"

# Deploy to production
npx vercel --prod
```

#### During Deployment:
1. Vercel will ask: "Set up and deploy?" → Yes
2. "Which scope?" → Select your account
3. "Link to existing project?" → No (first time) or Yes (updating)
4. "What's your project's name?" → wl-admin-panel
5. "In which directory is your code located?" → ./
6. Vercel will auto-detect Vite and use the correct build settings

### Step 4: Configure Environment Variables in Vercel

Navigate to: Vercel Dashboard → Your Admin Panel Project → Settings → Environment Variables

Add the following:

```env
VITE_API_URL=https://your-backend-url.vercel.app/api
VITE_SOCKET_URL=https://your-backend-url.vercel.app
VITE_SUPABASE_URL=https://axhbgtkdvghjxtrcvbkc.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_xnUzm6KXwue9mOknruojcQ_HpDC2dGM
```

**Important**: Set these for **Production** environment.

### Step 5: Redeploy After Adding Environment Variables

```bash
# Trigger a new deployment to apply environment variables
npx vercel --prod
```

---

## Part 3: Post-Deployment Configuration

### 3.1 Update Backend CORS

Once you have your admin panel URL, update backend environment variables:

```env
SOCKET_IO_CORS_ORIGIN=https://your-admin-panel.vercel.app,https://your-frontend.vercel.app
```

Redeploy backend:
```bash
cd "/Users/akilanishan/Documents/lifting social/WL-System/apps/backend"
npx vercel --prod
```

### 3.2 Update Supabase Redirect URLs

In Supabase Dashboard:
1. Go to Authentication → URL Configuration
2. Add to **Redirect URLs**:
   - `https://your-admin-panel.vercel.app/*`
   - `https://your-frontend.vercel.app/*`

### 3.3 Test Full Integration

1. **Visit Admin Panel**: https://your-admin-panel.vercel.app
2. **Login**: Use your admin credentials
3. **Test Features**:
   - View registrations
   - Create sessions
   - View athletes
   - Check real-time updates

---

## Quick Deployment Commands

### Deploy Both Services

```bash
# Terminal 1: Deploy Backend
cd "/Users/akilanishan/Documents/lifting social/WL-System/apps/backend"
npx vercel --prod

# Terminal 2: Deploy Admin Panel
cd "/Users/akilanishan/Documents/lifting social/WL-System/apps/admin-panel"
npx vercel --prod
```

### Redeploy After Code Changes

```bash
# Backend
cd apps/backend && npx vercel --prod

# Admin Panel
cd apps/admin-panel && npx vercel --prod
```

---

## Troubleshooting

### Issue: 500 Error on Backend

**Solution**:
1. Check Vercel logs: `npx vercel logs`
2. Verify all environment variables are set
3. Check Supabase credentials are correct

### Issue: Admin Panel Shows API Connection Error

**Solution**:
1. Verify `VITE_API_URL` is correct in Vercel dashboard
2. Check backend is deployed and running
3. Verify CORS settings in backend allow your admin panel domain

### Issue: Socket.IO Not Connecting

**Solution**:
1. Ensure `VITE_SOCKET_URL` matches backend URL
2. Update `SOCKET_IO_CORS_ORIGIN` in backend to include admin panel URL
3. Socket.IO may not work on Vercel serverless (consider alternative hosting for real-time features)

### Issue: 404 on Admin Panel Routes

**Solution**:
Already configured in `vercel.json` with SPA rewrites ✅

---

## Alternative Deployment Options

### Docker Deployment (Full Stack)

Both services have Dockerfiles for container deployment:

```bash
# Build Admin Panel
cd apps/admin-panel
docker build -t wl-admin-panel .

# Build Backend
cd apps/backend
docker build -t wl-backend .

# Run with docker-compose (create docker-compose.yml first)
docker-compose up -d
```

### Railway Deployment (Recommended for Socket.IO)

Railway supports long-running processes better than Vercel serverless:

1. Visit railway.app
2. Connect GitHub repository
3. Deploy backend with environment variables
4. Get Railway URL and update admin panel

---

## Monitoring

### Vercel Dashboard
- View deployment logs
- Check function invocations
- Monitor bandwidth usage

### Health Check Endpoints

```bash
# Backend health
curl https://your-backend.vercel.app/api/health

# Response: {"status":"ok","timestamp":"..."}
```

---

## Security Checklist

- [ ] All environment variables set in Vercel (not in code)
- [ ] JWT_SECRET is strong (minimum 32 characters)
- [ ] Supabase service key is kept secret
- [ ] CORS origins properly configured
- [ ] Supabase RLS policies are active
- [ ] Admin panel requires authentication
- [ ] Rate limiting is enabled on backend

---

## Next Steps After Deployment

1. **Test all features** on production
2. **Set up custom domains** (optional)
3. **Configure monitoring** (Sentry, LogRocket)
4. **Set up CI/CD** with GitHub Actions
5. **Create backup strategy** for database
6. **Document API endpoints** for frontend team
7. **Load test** the backend

---

## Support

If issues persist:
1. Check Vercel logs: `npx vercel logs <deployment-url>`
2. Check browser console for errors
3. Verify Supabase connection in dashboard
4. Test API endpoints with Postman/curl

---

**Deployment Status**: Ready to deploy ✅
**Estimated Time**: 15-20 minutes for full deployment
