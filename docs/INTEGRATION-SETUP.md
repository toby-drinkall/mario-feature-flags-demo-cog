# Mario Feature Flags Dashboard - Complete Integration Setup

**Last Updated:** December 22, 2024
**Branch:** `cognition-dashboard-devin-integration`
**Repository:** `toby-drinkall/mario-feature-flags-demo-cog`

---

## 🏗️ Architecture Overview

This project has a complete integration between:
- Local development → Git → GitHub → Devin API → Dashboard UI → Game

**Critical Understanding:**
- **NEVER edit files in root directory** - they are gitignored copies
- **ALWAYS edit `Source/` directory** - this is the source of truth
- **Server serves from `Source/`** - no copying needed
- **GitHub is the single source of truth** for merged changes

---

## 📁 File Structure & What Serves From Where

```
/Users/tobydrinkall/dev-mario/
├── Source/                                    ← SOURCE OF TRUTH (edit here!)
│   ├── cognition-dashboard-premium.html      ← Main dashboard (React app)
│   ├── devin-api-config.js                   ← Devin API wrapper
│   ├── settings/
│   │   ├── objects.js                        ← Physics constants (jumpmod, gravity, etc)
│   │   ├── mods.js                           ← Game mode features
│   │   └── ...
│   └── index.js                              ← Game entry point
│
├── dev-server.js                             ← Express server (port 8000)
│   │                                         ← Serves from Source/ directory
│   │                                         ← Handles /api/devin/* proxy
│   │                                         ← Handles /git-pull endpoint
│   └── Config: app.use(express.static('Source'))
│
├── watch-and-serve.js                        ← Auto-reload wrapper
│   │                                         ← Watches Source/ for changes
│   └── Auto-restarts dev-server.js on change (500ms debounce)
│
├── .gitignore
│   ├── /cognition-dashboard-premium.html    ← Root HTML is IGNORED
│   └── Source/dashboard-config.js           ← API keys ignored
│
└── .env                                      ← Devin API key (git-ignored)
    └── DEVIN_API_KEY=apk_user_...
```

### ⚠️ CRITICAL RULES

1. **NEVER** edit `cognition-dashboard-premium.html` in root - it's auto-generated/gitignored
2. **ALWAYS** edit `Source/cognition-dashboard-premium.html` - this is tracked in git
3. **Server serves from `Source/`** - no manual copying needed
4. **Root files are served at localhost:8000/** because express.static points to Source/

---

## 🚀 Complete Setup Verification Checklist

Run these steps **every time you start work** or **after context compilation**:

### Step 1: Verify Git Configuration

```bash
cd /Users/tobydrinkall/dev-mario
git remote -v
```

**Expected Output:**
```
origin   https://github.com/toby-drinkall/mario-feature-flags-demo-cog.git (fetch)
origin   https://github.com/toby-drinkall/mario-feature-flags-demo-cog.git (push)
personal https://github.com/toby-drinkall/mario-feature-flags-demo-cog.git (fetch)
personal https://github.com/toby-drinkall/mario-feature-flags-demo-cog.git (push)
```

**Current Branch:**
```bash
git branch --show-current
# Should output: cognition-dashboard-devin-integration
```

**Check if up to date:**
```bash
git status
# Should output: "Your branch is up to date with 'personal/cognition-dashboard-devin-integration'"
```

**If behind/ahead:**
```bash
git pull personal cognition-dashboard-devin-integration --no-rebase
git push personal cognition-dashboard-devin-integration
```

---

### Step 2: Verify Devin API Configuration

**Check .env file exists:**
```bash
ls -la .env
cat .env | grep DEVIN_API_KEY
```

**Expected Output:**
```
DEVIN_API_KEY=apk_user_ZW1haWx8NjkzNGIxYzVjYTkwY2JhNWQ3MWNkZDNlX29yZy02ODI3NzczYmQ3MTk0YzI0YTQyN2NkNGRiM2M4YmY2ZDozOGU3ZDU5NGYzNTI0MmU0OTYzNDNlOGIyNDJkY2QxZg==
```

**If missing:** Create `.env` file:
```bash
echo 'DEVIN_API_KEY=apk_user_ZW1haWx8NjkzNGIxYzVjYTkwY2JhNWQ3MWNkZDNlX29yZy02ODI3NzczYmQ3MTk0YzI0YTQyN2NkNGRiM2M4YmY2ZDozOGU3ZDU5NGYzNTI0MmU0OTYzNDNlOGIyNDJkY2QxZg==' > .env
```

**Verify API key is loaded in server:**
```bash
node -e "require('./dev-server.js')" 2>&1 | grep "Devin API proxy"
```

---

### Step 3: Start Watch Server (Recommended)

**Kill any existing servers:**
```bash
ps aux | grep -E "(dev-server|watch-and-serve)" | grep -v grep | awk '{print $2}' | xargs kill 2>/dev/null
```

**Start watch server (auto-reload on file changes):**
```bash
node watch-and-serve.js
```

**Or run in background:**
```bash
nohup node watch-and-serve.js > /tmp/watch-server.log 2>&1 &
```

**Verify running:**
```bash
ps aux | grep -E "(watch-and-serve|dev-server)" | grep -v grep
```

**Expected Output:**
```
tobydrinkall     12345   0.0  0.2 436207072  38688   ??  SN   2:21AM   0:00.06 node watch-and-serve.js
tobydrinkall     12346   0.0  0.4 444634048  64224   ??  SN   2:21AM   0:00.16 node ./dev-server.js
```

**Check logs if issues:**
```bash
tail -f /tmp/watch-server.log
```

---

### Step 4: Verify Dashboard Loads

**Test server endpoint:**
```bash
curl -I http://localhost:8000/cognition-dashboard-premium.html
```

**Expected Output:**
```
HTTP/1.1 200 OK
Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate
Content-Type: text/html; charset=UTF-8
```

**Check if latest code is served:**
```bash
curl -s http://localhost:8000/cognition-dashboard-premium.html | grep -A 2 "Currently Enabled"
```

**Should see:**
```html
<span className="text-emerald-400">Currently Enabled</span>
```

**Open in browser:**
```
http://localhost:8000/cognition-dashboard-premium.html
```

---

### Step 5: Verify Devin API Integration

**Test API proxy:**
```bash
curl -X GET http://localhost:8000/api/devin/_status
```

**Expected Output:**
```json
{"configured":true,"mode":"api","message":"Devin API Ready"}
```

**If configured=false:**
- Check .env file exists and has DEVIN_API_KEY
- Restart server: `kill <dev-server-pid> && node dev-server.js`

---

### Step 6: Verify Git Auto-Pull Endpoint

**Test git-pull endpoint:**
```bash
curl -X POST http://localhost:8000/git-pull
```

**Expected Output:**
```json
{"success":true,"message":"Git pull successful","output":"Already up to date.\n\nFrom https://github.com/toby-drinkall/mario-feature-flags-demo-cog\n * branch            cognition-dashboard-devin-integration -> FETCH_HEAD\n"}
```

**If error:** Check git remote 'personal' exists and is correct

---

## 🔄 Complete Integration Flow

### Development Workflow (Claude Code editing)

```
1. Edit: Source/cognition-dashboard-premium.html
   └─→ watch-and-serve.js detects change (within 500ms)
       └─→ dev-server.js restarts automatically
           └─→ Hard refresh browser (Cmd+Shift+R)
               └─→ See changes instantly!

2. Commit: git add Source/cognition-dashboard-premium.html
          git commit -m "Description"
          git push personal cognition-dashboard-devin-integration
   └─→ Changes now in GitHub
```

### Devin PR Workflow (Feature flag operations)

```
1. User clicks "Replace" button on dashboard for a feature flag
   └─→ Dashboard sends task to Devin API via /api/devin/*
       └─→ Devin creates new session, opens IDE
           └─→ Devin edits Source/settings/objects.js (or relevant files)
               └─→ Devin creates git branch: devin/[timestamp]-[task]
                   └─→ Devin commits changes
                       └─→ Devin creates PR to cognition-dashboard-devin-integration
                           └─→ PR appears on GitHub

2. User clicks "Check Merge" button on dashboard
   └─→ Dashboard polls GitHub API for PR status (10 attempts, 500ms apart)
       └─→ If merged: Dashboard calls POST /git-pull
           └─→ Server runs: git pull personal cognition-dashboard-devin-integration
               └─→ Server now has latest code in Source/
                   └─→ User reloads page (or auto-reloads)
                       └─→ Dashboard shows updated state
                           └─→ User can open game to see code changes
```

### GitHub Sync System

```
Dashboard auto-syncs with GitHub on page load:

1. Page loads → syncWithGitHub() runs
   └─→ Fetches all PRs from GitHub API
       └─→ Parses PR titles:
           ├─→ "Remove [name] feature flag" → pending removal
           ├─→ "Recover [name] feature flag" → pending restoration
           └─→ "Replace [old] with [new]" → pending replacement
       └─→ Processes PRs chronologically (oldest first)
           └─→ Tracks state transitions per feature
               └─→ Updates dashboard sections:
                   ├─→ Testing Game Modes
                   ├─→ Feature Flags
                   ├─→ Pending Removal
                   ├─→ Pending Restoration
                   └─→ Removed sections
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Dashboard Not Updating After Edit

**Symptoms:** Edit file, refresh browser, no changes visible

**Diagnosis:**
```bash
# Check if watch server is running
ps aux | grep watch-and-serve | grep -v grep

# Check server logs
tail -20 /tmp/watch-server.log

# Verify file timestamp changed
ls -l Source/cognition-dashboard-premium.html
```

**Solutions:**
1. **Hard refresh browser:** Cmd+Shift+R (Mac) or Ctrl+Shift+F5 (Windows)
2. **Restart watch server:**
   ```bash
   ps aux | grep watch-and-serve | grep -v grep | awk '{print $2}' | xargs kill
   node watch-and-serve.js
   ```
3. **Clear browser cache:** DevTools → Network → "Disable cache" checkbox
4. **Verify editing correct file:** MUST edit `Source/cognition-dashboard-premium.html`

### Issue 2: Devin API Not Working (Simulation Mode)

**Symptoms:** Dashboard shows "Simulation Mode" instead of "Devin API Ready"

**Diagnosis:**
```bash
# Check .env file
cat .env | grep DEVIN_API_KEY

# Test API status endpoint
curl http://localhost:8000/api/devin/_status
```

**Solutions:**
1. **Create/fix .env file:**
   ```bash
   echo 'DEVIN_API_KEY=apk_user_ZW1haWx8NjkzNGIxYzVjYTkwY2JhNWQ3MWNkZDNlX29yZy02ODI3NzczYmQ3MTk0YzI0YTQyN2NkNGRiM2M4YmY2ZDozOGU3ZDU5NGYzNTI0MmU0OTYzNDNlOGIyNDJkY2QxZg==' > .env
   ```
2. **Restart server** (it only loads .env on startup)
3. **Verify API key is valid** (test with curl to api.devin.ai)

### Issue 3: Git Pull Failing After PR Merge

**Symptoms:** "Check Merge" button shows error or "Not merged yet"

**Diagnosis:**
```bash
# Check git status
git status

# Try manual pull
git pull personal cognition-dashboard-devin-integration

# Check remote exists
git remote -v | grep personal
```

**Solutions:**
1. **Add personal remote if missing:**
   ```bash
   git remote add personal https://github.com/toby-drinkall/mario-feature-flags-demo-cog.git
   ```
2. **Resolve conflicts if any:**
   ```bash
   git pull personal cognition-dashboard-devin-integration --no-rebase
   # Resolve conflicts
   git add .
   git commit -m "Resolve merge conflicts"
   ```
3. **Force sync if needed:**
   ```bash
   git fetch personal
   git reset --hard personal/cognition-dashboard-devin-integration
   ```

### Issue 4: Dashboard Shows Stale Data (Wrong Features)

**Symptoms:** Features showing that shouldn't be there, or missing features

**Diagnosis:**
```bash
# Check localStorage
# Open browser console and run:
localStorage.getItem('removed_features')
localStorage.getItem('new_feature_flags')
```

**Solutions:**
1. **Click "Sync" button** on dashboard (forces GitHub sync)
2. **Clear localStorage:**
   ```javascript
   // In browser console:
   localStorage.clear()
   location.reload()
   ```
3. **Verify GitHub PRs match dashboard state:**
   - Go to: https://github.com/toby-drinkall/mario-feature-flags-demo-cog/pulls?q=is%3Apr
   - Compare with dashboard sections

### Issue 5: Server Not Starting (Port Already in Use)

**Symptoms:** `Error: listen EADDRINUSE: address already in use :::8000`

**Solutions:**
```bash
# Find process using port 8000
lsof -i :8000

# Kill the process
kill -9 <PID>

# Or kill all node servers
ps aux | grep node | grep -E "(dev-server|watch-and-serve)" | awk '{print $2}' | xargs kill
```

### Issue 6: Changes Committed But Not Visible on Dashboard

**Symptoms:** Git shows commit pushed, but dashboard unchanged

**Diagnosis:**
```bash
# Check what branch you're on
git branch --show-current

# Check if commit is in correct branch
git log --oneline -5

# Check if server pulled latest
cd /Users/tobydrinkall/dev-mario && git log --oneline -1
```

**Solutions:**
1. **Ensure on correct branch:**
   ```bash
   git checkout cognition-dashboard-devin-integration
   ```
2. **Pull latest from GitHub:**
   ```bash
   git pull personal cognition-dashboard-devin-integration
   ```
3. **Restart server** (watch-and-serve should auto-restart)
4. **Hard refresh browser**

---

## 🔍 Verification Commands

Run these to verify everything is connected:

```bash
# === Git Setup ===
git remote -v | grep personal
git branch --show-current  # Should be: cognition-dashboard-devin-integration
git status                 # Should be: "up to date"

# === Server Running ===
ps aux | grep -E "(watch-and-serve|dev-server)" | grep -v grep
curl -I http://localhost:8000/cognition-dashboard-premium.html

# === API Configuration ===
cat .env | grep DEVIN_API_KEY
curl http://localhost:8000/api/devin/_status | grep configured

# === Git Auto-Pull ===
curl -X POST http://localhost:8000/git-pull | grep success

# === Latest Code Served ===
curl -s http://localhost:8000/cognition-dashboard-premium.html | grep "Currently Enabled"
curl -s http://localhost:8000/cognition-dashboard-premium.html | grep '"gravity"'

# === Dashboard Sections ===
# Open http://localhost:8000/cognition-dashboard-premium.html
# Check for:
# - 4 feature flags: jumpmod, gravity, maxspeed, walkspeed
# - Stats counter shows: Total Features = 19 (15 game modes + 4 flags)
# - "Currently Enabled" shows toggled game modes + 4 active flags
```

---

## 📝 Important File Locations

### Source Files (Edit These!)
- Dashboard: `Source/cognition-dashboard-premium.html`
- Devin API: `Source/devin-api-config.js`
- Physics constants: `Source/settings/objects.js`
- Game modes: `Source/settings/mods.js`
- Game entry: `Source/index.js`

### Server Files
- Main server: `dev-server.js` (port 8000, serves from Source/)
- Watch server: `watch-and-serve.js` (auto-reload wrapper)
- API proxy: Lines 58-94 in dev-server.js
- Git pull: Lines 97-121 in dev-server.js

### Configuration
- API Key: `.env` (DEVIN_API_KEY)
- Git remotes: `.git/config`
- Gitignore: `.gitignore` (excludes root HTML, .env)

### Logs
- Watch server: `/tmp/watch-server.log`
- Browser console: Open DevTools → Console
- Server console: If running in foreground, see terminal

---

## 🎯 Quick Reference: What Lives Where

| What                          | Source of Truth | Served From | Edited By | Synced Via |
|-------------------------------|----------------|-------------|-----------|-----------|
| Dashboard HTML                | `Source/`      | `Source/`   | Claude    | Git       |
| Physics constants             | `Source/`      | `Source/`   | Devin     | Git + PR  |
| Game modes                    | `Source/`      | `Source/`   | Manual    | Git       |
| Feature flag definitions      | Dashboard HTML | Dashboard   | Claude    | Git       |
| Dashboard state (pending/removed) | localStorage | Browser | GitHub Sync | API |
| API Key                       | `.env`         | Server      | Manual    | N/A       |

---

## 🚨 Red Flags (Things That Mean Setup Is Wrong)

1. ❌ Editing `cognition-dashboard-premium.html` in root directory
2. ❌ Server running from root (should serve Source/)
3. ❌ Manually copying files between directories
4. ❌ Multiple servers running on port 8000
5. ❌ Git branch not `cognition-dashboard-devin-integration`
6. ❌ Git remote 'personal' missing or wrong URL
7. ❌ .env file missing DEVIN_API_KEY
8. ❌ Dashboard shows "Simulation Mode" (should be "Devin API Ready")
9. ❌ Changes to Source/ not appearing (watch server not running)
10. ❌ PRs going to wrong branch (should go to cognition-dashboard-devin-integration)

---

## 🎓 Key Concepts to Remember

### 1. Single Source of Truth
- **Code**: `Source/` directory (tracked in git)
- **State**: GitHub PRs (parsed by dashboard on sync)
- **Server**: Serves directly from `Source/` (no copying)

### 2. Three Layers of Caching
1. **Browser cache**: Clear with hard refresh (Cmd+Shift+R)
2. **Node.js cache**: Cleared by server restart (watch-and-serve does this)
3. **Git state**: Synced via git pull (dashboard calls /git-pull)

### 3. Two Ways to Deploy Changes
1. **Claude edits**: Edit Source/ → Auto-reload (watch-and-serve) → Refresh browser
2. **Devin edits**: Devin PR → Merge on GitHub → Check Merge button → git pull → Reload page

### 4. Dashboard Sync Mechanism
- **On page load**: Fetches all PRs from GitHub, parses titles, updates state
- **On "Sync" click**: Manually triggers sync
- **On "Check Merge"**: Polls for PR merge, then calls /git-pull, then syncs
- **State stored in**: localStorage (can be cleared to force resync)

### 5. API Integration Points
- `/api/devin/*`: Proxies to api.devin.ai (adds auth from .env)
- `/git-pull`: Pulls latest code from GitHub (called after PR merge)
- `/_status`: Checks if API key is configured

---

## 📋 Pre-Flight Checklist (Before Starting Work)

- [ ] Git branch: `cognition-dashboard-devin-integration`
- [ ] Git status: "up to date" (no uncommitted changes)
- [ ] Git remote 'personal' points to: `toby-drinkall/mario-feature-flags-demo-cog`
- [ ] `.env` file exists with valid DEVIN_API_KEY
- [ ] `watch-and-serve.js` is running (check with `ps aux`)
- [ ] Server accessible: `curl -I http://localhost:8000/cognition-dashboard-premium.html`
- [ ] API configured: `curl http://localhost:8000/api/devin/_status` shows `"configured":true`
- [ ] Latest code served: `curl http://localhost:8000/cognition-dashboard-premium.html | grep "gravity"`
- [ ] Dashboard loads in browser: http://localhost:8000/cognition-dashboard-premium.html
- [ ] Dashboard shows 4 feature flags (jumpmod, gravity, maxspeed, walkspeed)
- [ ] Dashboard shows "Devin API Ready" badge (not "Simulation Mode")

---

## 🆘 Emergency Recovery

If everything is broken and you need to start fresh:

```bash
# 1. Stop all servers
ps aux | grep node | awk '{print $2}' | xargs kill 2>/dev/null

# 2. Reset git to known good state
cd /Users/tobydrinkall/dev-mario
git fetch personal
git checkout cognition-dashboard-devin-integration
git reset --hard personal/cognition-dashboard-devin-integration

# 3. Verify .env exists
if [ ! -f .env ]; then
  echo 'DEVIN_API_KEY=apk_user_ZW1haWx8NjkzNGIxYzVjYTkwY2JhNWQ3MWNkZDNlX29yZy02ODI3NzczYmQ3MTk0YzI0YTQyN2NkNGRiM2M4YmY2ZDozOGU3ZDU5NGYzNTI0MmU0OTYzNDNlOGIyNDJkY2QxZg==' > .env
fi

# 4. Start watch server
node watch-and-serve.js

# 5. Clear browser cache and reload
# Open browser: http://localhost:8000/cognition-dashboard-premium.html
# Press Cmd+Shift+R (Mac) or Ctrl+Shift+F5 (Windows)

# 6. Clear localStorage (in browser console)
localStorage.clear()
location.reload()
```

---

## 📞 Integration Test Script

Save this as `test-integration.sh` and run it to verify everything:

```bash
#!/bin/bash

echo "🔍 Testing Mario Dashboard Integration..."
echo ""

# Test 1: Git Setup
echo "1️⃣  Git Configuration"
git remote -v | grep personal > /dev/null && echo "✅ Git remote 'personal' exists" || echo "❌ Git remote 'personal' missing"
[ "$(git branch --show-current)" = "cognition-dashboard-devin-integration" ] && echo "✅ Correct branch" || echo "❌ Wrong branch"
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
curl -s http://localhost:8000/api/devin/_status | grep '"configured":true' > /dev/null && echo "✅ API configured" || echo "❌ API not configured"
echo ""

# Test 4: Server Accessibility
echo "4️⃣  Server Accessibility"
curl -s -I http://localhost:8000/cognition-dashboard-premium.html | grep "200 OK" > /dev/null && echo "✅ Dashboard accessible" || echo "❌ Dashboard not accessible"
curl -s http://localhost:8000/cognition-dashboard-premium.html | grep "Currently Enabled" > /dev/null && echo "✅ Latest code served" || echo "❌ Old code served"
echo ""

# Test 5: Feature Flags
echo "5️⃣  Feature Flags Present"
curl -s http://localhost:8000/cognition-dashboard-premium.html | grep '"gravity"' > /dev/null && echo "✅ gravity flag" || echo "❌ gravity flag missing"
curl -s http://localhost:8000/cognition-dashboard-premium.html | grep '"maxspeed"' > /dev/null && echo "✅ maxspeed flag" || echo "❌ maxspeed flag missing"
curl -s http://localhost:8000/cognition-dashboard-premium.html | grep '"walkspeed"' > /dev/null && echo "✅ walkspeed flag" || echo "❌ walkspeed flag missing"
echo ""

echo "✅ Integration test complete!"
```

---

**End of Integration Setup Document**

**Version:** 1.0
**Maintained by:** Claude Code (Anthropic)
**Repository:** https://github.com/toby-drinkall/mario-feature-flags-demo-cog
