# Lifting Live Arena

A real-time weightlifting competition management system with admin panel, display screen, and live scoreboard.

## 🏗️ Architecture

### Applications

- **Backend** (`apps/backend`) - Node.js + Express + Socket.IO API server
- **Admin Panel** (`apps/admin-panel`) - React app for technical table officials
- **Display Screen** (`apps/display-screen`) - React app for big screen behind platform
- **Scoreboard** (`apps/scoreboard`) - Mobile-friendly React app for audience

### Shared Packages

- **Common** (`packages/common`) - Shared types, constants, and utilities

## 🚀 Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express, Socket.IO, Mongoose
- **Database**: MongoDB
- **Real-time**: Socket.IO
- **Testing**: Jest, React Testing Library
- **Code Quality**: ESLint, Prettier, Husky

## 📋 Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- MongoDB >= 6.0

## 🛠️ Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Update .env with your configuration
```

## 🏃 Running the Application

### Development Mode

```bash
# Run all services
npm run dev

# Run individual services
npm run dev:backend
npm run dev:admin
npm run dev:display
npm run dev:scoreboard
```

### Production Build

```bash
# Build all applications
npm run build

# Start production server
cd apps/backend && npm start
```

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
lifting-live-arena/
├── apps/
│   ├── backend/              # Express + Socket.IO server
│   ├── admin-panel/          # Admin interface
│   ├── display-screen/       # Big screen display
│   └── scoreboard/           # Audience scoreboard
├── packages/
│   └── common/               # Shared code
├── docker-compose.yml
└── package.json
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📝 Code Quality

```bash
# Lint all code
npm run lint

# Format code
npm run format
```

## 🔑 Default Admin Credentials

- **Email**: admin@liftinglivearena.com
- **Password**: changeme123

⚠️ **Important**: Change these credentials immediately after first login in production!

## 🌐 Default URLs

- Backend API: http://localhost:5000
- Admin Panel: http://localhost:3000
- Display Screen: http://localhost:3001
- Scoreboard: http://localhost:3002

## 📖 API Documentation

API documentation is available at `http://localhost:5000/api-docs` when running in development mode.

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## 📄 License

MIT License - feel free to use this project for your competitions!
