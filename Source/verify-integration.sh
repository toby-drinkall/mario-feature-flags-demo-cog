#!/bin/bash

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     Devin API Integration - Verification Script             ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

checks_passed=0
checks_total=0

check_file() {
    checks_total=$((checks_total + 1))
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} Found: $1"
        checks_passed=$((checks_passed + 1))
    else
        echo -e "${RED}✗${NC} Missing: $1"
    fi
}

check_content() {
    checks_total=$((checks_total + 1))
    if grep -q "$2" "$1" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} $3"
        checks_passed=$((checks_passed + 1))
    else
        echo -e "${RED}✗${NC} $3"
    fi
}

echo "Checking files..."
echo "─────────────────────────────────────────────────────────────"
check_file "Source/cognition-dashboard-final.html"
check_file "Source/devin-api-config.js"
check_file "Source/test-devin-api.html"
check_file "Source/DEVIN_API_SETUP.md"
check_file "Source/INTEGRATION_FLOW.txt"
check_file "DEVIN_INTEGRATION_COMPLETE.md"
check_file "QUICK_START.md"

echo ""
echo "Checking integration..."
echo "─────────────────────────────────────────────────────────────"
check_content "Source/cognition-dashboard-final.html" "devin-api-config.js" "Dashboard loads API config"
check_content "Source/cognition-dashboard-final.html" "isDevinAPIConfigured" "API detection function exists"
check_content "Source/cognition-dashboard-final.html" "runRealAPIStep" "Real API step handler exists"
check_content "Source/cognition-dashboard-final.html" "useRealAPI" "Mode switching logic exists"

echo ""
echo "Checking API configuration..."
echo "─────────────────────────────────────────────────────────────"
if grep -q "YOUR_DEVIN_API_URL" "Source/devin-api-config.js"; then
    echo -e "${YELLOW}⚠${NC}  API URL not configured (will use simulation mode)"
else
    echo -e "${GREEN}✓${NC} API URL configured"
    checks_passed=$((checks_passed + 1))
fi

if grep -q "YOUR_API_KEY" "Source/devin-api-config.js"; then
    echo -e "${YELLOW}⚠${NC}  API Key not configured (will use simulation mode)"
else
    echo -e "${GREEN}✓${NC} API Key configured"
    checks_passed=$((checks_passed + 1))
fi

echo ""
echo "═════════════════════════════════════════════════════════════"
echo -e "Results: ${GREEN}${checks_passed}${NC}/${checks_total} checks passed"
echo ""

if [ $checks_passed -eq $checks_total ]; then
    echo -e "${GREEN}✓ All systems ready!${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Open Source/cognition-dashboard-final.html in browser"
    echo "  2. Try simulation mode (works immediately)"
    echo "  3. Configure API in Source/devin-api-config.js"
    echo "  4. Test with Source/test-devin-api.html"
    echo ""
    echo "Read QUICK_START.md for detailed instructions."
else
    echo -e "${YELLOW}⚠ Some checks failed${NC}"
    echo ""
    echo "Integration is partially complete."
    echo "Review the missing items above."
fi

echo "═════════════════════════════════════════════════════════════"
