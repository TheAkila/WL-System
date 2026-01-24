# Vercel Deployment Guide - WL-System

## Deployment Strategy

This monorepo contains multiple applications that need to be deployed separately on Vercel:

### Applications:
1. **Admin Panel** (`/apps/admin-panel`) - React + Vite
2. **Display Screen** (`/apps/display-screen`) - React + Vite  
3. **Scoreboard** (`/apps/scoreboard`) - React + Vite
4. **Backend API** (`/apps/backend`) - Node.js/Express

---

## Step 1: Prepare for Deployment

### 1.1 Create Vercel Account
- Go to [vercel.com](https://vercel.com)
- Sign up with GitHub account (recommended for easy integration)

### 1.2 Environment Variables Setup

Before deploying, prepare these environment variables for **each application**:

#### Admin Panel Environment Variables:
```
VITE_API_URL=https://wl-system-backend.vercel.app/api
VITE_SOCKET_URL=https://wl-system-backend.vercel.app
VITE_SUPABASE_URL=https://axhbgtkdvghjxtrcvbkc.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_xnUzm6KXwue9mOknruojcQ_HpDC2dGM
```

#### Backend Environment Variables:
```
NODE_ENV=production
PORT=3000
SUPABASE_URL=https://axhbgtkdvghjxtrcvbkc.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_ANON_KEY=sb_publishable_xnUzm6KXwue9mOknruojcQ_HpDC2dGM
JWT_SECRET=9244ce3a59de67b469fb81934d8cebc6ec864f6a353526a4d051261ff459a0b5
JWT_EXPIRE=7d
SOCKET_IO_CORS_ORIGIN=https://wl-system-admin.vercel.app,https://wl-system-display.vercel.app,https://wl-system-scoreboard.vercel.app
```

---

## Step 2: Deploy Backend (API)

### 2.1 Create Backend Vercel Project

```bash
# Option A: Using Vercel CLI
cd apps/backend
npm install -g vercel
vercel

# Follow prompts to deploy
```

### 2.2 Configure Backend Deployment

The backend needs to be deployed as a serverless function. Create `vercel.json` in `/apps/backend`:

```json
{
  "version": 2,
  "env": {
    "NODE_ENV": "production",
    "SUPABASE_URL": "@supabase_url",
    "SUPABASE_SERVICE_KEY": "@supabase_service_key",
    "JWT_SECRET": "@jwt_secret",
    "SOCKET_IO_CORS_ORIGIN": "@socket_io_cors_origin"
  },
  "builds": [
    {
      "src": "src/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/server.js"
    }
  ]
}
```

### 2.3 Add Vercel Build Script

Update `/apps/backend/package.json`:

```json
{
  "scripts": {
    "build": "echo 'Backend ready for deployment'",
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  }
}
```

---

## Step 3: Deploy Frontend Apps (Admin Panel, Display, Scoreboard)

### 3.1 Admin Panel

```bash
cd apps/admin-panel

# Build
npm run build

# Deploy using Vercel CLI
vercel --prod
```

Or connect via GitHub:
1. Push to GitHub
2. Go to Vercel dashboard
3. Click "New Project"
4. Import your GitHub repository
5. Select "admin-panel" as root directory
6. Add environment variables (from Step 1)
7. Deploy

### 3.2 Display Screen & Scoreboard

Repeat the same process for:
- `apps/display-screen`
- `apps/scoreboard`

Each should have their own Vercel project.

---

## Step 4: Environment Variables in Vercel

For **each** Vercel project:

1. Go to Project Settings → Environment Variables
2. Add all required variables (see Step 1)
3. Redeploy if already deployed

---

## Step 5: Configure CORS & API Routes

### 5.1 Update Backend CORS

The backend's `SOCKET_IO_CORS_ORIGIN` environment variable should include all frontend URLs:

```
https://wl-system-admin.vercel.app,https://wl-system-display.vercel.app,https://wl-system-scoreboard.vercel.app
```

### 5.2 Update Frontend API URLs

All frontend apps should use the deployed backend URL:

```
VITE_API_URL=https://your-backend-domain.vercel.app/api
VITE_SOCKET_URL=https://your-backend-domain.vercel.app
```

---

## Step 6: Custom Domains (Optional)

### 6.1 Add Custom Domain

In each Vercel project:
1. Settings → Domains
2. Add your custom domain
3. Configure DNS records

Example setup:
- `admin.wl-arena.com` → Admin Panel
- `display.wl-arena.com` → Display Screen
- `scoreboard.wl-arena.com` → Scoreboard
- `api.wl-arena.com` → Backend

---

## Deployment Checklist

### Before Deployment:
- [ ] All environment variables configured in Vercel
- [ ] Backend API URL updated in frontend .env files
- [ ] CORS origins configured in backend
- [ ] Supabase credentials verified and in place
- [ ] JWT secret set in backend environment

### During Deployment:
- [ ] Build succeeds for all apps
- [ ] No errors in Vercel logs
- [ ] Deployments trigger without issues

### After Deployment:
- [ ] Test login on admin panel
- [ ] Verify API calls succeed (Network tab)
- [ ] Check WebSocket connection for real-time features
- [ ] Test all CRUD operations (Create, Read, Update, Delete)
- [ ] Verify dark mode persists
- [ ] Test on mobile responsive design

---

## Troubleshooting

### Issue: API calls returning 404
**Solution**: Check `VITE_API_URL` environment variable matches deployed backend URL

### Issue: WebSocket not connecting
**Solution**: Verify `SOCKET_IO_CORS_ORIGIN` includes your frontend domain

### Issue: Build failing
**Solution**: 
1. Check `npm run build` works locally
2. Verify all dependencies are in package.json (not just package-lock.json)
3. Check build logs in Vercel dashboard

### Issue: Environment variables not loading
**Solution**: 
1. Redeploy after adding environment variables
2. Verify variable names match exactly (case-sensitive)
3. Use `@variable_name` syntax in vercel.json to reference secrets

---

## Deployment Commands Quick Reference

```bash
# Install Vercel CLI globally
npm install -g vercel

# Deploy backend
cd apps/backend && vercel --prod

# Deploy admin panel
cd apps/admin-panel && vercel --prod

# Deploy display screen
cd apps/display-screen && vercel --prod

# Deploy scoreboard
cd apps/scoreboard && vercel --prod

# View deployment logs
vercel logs [deployment-url]

# Redeploy latest commit
vercel --prod
```

---

## Post-Deployment

### 1. Monitor Performance
- Check Vercel Analytics
- Monitor API response times
- Set up alerts for errors

### 2. Enable Auto-Deployments
- Connect to GitHub branch (main)
- Set up automatic deployments on push

### 3. Setup CI/CD (Optional)
- Add GitHub Actions for tests before deploy
- Configure preview deployments for pull requests

### 4. Database Backups
- Configure Supabase backups
- Monitor database usage and costs

---

## Support & Documentation

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.io/docs
- **Vite Docs**: https://vitejs.dev
- **Socket.io Docs**: https://socket.io/docs

---

## Next Steps

1. Create Vercel account
2. Prepare all environment variables
3. Deploy backend first
4. Update frontend environment variables with backend URL
5. Deploy all frontend applications
6. Test each feature thoroughly
7. Setup custom domains if desired
8. Enable auto-deployments from GitHub
