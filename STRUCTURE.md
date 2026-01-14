# Project Structure

```
lifting-live-arena/
│
├── apps/                           # Application packages
│   ├── backend/                    # Node.js + Express + Socket.IO server
│   │   ├── src/
│   │   │   ├── config/            # Configuration files
│   │   │   │   └── database.js    # MongoDB connection
│   │   │   ├── controllers/       # Request handlers
│   │   │   │   ├── auth.controller.js
│   │   │   │   ├── competition.controller.js
│   │   │   │   ├── athlete.controller.js
│   │   │   │   ├── attempt.controller.js
│   │   │   │   └── session.controller.js
│   │   │   ├── middleware/        # Express middleware
│   │   │   │   ├── auth.js        # Authentication & authorization
│   │   │   │   ├── errorHandler.js
│   │   │   │   ├── index.js       # Middleware setup
│   │   │   │   └── validator.js   # Request validation
│   │   │   ├── models/            # Mongoose models
│   │   │   │   ├── User.js
│   │   │   │   ├── Competition.js
│   │   │   │   ├── Athlete.js
│   │   │   │   ├── Session.js
│   │   │   │   └── Attempt.js
│   │   │   ├── routes/            # API routes
│   │   │   │   ├── index.js       # Route setup
│   │   │   │   ├── auth.routes.js
│   │   │   │   ├── competition.routes.js
│   │   │   │   ├── athlete.routes.js
│   │   │   │   ├── attempt.routes.js
│   │   │   │   └── session.routes.js
│   │   │   ├── socket/            # Socket.IO handlers
│   │   │   │   └── index.js
│   │   │   ├── utils/             # Utility functions
│   │   │   │   └── logger.js      # Winston logger
│   │   │   └── server.js          # Server entry point
│   │   ├── logs/                  # Log files (generated)
│   │   ├── package.json
│   │   └── Dockerfile
│   │
│   ├── admin-panel/               # React admin interface
│   │   ├── src/
│   │   │   ├── components/        # Reusable components
│   │   │   │   └── Layout.jsx
│   │   │   ├── pages/             # Page components
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Competitions.jsx
│   │   │   │   ├── Athletes.jsx
│   │   │   │   ├── Sessions.jsx
│   │   │   │   └── LiveControl.jsx
│   │   │   ├── services/          # API & socket services
│   │   │   │   ├── api.js
│   │   │   │   └── socket.js
│   │   │   ├── store/             # State management
│   │   │   │   └── authStore.js
│   │   │   ├── App.jsx
│   │   │   ├── main.jsx
│   │   │   └── index.css
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── vite.config.js
│   │   ├── tailwind.config.js
│   │   ├── nginx.conf
│   │   └── Dockerfile
│   │
│   ├── display-screen/            # React big screen display
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── CurrentLifter.jsx
│   │   │   │   ├── Timer.jsx
│   │   │   │   ├── Leaderboard.jsx
│   │   │   │   └── AttemptResult.jsx
│   │   │   ├── App.jsx
│   │   │   ├── main.jsx
│   │   │   └── index.css
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── vite.config.js
│   │   ├── tailwind.config.js
│   │   └── Dockerfile
│   │
│   └── scoreboard/                # React mobile scoreboard
│       ├── src/
│       │   ├── components/
│       │   │   ├── Header.jsx
│       │   │   ├── SessionInfo.jsx
│       │   │   ├── CurrentAttempt.jsx
│       │   │   └── Rankings.jsx
│       │   ├── App.jsx
│       │   ├── main.jsx
│       │   └── index.css
│       ├── index.html
│       ├── package.json
│       ├── vite.config.js
│       ├── tailwind.config.js
│       └── Dockerfile
│
├── packages/                      # Shared packages
│   └── common/                    # Shared utilities
│       ├── src/
│       │   ├── constants.js       # Shared constants
│       │   ├── types.js           # Type definitions
│       │   ├── utils.js           # Utility functions
│       │   └── index.js
│       └── package.json
│
├── .env.example                   # Environment variables template
├── .gitignore                     # Git ignore rules
├── .eslintrc.json                 # ESLint configuration
├── .prettierrc.json               # Prettier configuration
├── docker-compose.yml             # Docker composition
├── package.json                   # Root package.json (workspace)
└── README.md                      # Project documentation
```

## Key Features by Application

### Backend (Port 5000)
- RESTful API with Express
- Real-time communication via Socket.IO
- MongoDB database with Mongoose
- JWT authentication
- Role-based authorization
- Request validation
- Error handling
- Logging with Winston

### Admin Panel (Port 3000)
- User authentication
- Competition management
- Athlete registration
- Session scheduling
- Live control interface
- Real-time updates

### Display Screen (Port 3001)
- Full-screen display optimized for projectors/TVs
- Real-time athlete information
- Current attempt display
- Countdown timer
- Live leaderboard
- Attempt result animations

### Scoreboard (Port 3002)
- Mobile-responsive design
- Live session tracking
- Current attempt display
- Real-time rankings
- Optimized for spectators

## Technology Stack Summary

**Frontend:**
- React 18
- Vite (build tool)
- Tailwind CSS (styling)
- Socket.IO Client (real-time)
- Zustand (state management)
- Axios (HTTP client)
- Framer Motion (animations - display only)

**Backend:**
- Node.js
- Express
- Socket.IO
- Mongoose (MongoDB ODM)
- JWT (authentication)
- Winston (logging)
- Helmet (security)

**Database:**
- MongoDB

**DevOps:**
- Docker & Docker Compose
- Nginx (for frontend serving)
- ESLint & Prettier (code quality)
