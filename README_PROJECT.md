# Mario Feature Flag Management with Devin AI Automation

## 🎮 What This Project Is

This is a **feature flag management system** built on top of FullScreenMario (HTML5 Super Mario Bros remake). It demonstrates how to use **Devin AI** to automate the removal and management of feature flags in a real codebase.

## 🎯 The Goal

Create a lightweight dashboard that lets users:
1. ✅ See a list of existing feature flags (16 Mario mods)
2. ✅ Trigger Devin AI sessions to automatically remove feature flags
3. ✅ Create Pull Requests for review before merging changes
4. ✅ Track merge status and deployment state

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                 Feature Management Dashboard             │
│           (Source/cognition-dashboard-premium.html)      │
│                                                          │
│  • Lists 16 feature flags (Mario game mods)             │
│  • Toggle features on/off in real-time                   │
│  • Click "Remove" → Triggers Devin automation            │
│  • Click "Enable" → Makes feature permanent              │
│  • Shows PR status (merged/not merged)                   │
│  • Auto-detects PR merges via GitHub API                 │
└─────────────────────────────────────────────────────────┘
                           ↓
                    Communicates with
                           ↓
┌─────────────────────────────────────────────────────────┐
│                    Mario Game Window                     │
│              (Source/index.html)                         │
│                                                          │
│  • Full HTML5 Super Mario Bros game                      │
│  • ModAttacher system loads mods dynamically             │
│  • Features can be toggled on/off at runtime             │
│  • Dashboard connects via window.FSM.ModAttacher         │
└─────────────────────────────────────────────────────────┘
                           ↓
                    Features stored in
                           ↓
┌─────────────────────────────────────────────────────────┐
│                Feature Flag Definitions                  │
│              (Source/settings/mods.js)                   │
│                                                          │
│  • 16 feature flags defined as mods:                     │
│    - Bouncy Bounce (Mario landing causes jump)           │
│    - Dark is the Night (dark theme)                      │
│    - Earthquake! (landing causes screen shake)           │
│    - High Speed (14x faster running)                     │
│    - Invincibility (permanent star power)                │
│    - ... and 11 more                                     │
└─────────────────────────────────────────────────────────┘
```

## 🤖 How Devin Automation Works

### When you click "Remove" on a feature:

```
1. Dashboard sends request to Devin API
   ↓
2. Devin creates a new session
   ↓
3. Devin analyzes Source/settings/mods.js
   ↓
4. Devin creates backup file
   └─> backups/removed-{feature-name}-{timestamp}.json
   ↓
5. Devin removes feature code (e.g., lines 5-35)
   ↓
6. Devin validates changes
   └─> Runs: node -c Source/settings/mods.js
   ↓
7. Devin creates git branch
   └─> remove-{feature-name}
   ↓
8. Devin creates Pull Request on GitHub
   └─> PR #123: "Remove Bouncy Bounce permanently"
   ↓
9. Dashboard shows PR status
   └─> ⚠ Not merged yet
   ↓
10. You review and merge PR on GitHub
   ↓
11. Dashboard auto-detects merge (within 2 min)
   └─> ✓ Merged & deployed
   ↓
12. Feature is permanently removed from game
```

## 📁 Project Structure

```
mario-feature-flags-demo-cog/
├── Source/
│   ├── cognition-dashboard-premium.html    # Main dashboard UI
│   ├── index.html                           # Mario game entry point
│   ├── index.js                             # Game initialization
│   ├── devin-api-config.js                  # Devin API integration (git-ignored)
│   ├── devin-api-permanent-flags.js         # Enable/disable automation
│   ├── settings/
│   │   ├── mods.js                          # 16 feature flag definitions
│   │   ├── ui.js                            # Game UI config
│   │   └── ... (other game settings)
│   └── References/
│       └── ... (game engine libraries)
├── backups/                                  # Backup files (git-ignored)
├── package.json                              # Node dependencies & scripts
├── .github/workflows/deploy.yml              # Auto-deploy to GitHub Pages
└── Documentation/
    ├── WORKFLOW_EXPLAINED.md                # Complete workflow guide
    ├── AUTO_PR_DETECTION.md                 # PR status detection docs
    └── DEVIN_SETUP_INSTRUCTIONS.md          # Devin setup guide
```

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local Server
```bash
npm run dev
```

This opens:
- **Dashboard**: http://localhost:8000/cognition-dashboard-premium.html
- **Game**: http://localhost:8000/index.html

### 3. Connect Dashboard to Game
1. Open dashboard in browser
2. Click "Launch Game" button
3. Dashboard shows: ✅ Game Connected
4. Now you can toggle features in real-time!

### 4. Configure Devin API (Optional)
Edit `Source/devin-api-config.js`:
```javascript
config: {
    apiUrl: 'https://api.devin.ai/v1',  // Your Devin API endpoint
    apiKey: 'your-api-key-here'          // Your Devin API key
}
```

## 🎮 Dashboard Features

### Feature Testing Tab
- Lists all 16 active features
- Toggle switch: Enable/disable feature in game (instant)
- **Enable** button: Trigger Devin to permanently enable feature
- **Remove** button: Trigger Devin to permanently remove feature

### Enabled Features Tab
- Shows features that have PRs to permanently enable them
- Displays PR status (merged/not merged)
- **View PR** button: Opens GitHub PR
- **Return to Staging** button: Revert back to toggleable state

### Removed Features Tab
- Shows features that have PRs to remove them
- Displays PR status (merged/not merged)
- **View PR** button: Opens GitHub PR
- **Restore** button: Recover removed feature

## 🔄 Complete Workflow Example

### Scenario: Removing "Bouncy Bounce" Feature

1. **Open Dashboard**
   ```
   http://localhost:8000/cognition-dashboard-premium.html
   ```

2. **Launch Game**
   - Click "Launch Game" button
   - Wait for ✅ Game Connected status

3. **Test Feature**
   - Toggle "Bouncy Bounce" ON
   - Play game - Mario bounces on landing
   - Toggle OFF - bouncing stops

4. **Remove Feature Permanently**
   - Click "Remove" button
   - Devin modal appears
   - Click "Start Automation"
   - Watch 9 steps progress (~15 seconds)

5. **Review PR**
   - Dashboard shows: ⚠ Not merged yet
   - Click "View PR" button
   - GitHub opens showing code diff:
     ```diff
     - Lines 5-35: Bouncy Bounce mod definition
     ```

6. **Merge PR on GitHub**
   - Review changes
   - Click "Merge pull request"
   - Confirm merge

7. **Dashboard Auto-Updates**
   - Within 2 minutes: ✓ Merged & deployed
   - Message: "Feature has been permanently removed. Relaunch to see changes."

8. **Verify Removal**
   - Relaunch game
   - "Bouncy Bounce" is GONE from Modes menu
   - Feature no longer exists in codebase

## 🔧 Technical Details

### Real-Time Feature Toggling

**How it works:**
```javascript
// Dashboard communicates with game window
gameWindow.FSM.ModAttacher.toggleMod("Bouncy Bounce");

// Game immediately enables/disables feature
// No page reload needed
```

**Why it's instant:**
- Dashboard keeps reference to game window
- Direct JavaScript API calls
- ModAttacher system handles dynamic loading

### PR Merge Detection

**How it works:**
```javascript
// Poll GitHub API every 2 minutes
fetch('https://api.github.com/repos/owner/repo/pulls/123')

// Response includes merge status
{
  "merged": true,
  "state": "closed",
  "merged_at": "2025-12-18T23:45:00Z"
}

// Dashboard updates UI automatically
```

**Rate Limits:**
- GitHub allows 60 requests/hour (unauthenticated)
- Polling every 2 min = 30 requests/hour
- Can monitor ~2 PRs simultaneously

### Feature Flag Structure

Each feature is defined as a mod:
```javascript
{
    "name": "Bouncy Bounce",
    "description": "Mario landing causes him to jump.",
    "enabled": false,
    "events": {
        "onPlayerLanding": function(player) {
            player.yvel = -7;  // Make Mario bounce
        }
    }
}
```

When removed, this entire definition is deleted from `mods.js`.

## 📊 Dashboard States

| Tab | Meaning | PR Status | Game State |
|-----|---------|-----------|------------|
| **Feature Testing** | Feature is toggleable | No PR | Active, can toggle |
| **Enabled Features** | Devin created "enable" PR | Not merged yet | Still toggleable |
| **Enabled Features** | PR merged | ✓ Merged | Permanently enabled |
| **Removed Features** | Devin created "remove" PR | Not merged yet | Still in game |
| **Removed Features** | PR merged | ✓ Merged | Removed from game |

## 🎯 Key Concepts

### Dashboard Shows INTENT, Not Reality

**Before PR merge:**
- Dashboard: "⚠ Not merged yet"
- Reality: Code hasn't changed
- Game: Feature still exists

**After PR merge:**
- Dashboard: "✓ Merged & deployed"
- Reality: Code changed on master
- Game: Feature removed/enabled

### Three Types of "Enable"

1. **Toggle ON** (temporary)
   - Click toggle switch
   - Feature works in current session
   - Turns off when you reload game

2. **Add to Game UI** (user-controlled)
   - Click "Enable" in dashboard
   - Feature appears in game's Modes menu
   - User can toggle on/off in game

3. **Permanent Enable** (Devin automation)
   - Click "Enable" → Devin creates PR
   - After merge: Feature always on
   - Cannot be toggled off

## 📚 Documentation

- **[WORKFLOW_EXPLAINED.md](WORKFLOW_EXPLAINED.md)** - Visual workflow diagrams
- **[AUTO_PR_DETECTION.md](AUTO_PR_DETECTION.md)** - PR status detection details
- **[DEVIN_SETUP_INSTRUCTIONS.md](DEVIN_SETUP_INSTRUCTIONS.md)** - Complete Devin setup
- **[DEVIN_INTEGRATION_COMPLETE.md](DEVIN_INTEGRATION_COMPLETE.md)** - Integration summary

## 🚢 Deployment

### GitHub Pages (Automatic)

When you push to master:
1. GitHub Action triggers
2. Deploys `Source/` folder to `gh-pages` branch
3. Live at: `https://username.github.io/repo-name/`

### Manual Deploy

```bash
npm install -g http-server
http-server Source -p 8000
```

## 🔐 Security

### API Keys

`Source/devin-api-config.js` is git-ignored and contains:
- Devin API endpoint
- Devin API key
- Never committed to repository

### Backups

All removed features are backed up:
```json
{
  "type": "remove",
  "featureName": "Bouncy Bounce",
  "removedAt": "2025-12-18T23:45:00Z",
  "file": "Source/settings/mods.js",
  "lineStart": 5,
  "lineEnd": 35,
  "originalCode": "... full 31 lines ..."
}
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Or use different port
npx http-server Source -p 9000
```

### Dashboard Not Connecting to Game
1. Check both windows are open
2. Look for ✅ Game Connected status
3. Console should show: "FSM.ModAttacher available"

### PR Status Not Updating
- Wait 2 minutes (polling interval)
- Check GitHub API rate limits
- Verify PR number is correct

## 🎓 Learning Resources

This project demonstrates:
- ✅ Feature flag management
- ✅ AI-powered code automation (Devin)
- ✅ Real-time cross-window communication
- ✅ GitHub API integration
- ✅ Pull request workflow
- ✅ Automated backup/recovery

## 📝 License

MIT (inherited from FullScreenMario)

## 🙏 Credits

- **FullScreenMario** - Original game by Josh Goldberg
- **Devin AI** - Automated feature flag removal
- **Claude Code** - Dashboard and integration development

---

**Ready to automate your feature flags?** 🚀

1. `npm install`
2. `npm run dev`
3. Open dashboard
4. Click "Remove" on a feature
5. Watch Devin work its magic!
