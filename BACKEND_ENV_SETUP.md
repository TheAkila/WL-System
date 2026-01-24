# 🚀 Backend Setup - Getting Supabase Service Key

## Issue
The backend server needs the Supabase Service Role Key to start.

## How to Get Your Service Role Key

### Step 1: Go to Supabase Dashboard
1. Visit: https://app.supabase.com/
2. Click on your **"lifting-live-arena"** project

### Step 2: Navigate to API Settings
1. Click the **gear icon** ⚙️ in the left sidebar
2. Select **"API"** from the menu
3. You'll see a section titled **"Project API keys"**

### Step 3: Copy Service Role Key
In the API section, you'll see two keys:
- **Public API Key (anon/public)** - For frontend (already have: `sb_publishable_xnUzm6KXwue9mOknruojcQ_HpDC2dGM`)
- **Service Role Key** - For backend (⚠️ KEEP SECRET!)

Copy the **Service Role Key** (the longer one that starts with `eyJhbGc...`)

### Step 4: Update Backend .env
1. Open: `/apps/backend/.env`
2. Find this line:
   ```
   SUPABASE_SERVICE_KEY=
   ```
3. Paste your Service Role Key:
   ```
   SUPABASE_SERVICE_KEY=eyJhbGc...your_actual_key_here
   ```
4. Save the file

### Step 5: Start Backend
```bash
cd /apps/backend
npm run dev
```

## ⚠️ Security Note
- **Never** commit `.env` files to git
- **Never** share your Service Role Key publicly
- It's already in `.gitignore` (protected)

## If You Need a New Key
You can rotate/regenerate keys in Supabase API settings anytime without affecting existing users.

## Your Current Supabase Info
- **Project URL:** https://axhbgtkdvghjxtrcvbkc.supabase.co
- **Anon Key:** sb_publishable_xnUzm6KXwue9mOknruojcQ_HpDC2dGM
- **Service Key:** ⬅️ YOU NEED TO ADD THIS

---

Once you add the Service Role Key, the backend will start successfully! 🎉
