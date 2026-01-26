# Vercel Deployment - Step by Step Checklist

**Use this while deploying to track progress**

---

## ✅ Step 1: Deploy Backend

- [ ] Go to [vercel.com/new](https://vercel.com/new)
- [ ] Import `TheAkila/WL-System`
- [ ] Root Directory: `apps/backend`
- [ ] Add environment variables:
  ```
  NODE_ENV=production
  SUPABASE_URL=https://axhbgtkdvghjxtrcvbkc.supabase.co
  SUPABASE_KEY=<your-service-key>
  PORT=5000
  ```
- [ ] Click Deploy
- [ ] **Backend URL:** ________________________________

---

## ✅ Step 2: Deploy Admin Panel

- [ ] New project → Import same repo
- [ ] Root Directory: `apps/admin-panel`
- [ ] Framework: Vite
- [ ] Add environment variables:
  ```
  VITE_API_URL=<backend-url>/api
  VITE_SOCKET_URL=<backend-url>
  VITE_SUPABASE_URL=https://axhbgtkdvghjxtrcvbkc.supabase.co
  VITE_SUPABASE_ANON_KEY=<anon-key>
  ```
- [ ] Click Deploy
- [ ] Test login works
- [ ] **Admin URL:** ________________________________

---

## ✅ Step 3: Deploy Display Screen

- [ ] New project → Import same repo
- [ ] Root Directory: `apps/display-screen`
- [ ] Framework: Vite
- [ ] Same environment variables as Admin
- [ ] Click Deploy
- [ ] Test page loads
- [ ] **Display URL:** ________________________________

---

## ✅ Step 4: Deploy Scoreboard

- [ ] New project → Import same repo
- [ ] Root Directory: `apps/scoreboard`
- [ ] Framework: Vite
- [ ] Same environment variables as Admin
- [ ] Click Deploy
- [ ] Test page loads
- [ ] **Scoreboard URL:** ________________________________

---

## ✅ Final Testing

- [ ] Login to admin panel
- [ ] Create a test session
- [ ] Open display screen → select session
- [ ] Open scoreboard → select session
- [ ] Verify real-time updates work

---

**Done!** 🎉 All 3 apps deployed on Vercel
