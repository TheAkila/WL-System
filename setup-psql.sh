#!/bin/bash
# Quick Setup: Configure psql for Supabase

echo "🔧 Supabase psql Configuration"
echo "==============================="
echo ""

# Check if psql is installed
if ! command -v psql &> /dev/null; then
    echo "❌ psql not found. Installing..."
    brew install postgresql@15
    echo ""
fi

echo "✅ psql found: $(psql --version)"
echo ""

# Load .env from backend
ENV_FILE="apps/backend/.env"

if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Error: $ENV_FILE not found"
    exit 1
fi

# Source the .env file
set -a
source "$ENV_FILE"
set +a

# Check if DATABASE_URL exists
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  DATABASE_URL not found in .env"
    echo ""
    echo "📋 Your connection string should be:"
    echo ""
    echo "DATABASE_URL=postgresql://postgres:[PASSWORD]@db.axhbgtkdvghjxtrcvbkc.supabase.co:5432/postgres"
    echo ""
    echo "📍 Get your password from:"
    echo "   https://supabase.com/dashboard → Settings → Database"
    echo ""
    echo "📝 Add it to: apps/backend/.env"
    exit 1
fi

echo "✅ DATABASE_URL found in .env"
echo ""

# Test connection
echo "🔌 Testing connection..."
if psql "$DATABASE_URL" -c "SELECT current_database();" &> /dev/null; then
    echo "✅ Connected successfully!"
    echo ""
    
    # Show database info
    echo "📊 Database Info:"
    psql "$DATABASE_URL" -c "SELECT current_database() as database, current_user as user, version();" 2>/dev/null
    echo ""
    
    echo "🚀 Ready to run migrations!"
    echo ""
    echo "To apply IWF migration, run:"
    echo "  cd database/migrations"
    echo "  psql \"\$DATABASE_URL\" < APPLY_THIS_IN_SUPABASE.sql"
    echo ""
else
    echo "❌ Connection failed"
    echo ""
    echo "🔍 Possible issues:"
    echo "  - Incorrect password in DATABASE_URL"
    echo "  - IP not allowed (check Supabase dashboard)"
    echo "  - Database not accessible"
    echo ""
    echo "💡 Try Supabase SQL Editor instead:"
    echo "   https://supabase.com/dashboard → SQL Editor"
    exit 1
fi
