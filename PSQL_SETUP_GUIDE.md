# 🔧 Configure psql for Supabase - Step by Step

## Your Supabase Project
**Project Reference**: `axhbgtkdvghjxtrcvbkc`

---

## 📝 Step 1: Get Your Database Password

### Option A: From Supabase Dashboard (Recommended)
1. Open: https://supabase.com/dashboard
2. Select your project
3. Navigate to: **Settings** → **Database**
4. Scroll to **Connection string** section
5. Click **"Show"** next to the connection string
6. Copy the **password** (it's after `postgres:` and before `@db.`)

### Option B: If You Saved It During Setup
- Check your password manager or notes

---

## 📝 Step 2: Add to .env File

Open: `apps/backend/.env`

Add this line (replace `[YOUR-PASSWORD]` with actual password):

```bash
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.axhbgtkdvghjxtrcvbkc.supabase.co:5432/postgres
```

**Example (don't use this, use your real password):**
```bash
DATABASE_URL=postgresql://postgres:MySecurePassword123@db.axhbgtkdvghjxtrcvbkc.supabase.co:5432/postgres
```

---

## 📝 Step 3: Test psql Connection

```bash
cd "/Users/akilanishan/Desktop/Projects/WL System/WL-System"

# Load .env and test connection
source apps/backend/.env
psql "$DATABASE_URL" -c "SELECT version();"
```

**Expected output:**
```
PostgreSQL 15.x on ... (Supabase)
```

---

## 📝 Step 4: Run the Migration

Once connected successfully:

```bash
cd database/migrations
psql "$DATABASE_URL" < APPLY_THIS_IN_SUPABASE.sql
```

**Expected output:**
```
ALTER TABLE
ALTER TABLE
ALTER TABLE
ALTER TABLE
DO
DO
DO
CREATE INDEX
CREATE INDEX
CREATE INDEX
  column_name          | data_type
-----------------------+-----------
 lot_number            | integer
 opening_clean_jerk    | integer
 opening_snatch        | integer
 weigh_in_completed_at | timestamp with time zone
```

---

## 🔒 Security Notes

- ⚠️ **Never commit** the DATABASE_URL to git
- ✅ `.env` is already in `.gitignore`
- ✅ Only store in local `.env` file
- ✅ For production, use Vercel environment variables

---

## 🆘 Troubleshooting

### "password authentication failed"
- Double-check password from Supabase dashboard
- Make sure no extra spaces in .env file
- Try resetting database password in Supabase settings

### "connection refused"
- Check if your IP is allowed in Supabase (Settings → Database → Connection pooling)
- Supabase may require connection pooler for external connections

### "psql: command not found"
Install PostgreSQL client:
```bash
# macOS
brew install postgresql@15

# Add to PATH
echo 'export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

---

## ✨ Alternative: Use Supabase SQL Editor (Easier!)

If psql setup is difficult, you can always use Supabase's built-in SQL editor:

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Click: **SQL Editor** → **New Query**
4. Paste contents of `APPLY_THIS_IN_SUPABASE.sql`
5. Click **Run**

**This is the recommended method! No local setup needed.**

---

## 📋 Quick Command Reference

```bash
# Test connection
psql "$DATABASE_URL" -c "SELECT current_database();"

# List tables
psql "$DATABASE_URL" -c "\dt"

# Run migration
psql "$DATABASE_URL" < database/migrations/APPLY_THIS_IN_SUPABASE.sql

# Interactive session
psql "$DATABASE_URL"
```

---

**🎯 Once configured, you can run SQL migrations directly from your terminal!**
