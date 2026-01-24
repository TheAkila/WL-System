#!/bin/bash

# Vercel Environment Variables Setup Script
# This script adds all required environment variables to your Vercel project

echo "🚀 WL-System Vercel Environment Setup"
echo "======================================"
echo ""

# Prompt user for values
read -p "Enter SUPABASE_URL: " SUPABASE_URL
read -p "Enter SUPABASE_SERVICE_KEY: " SUPABASE_SERVICE_KEY
read -p "Enter SUPABASE_ANON_KEY: " SUPABASE_ANON_KEY
read -p "Enter JWT_SECRET: " JWT_SECRET
read -p "Enter SOCKET_IO_CORS_ORIGIN (comma-separated URLs): " SOCKET_IO_CORS_ORIGIN
read -p "Enter VITE_API_URL (for frontend apps): " VITE_API_URL
read -p "Enter VITE_SOCKET_URL (for frontend apps): " VITE_SOCKET_URL

echo ""
echo "📝 Adding environment variables to Vercel..."
echo ""

# Backend environment variables
echo "Setting backend environment variables..."
vercel env add SUPABASE_URL --value "$SUPABASE_URL" production preview
vercel env add SUPABASE_SERVICE_KEY --value "$SUPABASE_SERVICE_KEY" production preview
vercel env add SUPABASE_ANON_KEY --value "$SUPABASE_ANON_KEY" production preview
vercel env add JWT_SECRET --value "$JWT_SECRET" production preview
vercel env add SOCKET_IO_CORS_ORIGIN --value "$SOCKET_IO_CORS_ORIGIN" production preview
vercel env add NODE_ENV --value "production" production

# Frontend environment variables
echo "Setting frontend environment variables..."
vercel env add VITE_API_URL --value "$VITE_API_URL" production preview
vercel env add VITE_SOCKET_URL --value "$VITE_SOCKET_URL" production preview
vercel env add VITE_SUPABASE_URL --value "$SUPABASE_URL" production preview
vercel env add VITE_SUPABASE_ANON_KEY --value "$SUPABASE_ANON_KEY" production preview

echo ""
echo "✅ Environment variables added!"
echo ""
echo "Next steps:"
echo "1. Go to Vercel dashboard and verify all variables are set"
echo "2. Run: vercel --prod"
echo "3. Redeploy all frontend apps after backend is deployed"
