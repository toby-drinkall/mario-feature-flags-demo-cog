#!/bin/bash

echo "🔍 Testing Mario Dashboard Integration..."
echo ""

# Test 1: Git Setup
echo "1️⃣  Git Configuration"
git remote -v | grep personal > /dev/null && echo "✅ Git remote 'personal' exists" || echo "❌ Git remote 'personal' missing"
[ "$(git branch --show-current)" = "cognition-dashboard-devin-integration" ] && echo "✅ Correct branch" || echo "❌ Wrong branch"
git status | grep "up to date" > /dev/null && echo "✅ Branch up to date" || echo "⚠️  Branch not up to date (pull needed?)"
echo ""

# Test 2: Server Running
echo "2️⃣  Server Status"
ps aux | grep watch-and-serve | grep -v grep > /dev/null && echo "✅ Watch server running" || echo "❌ Watch server not running"
ps aux | grep dev-server.js | grep -v grep > /dev/null && echo "✅ Dev server running" || echo "❌ Dev server not running"
echo ""

# Test 3: API Configuration
echo "3️⃣  API Configuration"
[ -f .env ] && echo "✅ .env file exists" || echo "❌ .env file missing"
grep DEVIN_API_KEY .env > /dev/null 2>&1 && echo "✅ API key in .env" || echo "❌ API key missing"
curl -s http://localhost:8000/api/devin/_status | grep '"configured":true' > /dev/null && echo "✅ API configured in server" || echo "❌ API not configured"
echo ""

# Test 4: Server Accessibility
echo "4️⃣  Server Accessibility"
curl -s -I http://localhost:8000/cognition-dashboard-premium.html | grep "200 OK" > /dev/null && echo "✅ Dashboard accessible" || echo "❌ Dashboard not accessible"
curl -s -I http://localhost:8000/cognition-dashboard-premium.html | grep "no-cache" > /dev/null && echo "✅ Cache disabled" || echo "⚠️  Cache headers not set"
curl -s http://localhost:8000/cognition-dashboard-premium.html | grep "Currently Enabled" > /dev/null && echo "✅ Latest code served (game modes)" || echo "❌ Old code served"
echo ""

# Test 5: Feature Flags
echo "5️⃣  Feature Flags Present"
curl -s http://localhost:8000/cognition-dashboard-premium.html | grep '"gravity"' > /dev/null && echo "✅ gravity flag found" || echo "❌ gravity flag missing"
curl -s http://localhost:8000/cognition-dashboard-premium.html | grep '"maxspeed"' > /dev/null && echo "✅ maxspeed flag found" || echo "❌ maxspeed flag missing"
curl -s http://localhost:8000/cognition-dashboard-premium.html | grep '"walkspeed"' > /dev/null && echo "✅ walkspeed flag found" || echo "❌ walkspeed flag missing"
curl -s http://localhost:8000/cognition-dashboard-premium.html | grep '"jumpmod"' > /dev/null && echo "✅ jumpmod flag found" || echo "❌ jumpmod flag missing"
echo ""

# Test 6: Git Pull Endpoint
echo "6️⃣  Git Auto-Pull"
curl -s -X POST http://localhost:8000/git-pull | grep '"success":true' > /dev/null && echo "✅ Git pull endpoint working" || echo "❌ Git pull endpoint failed"
echo ""

# Test 7: Source Files
echo "7️⃣  Source Files"
[ -f Source/cognition-dashboard-premium.html ] && echo "✅ Source dashboard exists" || echo "❌ Source dashboard missing"
[ -f Source/devin-api-config.js ] && echo "✅ Devin API config exists" || echo "❌ Devin API config missing"
[ -f dev-server.js ] && echo "✅ Dev server exists" || echo "❌ Dev server missing"
[ -f watch-and-serve.js ] && echo "✅ Watch server exists" || echo "❌ Watch server missing"
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 Integration Test Complete!"
echo ""
echo "📍 Dashboard URL: http://localhost:8000/cognition-dashboard-premium.html"
echo "📍 Git Branch: $(git branch --show-current)"
echo "📍 Working Directory: $(pwd)"
echo ""
echo "💡 If any tests failed, see INTEGRATION-SETUP.md for solutions"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
