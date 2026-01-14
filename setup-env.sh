#!/bin/bash

# Lifting Live Arena - Environment Setup Script
# This script helps you quickly set up environment files for all apps

set -e

echo "🏋️  Lifting Live Arena - Environment Setup"
echo "==========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: Please run this script from the project root directory${NC}"
    exit 1
fi

echo -e "${BLUE}This script will help you set up environment variables for all apps.${NC}"
echo ""

# Get Supabase credentials
echo -e "${YELLOW}Step 1: Supabase Configuration${NC}"
echo "Please enter your Supabase project details:"
echo "(You can find these in: Supabase Dashboard > Project Settings > API)"
echo ""

read -p "Supabase Project URL (https://xxxxx.supabase.co): " SUPABASE_URL
read -p "Supabase Anon/Public Key: " SUPABASE_ANON_KEY
read -sp "Supabase Service Role Key (hidden): " SUPABASE_SERVICE_ROLE_KEY
echo ""
echo ""

# Generate JWT secret
echo -e "${YELLOW}Step 2: Generating JWT Secret...${NC}"
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
echo -e "${GREEN}✓ JWT Secret generated${NC}"
echo ""

# Set up backend .env
echo -e "${YELLOW}Step 3: Creating backend environment file...${NC}"
cat > apps/backend/.env << EOF
# Supabase Configuration
SUPABASE_URL=$SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY
SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY

# Server Configuration
PORT=5000
NODE_ENV=development

# Socket.IO Configuration
SOCKET_IO_CORS_ORIGIN=http://localhost:3000,http://localhost:3001,http://localhost:3002

# JWT Configuration
JWT_SECRET=$JWT_SECRET
JWT_EXPIRE=7d

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
EOF
echo -e "${GREEN}✓ Backend .env created${NC}"

# Set up admin-panel .env
echo -e "${YELLOW}Step 4: Creating admin panel environment file...${NC}"
cat > apps/admin-panel/.env << EOF
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
EOF
echo -e "${GREEN}✓ Admin Panel .env created${NC}"

# Set up display-screen .env
echo -e "${YELLOW}Step 5: Creating display screen environment file...${NC}"
cat > apps/display-screen/.env << EOF
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
EOF
echo -e "${GREEN}✓ Display Screen .env created${NC}"

# Set up scoreboard .env
echo -e "${YELLOW}Step 6: Creating scoreboard environment file...${NC}"
cat > apps/scoreboard/.env << EOF
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
EOF
echo -e "${GREEN}✓ Scoreboard .env created${NC}"

echo ""
echo -e "${GREEN}=========================================="
echo "✅ Environment setup complete!"
echo -e "==========================================${NC}"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "1. Run database migrations in Supabase SQL Editor"
echo "   - Copy contents of: database/schema.sql"
echo "   - Then: database/migrations/001_lifting_order.sql"
echo "   - Then: database/migrations/002_official_ranking_medals.sql"
echo ""
echo "2. Enable Realtime in Supabase Dashboard"
echo "   - Go to Database > Replication"
echo "   - Enable for: attempts, athletes, sessions"
echo ""
echo "3. Start the applications:"
echo "   Terminal 1: cd apps/backend && npm install && npm run dev"
echo "   Terminal 2: cd apps/admin-panel && npm install && npm run dev"
echo "   Terminal 3: cd apps/display-screen && npm install && npm run dev"
echo "   Terminal 4: cd apps/scoreboard && npm install && npm run dev"
echo ""
echo -e "${YELLOW}⚠️  Important: Keep your .env files secure and never commit them to Git${NC}"
echo ""
