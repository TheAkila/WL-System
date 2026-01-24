# Single Competition System - Quick Start Guide

## 🎯 What Changed?

The system now manages **ONE competition at a time** instead of multiple competitions.

---

## 🚀 Getting Started

### First Time Setup

1. **Navigate to Competitions Page**
   - Go to Admin Panel → Competitions
   
2. **Create Your Competition**
   - Fill in competition details:
     - Name (e.g., "Regional Championship 2026")
     - Date
     - Location
     - Organizer (optional)
     - Description (optional)
   - Click "Create Competition"

3. **That's it!** Your competition is now active.

---

## 📝 Managing Your Competition

### View Competition Details
- Navigate to **Competitions** page
- See current competition information
- View status: Upcoming, Active, or Completed

### Edit Competition
- Click **"Edit Competition"** button
- Update any field
- Click **"Save Changes"**
- Click **"Cancel"** to discard changes

### Change Competition Status
- Edit competition
- Update **Status** dropdown:
  - **Upcoming:** Competition hasn't started
  - **Active:** Competition is ongoing
  - **Completed:** Competition has ended

---

## 🏋️ Creating Sessions

**Before (Old System):**
- Had to select which competition
- Extra dropdown field

**Now (New System):**
- Just create the session
- Automatically links to your competition
- One less field to worry about!

### Steps:
1. Go to **Sessions** page
2. Click **"New Session"**
3. Fill in:
   - Session Name
   - Weight Category
   - Gender
   - Start Time
   - Status
4. Click **"Create"**

✨ The session automatically belongs to your current competition!

---

## 📊 Dashboard View

The dashboard now shows:
- **Current Competition Card** - Shows name and date
- **Athletes Count**
- **Sessions Count**
- **Active Sessions Count**

Click the competition card to go to competition settings.

---

## 🏅 Medal Table (Scoreboard)

**Before:** Had to select which competition to view
**Now:** Automatically shows medals from all sessions

The medal table calculates standings from all completed sessions in your competition.

---

## 💡 Key Benefits

1. **Simpler Workflow**
   - No competition selection when creating sessions
   - Less clutter in the UI
   - Focus on one event at a time

2. **Less Errors**
   - Can't accidentally create sessions in wrong competition
   - Clearer data organization

3. **Faster Setup**
   - One-time competition setup
   - No switching between competitions

---

## 🔄 Starting a New Competition

When you finish a competition and want to start a new one:

### Option 1: Update Existing
1. Go to **Competitions** page
2. Click **"Edit Competition"**
3. Update name, date, location, etc.
4. Change status to "Active"
5. Save changes

### Option 2: Mark as Completed
1. Edit competition
2. Set status to **"Completed"**
3. Save
4. Your sessions/data are preserved
5. Update details for next competition

---

## 📱 Display Screen & Scoreboard

No changes needed! They automatically show your current competition:
- Display Screen shows competition name in header
- Scoreboard shows medal standings
- Everything updates in real-time

---

## ⚠️ Important Notes

### Data Preservation
- All your competition data is preserved in the database
- Sessions remain linked to their original competitions
- You can still export results from completed competitions

### Competition ID
- Sessions automatically get `competition_id` assigned
- No need to manually set it
- Handled by database triggers

### Status Management
- Only ONE competition can be "Active" at a time
- Database ensures this automatically
- Previous competitions are set to "Completed"

---

## 🛠️ API Changes (For Developers)

### New Endpoints
```
GET  /api/competitions/current     - Get current competition
PUT  /api/competitions/current     - Update current competition
POST /api/competitions/initialize  - Create first competition
```

### Removed Endpoints
```
GET    /api/competitions           - List all (no longer needed)
GET    /api/competitions/:id       - Get by ID
POST   /api/competitions           - Create
PUT    /api/competitions/:id       - Update by ID
DELETE /api/competitions/:id       - Delete
```

### Session Creation
```javascript
// Before: Had to include competition_id
POST /api/sessions
{
  "competition_id": "uuid-here",  // Required
  "name": "Session A",
  // ...
}

// Now: Auto-assigned
POST /api/sessions
{
  "name": "Session A",
  // competition_id auto-assigned!
  // ...
}
```

---

## 🎓 Best Practices

1. **Set Competition Status Correctly**
   - Use "Upcoming" for future events
   - Use "Active" during the competition
   - Use "Completed" when finished

2. **Update Competition Info**
   - Keep location and date accurate
   - Update organizer information
   - Add descriptions for context

3. **Complete Sessions Properly**
   - Mark sessions as "Completed" when done
   - This triggers medal calculations
   - Enables result exports

4. **Regular Backups**
   - Export results regularly
   - Keep competition data safe
   - Use PDF exports for records

---

## ❓ FAQ

**Q: Can I have multiple competitions?**
A: The system focuses on one competition at a time. Previous competitions remain in the database but aren't actively managed through the UI.

**Q: What happens to old competition data?**
A: All data is preserved. Sessions stay linked to their original competitions.

**Q: How do I start a new competition?**
A: Update the current competition details or mark it as completed first.

**Q: Can I view past competitions?**
A: Data is preserved in the database. Future updates may add an archive view.

**Q: What if I need to delete a competition?**
A: Direct database access is required. Contact your system administrator.

---

## 📞 Support

For issues or questions:
1. Check the [SINGLE_COMPETITION_MIGRATION.md](./SINGLE_COMPETITION_MIGRATION.md) document
2. Review database migration file
3. Contact system administrator

---

**Version:** 2.0.0 - Single Competition System  
**Last Updated:** January 21, 2026
