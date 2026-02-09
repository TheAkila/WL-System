#!/bin/bash

echo "🏗️  Building WL System for Production..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Build Admin Panel
echo "${BLUE}Building Admin Panel...${NC}"
cd apps/admin-panel

if npm run build; then
    echo "${GREEN}✅ Admin Panel built successfully${NC}"
    echo "   Output: apps/admin-panel/dist/"
    echo ""
else
    echo "${RED}❌ Admin Panel build failed${NC}"
    exit 1
fi

# Test build locally
echo "${YELLOW}To test the production build locally:${NC}"
echo "   cd apps/admin-panel"
echo "   npx vite preview --port 4173"
echo "   Then open: http://localhost:4173"
echo ""

# Backend doesn't need building (Node.js)
echo "${BLUE}Backend Configuration:${NC}"
echo "   ✓ No build step required (Node.js)"
echo "   ✓ Entry point: apps/backend/api/index.js"
echo "   ✓ Vercel config: apps/backend/vercel.json"
echo ""

echo "${GREEN}🎉 Build Complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Test admin panel build: npx vite preview"
echo "2. Deploy with: ./deploy-production.sh"
echo "3. Or deploy separately:"
echo "   - Backend: cd apps/backend && vercel --prod"
echo "   - Admin Panel: cd apps/admin-panel && vercel --prod"
