# Database Migration Instructions

## ✅ Frontends Rebuilt Successfully

All frontend applications have been successfully rebuilt:
- ✅ Admin Panel
- ✅ Display Screen  
- ✅ Scoreboard

---

## 📊 Apply Database Migration

Since you're using **Supabase**, you need to apply the migration through the Supabase SQL Editor:

### Option 1: Supabase Dashboard (Recommended)

1. **Go to your Supabase Dashboard**
   - Navigate to https://app.supabase.com
   - Select your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and Paste Migration**
   - Open the migration file: `database/migrations/004_single_competition.sql`
   - Copy all contents
   - Paste into the SQL Editor

4. **Run the Migration**
   - Click "Run" or press Cmd/Ctrl + Enter
   - Wait for confirmation message

5. **Verify Migration**
   - Check for any errors in the output
   - All statements should execute successfully

### Option 2: Supabase CLI

If you have Supabase CLI installed:

```bash
cd "/Users/akilanishan/Desktop/Projects/WL System/WL-System"
supabase db push
```

Or run the migration file directly:

```bash
supabase db execute -f database/migrations/004_single_competition.sql
```

### Option 3: Database Connection String

If you have direct database access:

```bash
# Get your connection string from Supabase Dashboard > Project Settings > Database
# Then run:
psql "your-connection-string-here" -f database/migrations/004_single_competition.sql
```

---

## 🔍 What the Migration Does

The migration creates:

1. **Trigger Function** - Ensures only one competition can be active at a time
2. **Auto-Assignment Trigger** - Automatically assigns sessions to the current competition
3. **View** - Creates `current_competition` view for easy access
4. **Comments** - Adds documentation to the database schema

---

## ✅ After Migration

Once the migration is complete:

1. **Restart Backend** (if running):
   ```bash
   cd apps/backend
   npm start
   ```

2. **Test the System**:
   - Open Admin Panel
   - Go to Competitions page
   - Create or edit your competition
   - Create a new session (no need to select competition!)

---

## 🔄 Migration File Location

```
/Users/akilanishan/Desktop/Projects/WL System/WL-System/database/migrations/004_single_competition.sql
```

---

## ⚠️ Important Notes

- **Backup First**: Consider backing up your database before running migrations
- **Existing Data**: The migration is non-destructive and preserves all existing data
- **Competition Status**: After migration, if multiple competitions have status "active", the trigger will automatically set all but one to "completed"
- **Sessions**: All existing sessions keep their competition_id values. New sessions will auto-assign to the current competition.

---

## 🐛 Troubleshooting

### Error: "function already exists"
This means the migration was already partially applied. You can either:
- Drop the existing functions first
- Skip to the next statement
- Or ignore if everything else works

### Error: "relation already exists"
The view or trigger might already exist. This is safe to ignore.

### Connection Issues
Make sure you're using the correct Supabase connection details from your `.env` file.

---

## 📞 Need Help?

If you encounter any issues:
1. Check Supabase logs for detailed error messages
2. Verify your database connection
3. Ensure you have proper permissions to modify the database schema

---

**Status**: Frontends built ✅ | Migration pending ⏳
