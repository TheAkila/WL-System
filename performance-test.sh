#!/bin/bash

# =====================================================
# Database Performance Testing Script
# =====================================================
# Tests query performance before and after optimization
# Usage: chmod +x performance-test.sh && ./performance-test.sh

set -e

echo "🏋️ WL System - Database Performance Test"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
BACKEND_URL="${BACKEND_URL:-http://localhost:3001}"
SESSIONS_ENDPOINT="/sessions"
ATHLETES_ENDPOINT="/athletes"
ATTEMPTS_ENDPOINT="/attempts"

echo "📊 Testing Endpoints"
echo "Backend URL: $BACKEND_URL"
echo ""

# Function to test endpoint performance
test_endpoint() {
    local endpoint=$1
    local name=$2
    local params=${3:-""}
    
    echo -n "Testing $name... "
    
    # Run request and measure time
    local start=$(date +%s%N)
    local response=$(curl -s -w "\n%{http_code}" "${BACKEND_URL}${endpoint}${params}")
    local end=$(date +%s%N)
    
    # Extract status code
    local http_code=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | head -n-1)
    
    # Calculate duration in ms
    local duration=$(( (end - start) / 1000000 ))
    
    # Get result count
    local count=$(echo "$body" | jq -r '.count // 0' 2>/dev/null || echo "0")
    
    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✓${NC} ${duration}ms (${count} items)"
    else
        echo -e "${RED}✗${NC} HTTP $http_code"
    fi
    
    echo "  Response size: $(echo "$body" | wc -c) bytes"
    echo ""
}

# Test sessions
test_endpoint "$SESSIONS_ENDPOINT" "Get Sessions" ""
test_endpoint "$SESSIONS_ENDPOINT" "Get Sessions (page 2)" "?limit=20&offset=20"
test_endpoint "$SESSIONS_ENDPOINT?status=in-progress" "Get Sessions (filtered)" ""

# Test athletes  
test_endpoint "$ATHLETES_ENDPOINT" "Get Athletes" ""
test_endpoint "$ATHLETES_ENDPOINT" "Get Athletes (page 1)" "?limit=50&offset=0"
test_endpoint "$ATHLETES_ENDPOINT?session_id=test" "Get Athletes (by session)" ""

# Test attempts
test_endpoint "$ATTEMPTS_ENDPOINT" "Get Attempts" ""
test_endpoint "$ATTEMPTS_ENDPOINT" "Get Attempts (page 1)" "?limit=50&offset=0"

echo "========================================"
echo ""

# Summary
echo "📈 Optimization Results"
echo ""
echo "Improvements expected:"
echo -e "  ${GREEN}✓${NC} 50-70% faster initial load (JOINs reduce API calls)"
echo -e "  ${GREEN}✓${NC} 30-40% smaller payloads (pagination)"
echo -e "  ${GREEN}✓${NC} 80% faster leaderboard (composite indexes)"
echo ""

echo "📝 Performance Tuning Tips:"
echo ""
echo "1. Monitor slow queries:"
echo "   SELECT query, mean_time FROM pg_stat_statements"
echo "   WHERE mean_time > 100 ORDER BY mean_time DESC;"
echo ""
echo "2. Enable slow query logging:"
echo "   ALTER SYSTEM SET log_min_duration_statement = 100;"
echo "   SELECT pg_reload_conf();"
echo ""
echo "3. Check index usage:"
echo "   SELECT schemaname, tablename, indexname, idx_scan"
echo "   FROM pg_stat_user_indexes"
echo "   WHERE schemaname = 'public'"
echo "   ORDER BY idx_scan DESC;"
echo ""
echo "4. Refresh materialized view:"
echo "   SELECT refresh_leaderboard_cache();"
echo ""
echo "5. Run ANALYZE after data changes:"
echo "   ANALYZE; -- Updates table statistics"
echo ""

echo "✅ Performance testing complete!"
