# Lifting Live Arena

A real-time weightlifting competition management system with admin panel, display screen, and live scoreboard.

## � Features

### Core Functionality
- ✅ **Competition Management** - Create and manage weightlifting competitions
- ✅ **Athlete Database** - Comprehensive athlete profiles with photos
- ✅ **Session Control** - Real-time session management and attempt tracking
- ✅ **Live Scoring** - Automatic calculations, rankings, and medal assignment
- ✅ **Technical Panel** - Complete competition control interface
- ✅ **Display Screens** - Big screen for behind platform
- ✅ **Live Scoreboard** - Mobile-friendly audience view

### New Features (2026)
- 🆕 **Timer System** - 60-second countdown synced across all displays
- 🆕 **Team Management** - Team CRUD operations with logo uploads
- 🆕 **Weigh-In Module** - Streamlined weigh-in workflow with progress tracking
- 🆕 **Notifications** - Announcements and athlete call-ups
- 🆕 **Media Uploads** - Photo uploads for athletes, competitions, and teams
- 🆕 **Export Reports** - PDF protocol sheets and CSV data exports
- 🆕 **User Management** - Admin dashboard for user and system management
- 🆕 **System Monitoring** - Real-time health checks and statistics
- 🆕 **Jury Override System** - IWF Rule 3.3.5 implementation for jury appeals
- 🆕 **Attempt Entry Form** - Manage all snatch and clean & jerk attempts per athlete

## �🏗️ Architecture

### Applications

- **Backend** (`apps/backend`) - Node.js + Express + Socket.IO API server
- **Admin Panel** (`apps/admin-panel`) - React app for technical table officials
- **Display Screen** (`apps/display-screen`) - React app for big screen behind platform
- **Scoreboard** (`apps/scoreboard`) - Mobile-friendly React app for audience

### Shared Packages

- **Common** (`packages/common`) - Shared types, constants, and utilities

## 🚀 Tech Stack

- **Frontend**: React 18, Tailwind CSS, Vite, React Router v6
- **Backend**: Node.js, Express, Socket.IO
- **Database**: Supabase PostgreSQL
- **Storage**: Supabase Storage (image uploads)
- **Real-time**: Socket.IO + Supabase Realtime
- **Auth**: JWT + bcryptjs
- **Export**: pdfkit (PDF), csv-writer (CSV)
- **Upload**: multer
- **Testing**: Jest, React Testing Library

## 📋 Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Supabase account and project

## 🛠️ Installation

```bash
# Clone repository
git clone https://github.com/TheAkila/WL-System.git
cd WL-System

# Install dependencies for all apps
npm install

# Set up environment variables (automated)
./setup-env.sh

# OR manually copy and configure
cp apps/backend/.env.example apps/backend/.env
cp apps/admin-panel/.env.example apps/admin-panel/.env
cp apps/display-screen/.env.example apps/display-screen/.env
cp apps/scoreboard/.env.example apps/scoreboard/.env

# Set up Supabase database
# Follow instructions in SUPABASE_SETUP.md
```

## 📦 Database Setup

1. Create Supabase project
2. Run schema: `database/schema.sql`
3. Run migrations:
   - `database/migrations/001_lifting_order.sql`
   - `database/migrations/002_official_ranking_medals.sql`
   - `database/migrations/003_add_password_auth.sql`
4. Enable Realtime for tables: `attempts`, `athletes`, `sessions`
5. Create Storage buckets: `athletes`, `competitions`, `teams`

**Detailed instructions**: See [SUPABASE_SETUP.md](SUPABASE_SETUP.md)

## 🏃 Running the Application

### Development Mode

```bash
# Terminal 1 - Backend
cd apps/backend
npm run dev

# Terminal 2 - Admin Panel
cd apps/admin-panel
npm run dev

# Terminal 3 - Display Screen
cd apps/display-screen
npm run dev

# Terminal 4 - Scoreboard
cd apps/scoreboard
npm run dev
```

**Access URLs:**
- Backend API: `http://localhost:5000`
- Admin Panel: `http://localhost:3000`
- Display Screen: `http://localhost:3001`
- Scoreboard: `http://localhost:3002`

**Default Login:**
- Email: `admin@example.com`
- Password: `admin123`

### Production Build

```bash
# Build all applications
npm run build

# Start production server
cd apps/backend && npm start
```

## 📚 Documentation

- **[Setup Guide](SETUP_CHECKLIST.md)** - Complete setup checklist
- **[Supabase Setup](SUPABASE_SETUP.md)** - Database configuration
- **[Storage Setup](SUPABASE_STORAGE_SETUP.md)** - Image upload buckets
- **[Testing Guide](TESTING_WORKFLOW_GUIDE.md)** - Complete workflow testing
- **[New Features](NEW_FEATURES_GUIDE.md)** - Detailed feature documentation
- **[Technical Panel](TECHNICAL_PANEL.md)** - Competition control guide
- **[Quick Reference](QUICK_REFERENCE.md)** - API and commands reference

## 🐳 Docker Deployment

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📁 Project Structure

```
WL-System/
├── apps/
│   ├── backend/              # Express + Socket.IO API server
│   │   ├── src/
│   │   │   ├── controllers/  # 12 controllers (auth, admin, export, etc.)
│   │   │   ├── routes/       # API routes
│   │   │   ├── services/     # Business logic (timer, storage, export)
│   │   │   ├── middleware/   # Auth, validation, error handling
│   │   │   ├── socket/       # Socket.IO handlers
│   │   │   └── server.js     # Entry point
│   │   └── temp/             # Temporary export files
│   ├── admin-panel/          # React admin interface
│   │   └── src/
│   │       ├── pages/        # 12 pages (Dashboard, Athletes, Teams, etc.)
│   │       ├── components/   # Reusable components
│   │       └── services/     # API client
│   ├── display-screen/       # Big screen display
│   └── scoreboard/           # Mobile scoreboard
├── database/
│   ├── schema.sql            # Database schema
│   └── migrations/           # Database migrations
├── packages/
│   └── common/               # Shared utilities
└── docker-compose.yml        # Docker configuration
```

## 🧪 Testing

```bash
# Run backend tests
cd apps/backend
npm test

# Run tests with coverage
npm run test:coverage

# System health check
./system-check.sh
```

**Complete Workflow Test:**
See [TESTING_WORKFLOW_GUIDE.md](TESTING_WORKFLOW_GUIDE.md) for step-by-step testing instructions.

## 🔧 Troubleshooting

### Port Already in Use
```bash
# Find and kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

### Backend Won't Start
```bash
# Check environment variables
cat apps/backend/.env

# Verify Supabase connection
# Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
```

### Images Won't Upload
```bash
# Verify Supabase Storage buckets exist
# Check: athletes, competitions, teams

# Create temp directory
mkdir -p apps/backend/temp
```

### Real-time Not Working
- Verify Socket.IO connection in browser console
- Check SOCKET_IO_CORS_ORIGIN in backend .env
- Ensure all apps use same backend URL

## 🔑 Default Credentials

After running the schema migrations, use these credentials:

```
Email: admin@example.com
Password: admin123

Email: tech@example.com
Password: tech123
```

**⚠️ Change these passwords in production!**

## 🌐 Default URLs

- Backend API: http://localhost:5000
- Admin Panel: http://localhost:3000
- Display Screen: http://localhost:3001
- Scoreboard: http://localhost:3002

## 🎯 Quick Start

1. **Set up Supabase** - Follow [SUPABASE_SETUP.md](SUPABASE_SETUP.md)
2. **Configure environment** - Run `./setup-env.sh`
3. **Create storage buckets** - Follow [SUPABASE_STORAGE_SETUP.md](SUPABASE_STORAGE_SETUP.md)
4. **Start services** - Run backend and admin panel
5. **Login** - Use default credentials
6. **Test workflow** - Follow [TESTING_WORKFLOW_GUIDE.md](TESTING_WORKFLOW_GUIDE.md)

## 🚀 Deployment

### Vercel (Frontend Apps)
See [VERCEL_DEPLOYMENT_GUIDE.md](VERCEL_DEPLOYMENT_GUIDE.md) for detailed instructions.

### Backend Deployment
- Use Node.js hosting (Railway, Render, DigitalOcean)
- Set environment variables
- Ensure PORT is configurable
- Enable CORS for frontend domains

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## 📄 License

MIT License - feel free to use this project for your competitions!

## 🎉 Feature Status

### Completed ✅
- [x] Competition management
- [x] Real-time scoring
- [x] Timer system
- [x] Team management
- [x] Weigh-in module
- [x] Notifications system
- [x] Image uploads
- [x] Export reports (PDF/CSV)
- [x] User management
- [x] System monitoring

### Planned 🎯
- [ ] Multi-language support
- [ ] Mobile app for officials
- [ ] Advanced analytics
- [ ] Federation integration

---

**Built with ❤️ for the weightlifting community**
