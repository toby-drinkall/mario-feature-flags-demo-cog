# 5-Minute Loom Video Script: Devin-Powered Feature Flag Automation

## 🎯 Opening (30 seconds)
"I built a full-stack feature flag management dashboard for a Mario Bros game with automated code modifications through Devin AI.

**Tech Stack:**
- Frontend: Pure React with Tailwind CSS
- Backend: Local server connecting to Devin API and GitHub API
- Why Devin? Multi-file coordination, test execution, and automated PR creation - I just click a button."

---

## 📊 Dashboard Overview (30 seconds)

**Two Tab System:**
1. **Testing Game Modes** - Toggleable features that players can select from in-game menu
2. **Feature Flags** - Physics constants in the code (gravity, jump height, speed)

**Stats:**
- Total Features: All flags we can remove, replace, or recover via dashboard
- Currently Enabled: Features actively affecting game physics, appearance, or gameplay

**Intermediary States:**
- Pending Removal (yellow) - PR created, awaiting merge
- Pending Restoration (blue) - Recovery PR in progress
- Removed (grayed) - Code deleted, can be recovered

---

## 🔴 Remove Demo - Bouncy Bounce (2 minutes)

### Before Clicking Remove
"Before any automation, Devin runs a full test suite including linting and actually plays the game with a headless browser to verify the change works."

### Show Bouncy Bounce in Game
[Toggle it on to show the bounce effect]

### Click Remove
"This is a straightforward automation - let me show you exactly what Devin does based on the prompt I designed:

**The Prompt:**
1. Locate feature flag in Source/settings/mods.js (lines 5-35)
2. Create backup
3. Remove feature code (31 lines deleted)
4. Run tests (linting + game interaction)
5. Create branch: remove-bouncy-bounce
6. Commit changes
7. Create PR to cognition-dashboard-devin-integration
8. Finalize

**Dashboard Modal:**
- Shows live progress from Devin's session
- Click the Devin session link to watch Devin work in real-time (you never have to interact with Devin directly)
- Each step updates as Devin sends progress messages"

### View PR
[Click PR link]
"PR created with all changes - ready for review."

### Check Merge Button
"After clicking 'Check Merge', it polls GitHub every 500ms for 5 seconds. When merge detected, it auto-pulls git changes."

[Merge PR on GitHub, click Check Merge]

### Show Game
[Reload game, show Bouncy Bounce no longer in menu]
"Feature completely removed from the game."

---

## 🟢 Recover Demo - Bouncy Bounce (45 seconds)

### Click Restore
"Recovery is different - Devin doesn't just paste code back. Based on my recovery prompt, Devin:

**The Recovery Process:**
1. Load backup file
2. Analyze the removal PR #[number] on GitHub to understand what was deleted
3. Restore exact original code to Source/settings/mods.js
4. Run tests + game interaction
5. Create branch: recover-bouncy-bounce
6. Commit and create PR

The key difference: Devin analyzes git history and intelligently reverses the previous automation."

[View PR, merge, show game has feature back]

---

## 🔵 Replace Demo - jumpmod (1.5 minutes)

### Introduce Feature Flags Tab
"Feature Flags are different from game modes - they're physics constants affecting how Mario moves. Replacing them is significantly more complex because one constant appears in 5+ interdependent files.

Let me show you the most impressive automation."

### Click Replace on jumpmod
"The modal has 3 input boxes:

**Why 3 boxes?**
1. Current flag name: jumpmod
2. New flag name: jumpmod_v2 (press Tab for auto-fill with '_v2')
3. Instruction: 'Current value: 1.056. Note: lower = jump higher. Set to 0.528 for 2x jump height'

The instruction affects the prompt Devin receives - Devin must calculate the new value based on the physics relationship."

### Explain What Devin Does
"Based on my replace prompt, Devin performs a complex multi-phase automation:

**The Replace Process:**
1. **Analyze Codebase** - Find jumpmod in 5 files (objects.js, math.ts, math.js, maps.js, FullScreenMario.d.ts)
2. **Create Backups** - Save original state of all 5 files
3. **Remove Old Constant** - Delete jumpmod entirely (allows it to appear in 'Removed' section for future recovery)
4. **Add New Constant** - Calculate jumpmod_v2 = 0.528 using inverse physics relationship (lower = higher jump)
5. **Update References** - Migrate all code from jumpmod → jumpmod_v2 across 5 files
6. **Run Tests** - Lint all files + play game to verify 2x jump height
7. **Create Atomic PR** - All 5 files commit together or fail together

This is code deletion, NEW code creation, AND multi-file dependency management - not just deletion like Remove."

[View PR showing all 5 files changed]

### Show Game with jumpmod_v2
[Launch game, show HUD displaying jumpmod_v2]
"The heads-up display confirms jumpmod_v2 is active. Watch Mario jump."

[Play game, demonstrate 2x jump height, capture flag]
"Mario can now reach platforms that were previously impossible - the game mechanics fundamentally changed through automation."

---

## 🔄 Caching Bug & Solution (30 seconds)

"I ran into a Chrome/Safari caching bug where the browser aggressively cached API responses and JavaScript files. After merging PRs on GitHub, the dashboard still showed 'Pending' states because it served stale cached data.

**Multi-Layered Solution:**

1. **Client-Side Meta Tags** - HTML headers tell browser: never cache this page
   ```
   Cache-Control: no-cache, no-store, must-revalidate
   ```

2. **Server-Side Middleware** - Express.js intercepts ALL .js and .html requests, adds no-cache headers before serving files
   - Even if browser ignores meta tags, server forces fresh content

3. **GitHub Sync Button** - Directly polls GitHub API, completely bypasses browser cache

4. **Auto-Sync on Load** - React useEffect runs GitHub sync immediately when dashboard loads

5. **Git Auto-Pull** - After PR merge, dashboard triggers server endpoint that runs `git pull` to fetch latest code

This guarantees the dashboard always reflects true PR state and serves fresh code."

---

## 🎯 Future Improvements (30 seconds)

"Things I'd improve:

1. **Multiple Concurrent Automations** - Handle multiple operations without switching tabs, show progress as percentage so you can do other tasks

2. **Cleaner Removal Approach** - Instead of deleting 30-100 lines of code and saving backups in separate files, add a simple `enabled: true/false` property to feature definitions. Toggle it off to disable, keep the code in place for cleaner recovery.

Thanks for watching - questions welcome!"

---

## 📝 Demo Checklist

**Before recording:**
- [ ] Restart dev server: `node watch-and-serve.js`
- [ ] Open game in new window
- [ ] Verify Devin API configured
- [ ] Check git status clean
- [ ] Open GitHub repo in separate tab
- [ ] Clear browser cache (Cmd+Shift+R)

**During recording:**
- [ ] Dashboard at http://localhost:8000/cognition-dashboard-premium.html
- [ ] Show Bouncy Bounce toggle in game
- [ ] Click Remove, show automation modal with live Devin session link
- [ ] View PR, merge, show Check Merge button
- [ ] Show game without feature
- [ ] Click Restore, view PR, merge
- [ ] Show Feature Flags tab
- [ ] Click Replace on jumpmod, show 3-box modal
- [ ] View PR with 5 files changed
- [ ] Show game HUD with jumpmod_v2
- [ ] Play game to capture flag demonstrating higher jump
- [ ] Click Sync button to demonstrate GitHub sync

**After recording:**
- [ ] Link to GitHub repo in description
- [ ] Add timestamps in comments
- [ ] Tag: #devin #ai-automation #feature-flags #react
