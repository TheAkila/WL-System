# Vercel Environment Variables Setup - Manual Guide

## Quick Setup Instructions

### Step 1: Open Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Click on your "wl-system-backend" project
3. Go to **Settings** → **Environment Variables**

### Step 2: Add Backend Environment Variables

Copy and paste these values from your `.env` file:

```
SUPABASE_URL=https://axhbgtkdvghjxtrcvbkc.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4aGJndGtkdmdoanh0cmN2YmtjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODQxNzEwMCwiZXhwIjoyMDgzOTkzMTAwfQ.I5WYN7jVvEKT6wOGgA500Dya6W5u7wiIzU8UsUEvbLs
SUPABASE_ANON_KEY=sb_publishable_xnUzm6KXwue9mOknruojcQ_HpDC2dGM
JWT_SECRET=9244ce3a59de67b469fb81934d8cebc6ec864f6a353526a4d051261ff459a0b5
JWT_EXPIRE=7d
NODE_ENV=production
SOCKET_IO_CORS_ORIGIN=https://wl-system-admin.vercel.app,https://wl-system-display.vercel.app,https://wl-system-scoreboard.vercel.app
PORT=3000
```

For each variable:
1. Click "Add New"
2. Enter the variable name (e.g., `SUPABASE_URL`)
3. Enter the value
4. Select **Production** and **Preview**
5. Click "Save"

### Step 3: After Backend is Deployed

Once backend deployment succeeds, you'll get a URL like:
```
https://wl-system-backend-xxxxxxx.vercel.app
```

### Step 4: Deploy Frontend Apps

Create new Vercel projects for:
- Admin Panel (`apps/admin-panel`)
- Display Screen (`apps/display-screen`)
- Scoreboard (`apps/scoreboard`)

For each frontend app, set these environment variables in Vercel dashboard:

```
VITE_API_URL=https://wl-system-backend-xxxxxxx.vercel.app/api
VITE_SOCKET_URL=https://wl-system-backend-xxxxxxx.vercel.app
VITE_SUPABASE_URL=https://axhbgtkdvghjxtrcvbkc.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_xnUzm6KXwue9mOknruojcQ_HpDC2dGM
```

Replace `wl-system-backend-xxxxxxx` with your actual backend URL!

## Vercel Dashboard Links

- **Backend Project**: https://vercel.com/dashboard/projects
- **Environment Variables Settings**: Project → Settings → Environment Variables
- **Deployments**: Project → Deployments
- **Logs**: Deployment → Logs

## Alternative: Using Vercel CLI

Instead of manual setup, you can use the CLI:

```bash
# In backend directory
cd apps/backend

# Add each environment variable
vercel env add SUPABASE_URL production preview
vercel env add SUPABASE_SERVICE_KEY production preview
vercel env add SUPABASE_ANON_KEY production preview
vercel env add JWT_SECRET production preview
vercel env add SOCKET_IO_CORS_ORIGIN production preview
vercel env add NODE_ENV production preview

# Deploy
vercel --prod
```

## Troubleshooting

### Error: "Environment Variable references Secret which does not exist"
**Solution**: Add environment variables via Vercel dashboard manually

### Error: "Build failed"
**Solution**: 
1. Check logs in Vercel dashboard
2. Ensure `npm run build` works locally
3. Verify all dependencies are in package.json

### API calls failing from frontend
**Solution**: 
1. Verify backend URL is correct in `VITE_API_URL`
2. Check CORS settings in backend
3. Ensure `SOCKET_IO_CORS_ORIGIN` includes frontend domains

## Deployment Order

1. ✅ Deploy Backend first
2. 📝 Get backend URL from Vercel
3. 🚀 Deploy Admin Panel with backend URL
4. 🚀 Deploy Display Screen with backend URL
5. 🚀 Deploy Scoreboard with backend URL

## Getting Backend URL

After deploying backend to Vercel:
1. Go to Backend Project on Vercel Dashboard
2. Look for the Production URL (usually at the top right)
3. Copy this URL and use it for `VITE_API_URL` in frontend apps
