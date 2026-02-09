# Pre-Deployment Checklist

## Before Deploying - Complete This Checklist

### 1. Environment Variables Ready ✓

#### Backend Environment Variables (Set in Vercel Dashboard)
- [ ] `SUPABASE_URL` - Your Supabase project URL
- [ ] `SUPABASE_SERVICE_KEY` - Service role key (SECRET - keep safe!)
- [ ] `SUPABASE_ANON_KEY` - Anonymous key
- [ ] `JWT_SECRET` - Strong secret (min 32 characters)
- [ ] `JWT_EXPIRE` - Token expiration (e.g., "7d")
- [ ] `NODE_ENV` - Set to "production"
- [ ] `SOCKET_IO_CORS_ORIGIN` - Will update after admin panel deployment

#### Admin Panel Environment Variables (Set in Vercel Dashboard)
- [ ] `VITE_API_URL` - Backend URL (will get after backend deployment)
- [ ] `VITE_SOCKET_URL` - Backend URL (same as API URL)
- [ ] `VITE_SUPABASE_URL` - Same Supabase URL
- [ ] `VITE_SUPABASE_ANON_KEY` - Same anon key

### 2. Code is Ready ✓

- [x] Latest code committed to Git
- [x] All dependencies installed (`npm install`)
- [x] No console errors in development
- [x] Build works locally (`npm run build`)
- [x] Tests passing (if you have tests)

### 3. Database is Ready ✓

- [x] Supabase project created
- [x] All migrations run
- [x] Tables exist: athletes, sessions, teams, registrations, etc.
- [x] RLS policies configured
- [x] Admin user created
- [ ] Supabase redirect URLs configured (update after deployment)

### 4. Deployment Files Ready ✓

- [x] `apps/backend/vercel.json` exists
- [x] `apps/backend/api/index.js` exists
- [x] `apps/admin-panel/vercel.json` exists
- [x] `apps/admin-panel/.env.production` configured
- [x] Docker files exist (alternative deployment)

## Deployment Steps

### Step 1: Deploy Backend First

```bash
cd "apps/backend"
vercel --prod
```

**Copy the deployment URL** (e.g., https://backend-xyz.vercel.app)

### Step 2: Update Admin Panel Environment

Edit `apps/admin-panel/.env.production`:
```env
VITE_API_URL=https://YOUR_BACKEND_URL/api
VITE_SOCKET_URL=https://YOUR_BACKEND_URL
```

### Step 3: Deploy Admin Panel

```bash
cd "apps/admin-panel"
vercel --prod
```

**Copy the deployment URL** (e.g., https://admin-xyz.vercel.app)

### Step 4: Update Backend CORS

In Vercel Dashboard → Backend Project → Environment Variables:
```env
SOCKET_IO_CORS_ORIGIN=https://YOUR_ADMIN_URL,https://YOUR_FRONTEND_URL
```

Redeploy backend:
```bash
cd "apps/backend"
vercel --prod
```

### Step 5: Update Supabase

In Supabase Dashboard → Authentication → URL Configuration:
- Add redirect URLs:
  - `https://YOUR_ADMIN_URL/*`
  - `https://YOUR_FRONTEND_URL/*`

## Post-Deployment Tests

### Test Backend
```bash
curl https://YOUR_BACKEND_URL/api/health
# Expected: {"status":"ok"}

curl https://YOUR_BACKEND_URL/api/test
# Expected: Success message
```

### Test Admin Panel
1. Visit: https://YOUR_ADMIN_URL
2. Should see login page
3. Try logging in with admin credentials
4. Check browser console for errors
5. Test navigating to different pages
6. Try creating a session
7. Check if real-time updates work

### Test Integration
1. Login to admin panel
2. Create a test session
3. Add test athlete
4. Verify data saves to Supabase
5. Check if socket events work (if applicable)

## Common Issues & Solutions

### Backend 500 Error
- Check Vercel logs: `vercel logs`
- Verify all environment variables are set
- Check Supabase credentials

### Admin Panel Can't Connect to Backend
- Verify `VITE_API_URL` is correct
- Check backend is running
- Verify CORS settings
- Check browser console for errors

### Authentication Not Working
- Verify JWT_SECRET matches
- Check Supabase redirect URLs
- Verify admin user exists in database

### Socket.IO Not Working
- Note: Socket.IO may have limitations on Vercel serverless
- Consider Railway or other platforms for real-time features
- Can still use polling as fallback

## Rollback Plan

If deployment fails:

1. **Keep old version running** - Don't delete it
2. **Check logs**: `vercel logs <deployment-url>`
3. **Fix issue locally** and test
4. **Redeploy**: `vercel --prod`
5. **If urgent**: Use Vercel dashboard to rollback to previous deployment

## Success Criteria

Deployment is successful when:
- [ ] Backend health endpoint returns OK
- [ ] Admin panel loads without errors
- [ ] Can login to admin panel
- [ ] Can view registrations
- [ ] Can create sessions
- [ ] Athletes auto-assign to sessions
- [ ] Data persists in Supabase
- [ ] No console errors
- [ ] Mobile responsive (check on phone)

## Final Notes

- **First deployment** takes longer (15-20 min)
- **Subsequent deployments** are faster (2-5 min)
- **Vercel free tier** has limits - monitor usage
- **Custom domain** can be added later in Vercel settings
- **SSL certificates** are automatic with Vercel

---

Ready to deploy? Run:
```bash
./deploy-production.sh
```

Or follow manual steps above.
