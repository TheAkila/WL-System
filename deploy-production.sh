#!/bin/bash

echo "🚀 Deploying WL System to Production..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "${YELLOW}⚠️  Vercel CLI not found. Installing...${NC}"
    npm install -g vercel
fi

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "${BLUE}Step 1: Deploying Backend...${NC}"
echo ""

cd apps/backend
vercel --prod

if [ $? -eq 0 ]; then
    echo "${GREEN}✅ Backend deployed successfully!${NC}"
    echo ""
else
    echo "❌ Backend deployment failed. Please check the errors above."
    exit 1
fi

echo "${BLUE}Step 2: Deploying Admin Panel...${NC}"
echo ""

cd ../admin-panel
vercel --prod

if [ $? -eq 0 ]; then
    echo "${GREEN}✅ Admin Panel deployed successfully!${NC}"
    echo ""
else
    echo "❌ Admin Panel deployment failed. Please check the errors above."
    exit 1
fi

echo "${GREEN}🎉 Deployment Complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Copy your deployment URLs from above"
echo "2. Update environment variables in Vercel dashboard"
echo "3. Update CORS settings in backend if needed"
echo "4. Test both services"
echo ""
echo "Documentation: DEPLOYMENT_COMPLETE_GUIDE.md"
