#!/bin/bash

# Lifting Live Arena - System Health Check Script
# This script verifies all components are properly set up and ready to run

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  🏋️  Lifting Live Arena - System Health Check${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo ""

ERRORS=0
WARNINGS=0

# Function to check if a file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $2"
    else
        echo -e "${RED}✗${NC} $2 - NOT FOUND"
        ((ERRORS++))
    fi
}

# Function to check if a directory exists
check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $2"
    else
        echo -e "${RED}✗${NC} $2 - NOT FOUND"
        ((ERRORS++))
    fi
}

# Function to check npm package
check_npm_package() {
    cd "$1"
    if npm list "$2" >/dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} $3"
    else
        echo -e "${YELLOW}⚠${NC} $3 - NOT INSTALLED"
        ((WARNINGS++))
    fi
    cd - >/dev/null
}

# Check project structure
echo -e "${BLUE}1. Checking Project Structure...${NC}"
check_dir "apps/backend" "Backend app directory"
check_dir "apps/admin-panel" "Admin Panel app directory"
check_dir "apps/display-screen" "Display Screen app directory"
check_dir "apps/scoreboard" "Scoreboard app directory"
check_dir "database" "Database directory"
check_dir "packages/common" "Common package directory"
echo ""

# Check database files
echo -e "${BLUE}2. Checking Database Files...${NC}"
check_file "database/schema.sql" "Main database schema"
check_file "database/migrations/001_lifting_order.sql" "Lifting order migration"
check_file "database/migrations/002_official_ranking_medals.sql" "Ranking & medals migration"
check_file "database/migrations/003_add_password_auth.sql" "Password authentication migration"
check_file "database/SETUP_QUICK_REFERENCE.sql" "Database setup reference"
echo ""

# Check environment files
echo -e "${BLUE}3. Checking Environment Files...${NC}"
check_file "apps/backend/.env.example" "Backend .env.example"
check_file "apps/backend/.env" "Backend .env"
check_file "apps/admin-panel/.env.example" "Admin Panel .env.example"
check_file "apps/admin-panel/.env" "Admin Panel .env"
check_file "apps/display-screen/.env.example" "Display Screen .env.example"
check_file "apps/display-screen/.env" "Display Screen .env"
check_file "apps/scoreboard/.env.example" "Scoreboard .env.example"
check_file "apps/scoreboard/.env" "Scoreboard .env"
echo ""

# Check backend files
echo -e "${BLUE}4. Checking Backend Files...${NC}"
check_file "apps/backend/src/server.js" "Main server file"
check_file "apps/backend/src/middleware/auth.js" "Auth middleware"
check_file "apps/backend/src/middleware/errorHandler.js" "Error handler middleware"
check_file "apps/backend/src/middleware/index.js" "Middleware index"
check_file "apps/backend/src/controllers/auth.controller.js" "Auth controller"
check_file "apps/backend/src/controllers/technical.controller.js" "Technical controller"
check_file "apps/backend/src/routes/auth.routes.js" "Auth routes"
check_file "apps/backend/src/routes/technical.routes.js" "Technical routes"
check_file "apps/backend/src/services/database.js" "Database service"
check_file "apps/backend/src/socket/index.js" "Socket.IO setup"
check_file "apps/backend/src/utils/logger.js" "Logger utility"
echo ""

# Check admin panel files
echo -e "${BLUE}5. Checking Admin Panel Files...${NC}"
check_file "apps/admin-panel/src/App.jsx" "App component"
check_file "apps/admin-panel/src/main.jsx" "Main entry point"
check_file "apps/admin-panel/src/pages/LoginPage.jsx" "Login page"
check_file "apps/admin-panel/src/pages/TechnicalPanel.jsx" "Technical Panel page"
check_file "apps/admin-panel/src/contexts/AuthContext.jsx" "Auth context"
check_file "apps/admin-panel/src/components/ProtectedRoute.jsx" "Protected route component"
check_file "apps/admin-panel/src/services/auth.js" "Auth service"
check_file "apps/admin-panel/src/services/api.js" "API service"
check_file "apps/admin-panel/src/services/socket.js" "Socket.IO service"
echo ""

# Check display screen files
echo -e "${BLUE}6. Checking Display Screen Files...${NC}"
check_file "apps/display-screen/src/App.jsx" "App component"
check_file "apps/display-screen/src/main.jsx" "Main entry point"
check_file "apps/display-screen/src/components/CurrentAthleteDisplay.jsx" "Current athlete display"
check_file "apps/display-screen/src/components/ResultAnimation.jsx" "Result animation"
check_file "apps/display-screen/src/components/TopLeaderboard.jsx" "Top leaderboard"
check_file "apps/display-screen/postcss.config.cjs" "PostCSS config"
echo ""

# Check scoreboard files
echo -e "${BLUE}7. Checking Scoreboard Files...${NC}"
check_file "apps/scoreboard/src/App.jsx" "App component"
check_file "apps/scoreboard/src/main.jsx" "Main entry point"
check_file "apps/scoreboard/src/pages/LiveView.jsx" "Live view page"
check_file "apps/scoreboard/src/pages/Leaderboard.jsx" "Leaderboard page"
check_file "apps/scoreboard/src/pages/MedalTable.jsx" "Medal table page"
check_file "apps/scoreboard/src/pages/SessionResults.jsx" "Session results page"
check_file "apps/scoreboard/src/components/BottomNavigation.jsx" "Bottom navigation"
check_file "apps/scoreboard/postcss.config.cjs" "PostCSS config"
echo ""

# Check documentation
echo -e "${BLUE}8. Checking Documentation...${NC}"
check_file "README.md" "Main README"
check_file "SUPABASE_SETUP.md" "Supabase setup guide"
check_file "SETUP_CHECKLIST.md" "Setup checklist"
check_file "AUTHENTICATION.md" "Authentication guide"
check_file "RANKING_MEDALS.md" "Ranking & medals guide"
check_file "TECHNICAL_PANEL.md" "Technical panel guide"
check_file "DISPLAY_SCREEN.md" "Display screen guide"
check_file "SCOREBOARD.md" "Scoreboard guide"
check_file "REALTIME_FLOW.md" "Realtime flow guide"
echo ""

# Check critical dependencies
echo -e "${BLUE}9. Checking Critical Dependencies...${NC}"
check_npm_package "apps/backend" "express" "Backend: Express"
check_npm_package "apps/backend" "socket.io" "Backend: Socket.IO"
check_npm_package "apps/backend" "@supabase/supabase-js" "Backend: Supabase"
check_npm_package "apps/backend" "jsonwebtoken" "Backend: JWT"
check_npm_package "apps/backend" "bcryptjs" "Backend: Bcrypt"
check_npm_package "apps/admin-panel" "react" "Admin Panel: React"
check_npm_package "apps/admin-panel" "react-router-dom" "Admin Panel: React Router"
check_npm_package "apps/admin-panel" "socket.io-client" "Admin Panel: Socket.IO Client"
check_npm_package "apps/display-screen" "react" "Display Screen: React"
check_npm_package "apps/scoreboard" "react" "Scoreboard: React"
check_npm_package "apps/scoreboard" "react-router-dom" "Scoreboard: React Router"
echo ""

# Verify .env configuration
echo -e "${BLUE}10. Verifying Environment Configuration...${NC}"
if [ -f "apps/backend/.env" ]; then
    if grep -q "SUPABASE_URL=" apps/backend/.env && ! grep -q "SUPABASE_URL=your_" apps/backend/.env; then
        echo -e "${GREEN}✓${NC} Backend Supabase URL configured"
    else
        echo -e "${YELLOW}⚠${NC} Backend Supabase URL not configured"
        ((WARNINGS++))
    fi
    
    if grep -q "JWT_SECRET=" apps/backend/.env && ! grep -q "JWT_SECRET=your_" apps/backend/.env; then
        echo -e "${GREEN}✓${NC} Backend JWT secret configured"
    else
        echo -e "${YELLOW}⚠${NC} Backend JWT secret not configured"
        ((WARNINGS++))
    fi
fi
echo ""

# Check for syntax errors
echo -e "${BLUE}11. Checking for Critical Syntax Errors...${NC}"
if grep -r "# Post" apps/*/postcss.config.cjs 2>/dev/null; then
    echo -e "${RED}✗${NC} Found PostCSS files with shell comment syntax (should use //)"
    ((ERRORS++))
else
    echo -e "${GREEN}✓${NC} PostCSS files use correct comment syntax"
fi
echo ""

# Summary
echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Summary${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! System is ready to run.${NC}"
    echo ""
    echo -e "${GREEN}Next steps:${NC}"
    echo "1. Ensure Supabase project is set up and migrations are run"
    echo "2. Start backend: cd apps/backend && npm run dev"
    echo "3. Start admin panel: cd apps/admin-panel && npm run dev"
    echo "4. Start display screen: cd apps/display-screen && npm run dev"
    echo "5. Start scoreboard: cd apps/scoreboard && npm run dev"
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠  ${WARNINGS} warning(s) found.${NC}"
    echo -e "${GREEN}✓  No critical errors. System should work but review warnings.${NC}"
elif [ $ERRORS -le 5 ]; then
    echo -e "${YELLOW}⚠  ${ERRORS} error(s) and ${WARNINGS} warning(s) found.${NC}"
    echo -e "${YELLOW}Some issues detected. Please review and fix before running.${NC}"
else
    echo -e "${RED}✗  ${ERRORS} error(s) and ${WARNINGS} warning(s) found.${NC}"
    echo -e "${RED}Critical issues detected. Please fix errors before running.${NC}"
fi

echo ""
echo -e "${BLUE}For detailed setup instructions, see SETUP_CHECKLIST.md${NC}"
echo ""

exit $ERRORS
