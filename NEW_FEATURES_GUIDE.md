# New Features Documentation

This document provides detailed information about all 8 features implemented in the Lifting Live Arena system.

---

## Feature 1: Backend Stability Fix ✅

### Overview
Resolved critical port conflict issue preventing backend server from starting.

### Technical Details
- **Issue**: EADDRINUSE error on port 5000
- **Solution**: Process cleanup and proper server shutdown handling
- **Impact**: Backend now starts reliably without manual intervention

### No User Action Required
This was an infrastructure fix that improves system reliability.

---

## Feature 2: Timer Functionality ⏱️

### Overview
Real-time countdown timer synchronized across all displays for athlete attempt timing.

### Components
- **Backend**: `timerService.js` (singleton), `timer.controller.js`
- **Frontend**: `TimerControls.jsx` component in Technical Panel
- **Socket Events**: `timer:started`, `timer:paused`, `timer:reset`, `timer:tick`

### How to Use

#### Technical Panel (Admin)
1. Navigate to **Technical Panel**
2. Select active session
3. Timer controls appear below current lifter
4. **Start Timer**: Click "Start" - begins 60s countdown
5. **Pause Timer**: Click "Pause" - freezes timer
6. **Reset Timer**: Click "Reset" - returns to 60s

#### Display Screen & Scoreboard
- Timer automatically syncs and displays
- No manual control needed
- Updates in real-time

### API Endpoints
```javascript
POST /api/timer/start        // Start 60-second countdown
POST /api/timer/pause        // Pause timer
POST /api/timer/reset        // Reset to 60 seconds
GET  /api/timer/status       // Get current timer state
```

### Timer States
- **STOPPED**: Initial state (60s displayed)
- **RUNNING**: Counting down
- **PAUSED**: Frozen at current time

### Technical Notes
- Timer persists across page refreshes
- Synchronized via Socket.IO to all clients
- Automatically stops at 0 seconds
- Can be controlled only from Technical Panel

---

## Feature 3: Team Management 🏆

### Overview
Complete team management system with CRUD operations and logo uploads.

### Components
- **Backend**: `team.controller.js`, `/api/teams` routes
- **Frontend**: `Teams.jsx` page
- **Storage**: Supabase Storage bucket `teams`

### How to Use

#### Create Team
1. Click **"Teams"** in sidebar
2. Click **"Create Team"** button
3. Fill in form:
   - **Name**: Team name (required)
   - **Country**: 3-letter code (e.g., USA)
   - **Coach**: Coach name
   - **Logo**: Upload image (JPG, PNG, WebP)
4. Click **"Create Team"**

#### Edit Team
1. Find team in list
2. Click **"Edit"** button
3. Modify fields
4. Upload new logo (optional)
5. Click **"Update Team"**

#### Delete Team
1. Click **"Delete"** button on team card
2. Confirm deletion
3. Team and logo removed

#### Assign to Athletes
When creating/editing athletes, select team from dropdown.

### API Endpoints
```javascript
GET    /api/teams           // List all teams
POST   /api/teams           // Create team
PUT    /api/teams/:id       // Update team
DELETE /api/teams/:id       // Delete team (and logo)
```

### Database Schema
```sql
teams (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT,
  coach TEXT,
  logo_url TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Features
- ✅ CRUD operations
- ✅ Logo upload and storage
- ✅ Automatic logo deletion on update
- ✅ Team assignment to athletes
- ✅ Search and filter teams
- ✅ Country flag display (when available)

---

## Feature 4: Weigh-In Management ⚖️

### Overview
Streamlined weigh-in process for recording athlete body weights before competition.

### Components
- **Frontend**: `WeighIn.jsx` page
- **Backend**: Uses existing athlete update endpoints

### How to Use

#### Weigh-In Workflow
1. Click **"Weigh-In"** in sidebar
2. Select **Session** from dropdown
3. All assigned athletes appear

#### Record Body Weight
1. Find athlete in list
2. Click **"Weigh-In"** button OR click weight field
3. Enter body weight (kg)
4. Press **Enter** or click **"Save"**
5. Status changes to ✅ Completed

#### Progress Tracking
- Progress bar shows completion: "3/5 athletes weighed in (60%)"
- Green checkmarks indicate completed weigh-ins
- Gray indicators show pending weigh-ins

#### Session Status Display
- **Total Athletes**: Count of athletes in session
- **Weighed In**: Count completed
- **Pending**: Count remaining
- **Gender**: Men/Women
- **Weight Category**: e.g., 61kg, 73kg

### Features
- ✅ Session-based weigh-in
- ✅ Inline weight entry
- ✅ Progress tracking
- ✅ Visual status indicators
- ✅ Automatic athlete update
- ✅ Validation (weight must be positive)

### Technical Notes
- Updates `body_weight` field in athletes table
- No separate weigh-in table needed
- Real-time progress calculation
- Filter by session for focused workflow

---

## Feature 5: Notifications System 📢

### Overview
Announcement and athlete call-up system for broadcasting messages to displays and scoreboards.

### Components
- **Backend**: `notification.controller.js`, `/api/notifications` routes
- **Frontend Admin**: `AnnouncementPanel.jsx`, `AthleteCallUp.jsx`
- **Frontend Displays**: `NotificationDisplay.jsx` (display-screen, scoreboard)
- **Socket Events**: `announcement`, `athlete-callup`

### How to Use

#### Send Announcements
1. Go to **Technical Panel**
2. Scroll to **"Announcements"** section
3. Type message (e.g., "5-minute break")
4. Click **"Send Announcement"**
5. Message broadcasts to all displays

#### Call Up Athletes
1. In **Technical Panel**, find **"Athlete Call-Up"** section
2. Next two athletes in lifting order shown:
   - **On Deck**: Next lifter
   - **In the Hole**: Following lifter
3. Click **"Call On Deck"** or **"Call In the Hole"**
4. Athlete receives notification on displays

#### Display Screen
- Notifications appear at top in red banner
- Auto-dismiss after 10 seconds
- Shows athlete name for call-ups

#### Scoreboard
- Notifications overlay scoreboard
- Mobile-optimized display
- Vibration on mobile devices (if supported)

### API Endpoints
```javascript
POST /api/notifications/announcement    // Send announcement
POST /api/notifications/callup          // Call athlete
```

### Request Format
```javascript
// Announcement
{
  "sessionId": "uuid",
  "message": "Session starting in 5 minutes"
}

// Call-Up
{
  "sessionId": "uuid",
  "athleteId": "uuid",
  "type": "on-deck" | "in-hole",
  "message": "Please report to warm-up area"
}
```

### Features
- ✅ Real-time broadcasting
- ✅ Socket.IO for instant delivery
- ✅ Auto-dismiss notifications
- ✅ Athlete-specific call-ups
- ✅ Custom messages
- ✅ Multi-display support

### Use Cases
- Session start/end announcements
- Break notifications
- Technical issues
- Athlete call-ups for warm-up
- Platform changes
- Emergency alerts

---

## Feature 6: Media Upload System 📸

### Overview
Image upload functionality for athlete photos, competition logos, and team logos.

### Components
- **Backend**: `storageService.js`, `upload.controller.js`, multer middleware
- **Frontend**: `ImageUpload.jsx` reusable component
- **Storage**: Supabase Storage (3 buckets)

### How to Use

#### Upload Athlete Photo
1. Go to **Athletes** page
2. Click **"Add Athlete"** or edit existing
3. Click camera icon or upload area
4. Select image (JPG, PNG, WebP)
5. Image preview appears
6. Click **"Create/Update Athlete"**
7. Photo stored and displayed

#### Upload Competition Logo
1. Go to **Competitions** page
2. Create or edit competition
3. Upload logo image
4. Logo appears in competition header

#### Upload Team Logo
1. Go to **Teams** page
2. Create or edit team
3. Upload logo image
4. Logo displays in team card

### Technical Details

#### Supabase Storage Buckets
- `athletes` - Athlete profile photos
- `competitions` - Competition logos
- `teams` - Team logos

#### File Restrictions
- **Max Size**: 5 MB
- **Formats**: JPG, JPEG, PNG, WebP
- **Naming**: Auto-generated unique filenames

#### Upload Process
1. Frontend validates file
2. Multer middleware processes upload
3. File uploaded to Supabase Storage
4. Public URL generated
5. URL saved in database
6. Old image deleted (on update)

### API Endpoints
```javascript
POST   /api/uploads/athlete/:id        // Upload athlete photo
POST   /api/uploads/competition/:id    // Upload competition logo
POST   /api/uploads/team/:id           // Upload team logo
DELETE /api/uploads/athlete/:id        // Delete athlete photo
DELETE /api/uploads/competition/:id    // Delete competition logo
DELETE /api/uploads/team/:id           // Delete team logo
```

### Features
- ✅ Drag-and-drop upload
- ✅ Image preview before save
- ✅ Automatic image optimization
- ✅ Old image cleanup
- ✅ Error handling
- ✅ Progress indicators
- ✅ Responsive design

### Best Practices
- Resize images to 800x800px before upload
- Use WebP for best compression
- Keep files under 500 KB
- Use descriptive filenames

---

## Feature 7: Reports & Export System 📊

### Overview
Generate and download PDF protocol sheets and CSV data exports for sessions.

### Components
- **Backend**: `exportService.js`, `export.controller.js`
- **Frontend**: `ExportMenu.jsx` component
- **Libraries**: pdfkit (PDF), csv-writer (CSV)

### How to Use

#### Export from Technical Panel
1. Go to **Technical Panel**
2. Select completed session
3. Click **"Export"** button (top right)
4. Choose export type:
   - **Session Protocol (PDF)**
   - **Leaderboard (CSV)**
   - **Start List (CSV)**

#### Export from Competitions
1. Go to **Competitions** page
2. View competition details
3. Find session
4. Click export icon
5. Select format

### Export Types

#### 1. Session Protocol (PDF)
**Contents:**
- Competition name and details
- Session information
- Official results table:
  - Rank
  - Athlete name
  - Country
  - Best snatch
  - Best clean & jerk
  - Total
  - Medal
- Timestamp and signatures area

**Format:** A4, professional layout
**Filename:** `protocol-[session-name]-[date].pdf`

#### 2. Leaderboard (CSV)
**Columns:**
```csv
Rank,Name,Country,Team,Snatch,Clean & Jerk,Total,Medal
1,John Anderson,USA,Team A,105,135,240,Gold
2,Mike Chen,USA,Team B,100,130,230,Silver
```

**Use Cases:**
- Import to Excel/Google Sheets
- Data analysis
- Publishing results
- Federation reporting

#### 3. Start List (CSV)
**Columns:**
```csv
Lot Number,Name,Country,Team,Body Weight,Category
1,John Anderson,USA,Team A,61.0,61kg
2,Mike Chen,USA,Team B,61.2,61kg
```

**Use Cases:**
- Pre-session planning
- Announcer sheets
- Warm-up area posting

### API Endpoints
```javascript
GET /api/exports/session/:id/pdf         // Generate PDF
GET /api/exports/session/:id/csv         // Export leaderboard CSV
GET /api/exports/session/:id/leaderboard // Export leaderboard CSV
GET /api/exports/session/:id/startlist  // Export start list CSV
```

### Features
- ✅ Professional PDF layout
- ✅ Medal indicators (🥇🥈🥉)
- ✅ Automatic file cleanup
- ✅ Timestamp on exports
- ✅ Competition branding
- ✅ Multiple export formats
- ✅ Download to browser

### Technical Details
- PDF generation: Server-side with pdfkit
- CSV generation: csv-writer library
- Temp storage: `apps/backend/temp/`
- Auto-cleanup: Files deleted after 1 hour
- Encoding: UTF-8 for international characters

### File Sizes
- PDF: ~50-200 KB (depends on athletes)
- CSV: ~5-20 KB

---

## Feature 8: System Administration 🛠️

### Overview
Admin-only user management and system monitoring dashboard.

### Components
- **Backend**: `admin.controller.js`, `/api/admin` routes
- **Frontend**: `UserManagement.jsx`, `SystemSettings.jsx`
- **Access**: Admin role only

### User Management

#### View Users
1. Click **"User Management"** in sidebar (admin only)
2. See all system users
3. Columns: Name, Email, Role, Created Date, Actions

#### Create User
1. Click **"Add User"** button
2. Fill in form:
   - **Name**: Full name
   - **Email**: Login email (unique)
   - **Password**: Minimum 6 characters
   - **Role**: admin | technical | viewer
3. Click **"Create User"**

#### Change User Role
1. Find user in list
2. Click role dropdown
3. Select new role:
   - **admin**: Full access
   - **technical**: Competition management
   - **viewer**: Read-only access
4. Role updates immediately

**Protection:** Cannot change your own role

#### Reset Password
1. Click key icon (🔑) on user row
2. Enter new password
3. Click **"Reset Password"**
4. User must use new password on next login

#### Delete User
1. Click trash icon (🗑️) on user row
2. Confirm deletion
3. User removed from system

**Protection:** Cannot delete yourself

### System Settings

#### View System Stats
1. Click **"System Settings"** in sidebar
2. Dashboard shows:
   - **Users**: Total count
   - **Competitions**: Total count
   - **Athletes**: Total count
   - **Sessions**: Total count

#### System Health
Real-time status indicators:
- **Database**: Connection status (Online/Offline)
- **Storage**: Supabase Storage status
- **Real-time**: Socket.IO connection
- **API**: Backend server status

#### System Information
- **Version**: Current system version
- **Uptime**: Server running time
- **Environment**: development/production
- **Node Version**: Node.js version

#### Configuration
Enabled features list:
- Real-time Updates ✅
- Image Uploads ✅
- Export Reports ✅
- Notifications ✅

### API Endpoints
```javascript
// User Management
GET    /api/admin/users              // List all users
POST   /api/admin/users              // Create user
PUT    /api/admin/users/:id/role     // Change role
PUT    /api/admin/users/:id/password // Reset password
DELETE /api/admin/users/:id          // Delete user

// System Stats
GET    /api/admin/stats              // Get system statistics
```

### Request/Response Examples

#### Create User
```javascript
POST /api/admin/users
{
  "name": "John Smith",
  "email": "john@example.com",
  "password": "secure123",
  "role": "technical"
}

Response:
{
  "id": "uuid",
  "name": "John Smith",
  "email": "john@example.com",
  "role": "technical",
  "created_at": "2026-01-20T10:30:00Z"
}
```

#### Get System Stats
```javascript
GET /api/admin/stats

Response:
{
  "users": 5,
  "competitions": 12,
  "athletes": 150,
  "sessions": 24,
  "uptime": 86400,
  "version": "1.0.0"
}
```

### Features
- ✅ Complete user CRUD
- ✅ Role-based access control
- ✅ Password hashing (bcrypt)
- ✅ Self-protection (can't delete/change self)
- ✅ Real-time system stats
- ✅ Health monitoring
- ✅ Auto-refresh (30s interval)
- ✅ Inline role editing
- ✅ Visual status indicators

### Security
- Admin-only access (role check)
- Password hashing with bcrypt
- JWT authentication required
- Input validation (express-validator)
- Protection against self-modification

### Use Cases
- Add technical officials before competition
- Grant viewer access to federation observers
- Remove users after event
- Monitor system health during competition
- Track usage statistics
- Troubleshoot connection issues

---

## Feature Comparison Table

| Feature | Admin | Technical | Viewer | Displays |
|---------|-------|-----------|--------|----------|
| Timer Control | ✅ | ✅ | ❌ | View Only |
| Team Management | ✅ | ✅ | ❌ | ❌ |
| Weigh-In | ✅ | ✅ | ❌ | ❌ |
| Notifications | ✅ | ✅ | ❌ | Receive |
| Image Upload | ✅ | ✅ | ❌ | ❌ |
| Export Reports | ✅ | ✅ | View Only | ❌ |
| User Management | ✅ | ❌ | ❌ | ❌ |
| System Settings | ✅ | ❌ | ❌ | ❌ |

---

## Quick Reference Commands

### Check All Services Status
```bash
lsof -ti:5000,3000,3001,3002
```

### Start All Services
```bash
# Terminal 1
cd apps/backend && npm run dev

# Terminal 2
cd apps/admin-panel && npm run dev

# Terminal 3
cd apps/display-screen && npm run dev

# Terminal 4
cd apps/scoreboard && npm run dev
```

### Create Temp Directory
```bash
mkdir -p apps/backend/temp
```

### Verify Supabase Buckets
```sql
SELECT name, public FROM storage.buckets
WHERE name IN ('athletes', 'competitions', 'teams');
```

---

## Support & Troubleshooting

For issues with any feature, check:
1. Browser console for errors
2. Backend logs in terminal
3. Network tab for failed requests
4. Supabase dashboard for database/storage errors
5. Environment variables in `.env` files

Common solutions:
- **Restart backend** if Socket.IO not connecting
- **Clear browser cache** if UI not updating
- **Check permissions** if operations fail
- **Verify .env files** for missing configuration

---

**All features are production-ready and fully documented! 🎉**
