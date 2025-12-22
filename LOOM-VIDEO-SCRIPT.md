# 5-Minute Loom Video Script: Devin-Powered Feature Flag Automation

## 🎯 Overview (30 seconds)
"Welcome! Today I'm demonstrating an automated feature flag management system I built that uses Devin AI to manage code changes in a Mario Bros game. This dashboard lets me remove, recover, and replace feature flags with zero manual coding - Devin creates atomic pull requests, runs tests, and deploys changes automatically."

## 🏗️ Architecture Overview (1 minute)

### The Stack
"Let me show you the tech stack:
- **Frontend**: React dashboard with real-time game control
- **Backend**: Express.js server hosting from Source/ directory
- **AI Integration**: Devin API for automated code modifications
- **Git Workflow**: Atomic PRs to cognition-dashboard-devin-integration branch
- **GitHub Sync**: Dashboard polls GitHub API every page load to sync PR states"

### Key Decision: Why Devin?
"I chose Devin because feature flag operations require:
1. **Multi-file coordination** - A single feature flag like 'jumpmod' appears in 5+ files
2. **Test execution** - Every change must pass the test suite
3. **Atomic commits** - All files must change together
4. **Branch management** - Create branches, commit, push, create PR
5. **Human review** - PRs need approval before merge

Devin handles all of this autonomously. I just click a button."

## 📊 Dashboard Walkthrough (1.5 minutes)

### Two Tab System
"The dashboard has two tabs:
1. **Testing Game Modes** - Toggle-able features you can test in-game
2. **Feature Flags** - Physics constants that control game behavior

Let me show you the stats:
- Total Features: 19 (15 game modes + 4 feature flags)
- Currently Enabled: Dynamic count of active features
- Total Removed: Tracks deleted features"

### Feature States
"Features flow through these states:
- **Active** → Normal display with toggle/replace buttons
- **Pending Removal** → Yellow border, PR created but not merged
- **Removed** → Grayed out, code deleted from repo
- **Pending Restoration** → Blue border, recovery PR in progress"

## 🔴 Remove Button Demo (1 minute)

### Click Remove on "Bouncy Bounce"
"When I click Remove on a game mode:

**What happens in the dashboard:**
1. Modal appears showing 9-step automation progress
2. Each step updates with live status from Devin:
   - Initializing Devin session
   - Locating feature flag (finds lines 5-35 in Source/settings/mods.js)
   - Creating backup (JSON snapshot)
   - Removing 31 lines of code
   - Running test suite (all 47 tests)
   - Creating git branch: `remove-bouncy-bounce`
   - Committing changes
   - Creating PR to cognition-dashboard-devin-integration
   - Finalizing automation

3. PR link appears - click to see it on GitHub
4. 'Check Merge' button becomes available

**What Devin does behind the scenes:**
- Reads Source/settings/mods.js
- Deletes lines 5-35 (the mod definition)
- Runs the test suite: `grunt mocha_phantomjs` (47 tests total)
  * **3 Constructor Tests**: Verifies game initializes with small, large, and tiny screen sizes
  * **~20 Map Tests**: Loads all 33 Mario maps and their locations to verify no crashes
  * **24 Mod Tests**: Enables and disables each of the 12 game modes (like Bouncy Bounce, Luigi, Invincibility) to verify they work independently
- **Game Interaction Test**: Devin spawns a headless browser agent that:
  * Launches the game with the removed feature
  * Simulates keypresses (arrow keys, jump, sprint)
  * Verifies Mario can walk, jump, and collect coins
  * Confirms the removed feature is truly gone (e.g., Mario doesn't auto-bounce on landing)
  * Takes screenshots of the game state as proof
- All tests pass → Creates commit: 'Remove Bouncy Bounce feature flag'
- Pushes to GitHub
- Creates PR with description, test results, and game interaction screenshots

**Technical decision:** Why not auto-merge? I want human review before production deployment. The 'Check Merge' button lets me confirm the PR was merged on GitHub, then automatically moves the feature to 'Removed' state after 1.5 seconds."

## 🔵 Replace Button Demo (45 seconds)

### Click Replace on "jumpmod"
"Feature flag replacement is more complex:

**Replace Modal shows 3 inputs:**
1. **Current flag name:** jumpmod
2. **New flag name:** jumpmod_v2 (Tab auto-fills '_v2')
3. **Instruction:** 'Current value: 1.056. Note: lower = jump higher. Set to 0.528 for 2x jump height'

**What Devin does:**
1. Finds jumpmod = 1.056 in 5 files (objects.js, math.ts, math.js, maps.js, FullScreenMario.d.ts)
2. **Removes jumpmod completely** from all 5 files
3. **Adds jumpmod_v2 = 0.528** with new behavior (half the value = double jump height)
4. Updates all references (Source/settings/math.ts, math.js)
5. Runs all 47 tests to verify game still works
6. **Game Interaction Test**: Agent verifies Mario jumps exactly 2x higher by:
   * Measuring pixel distance of normal jump vs. new jump
   * Confirming Mario can now reach higher platforms
   * Screenshot proof of increased jump height
7. Creates atomic PR with all 5 files changed together
8. PR title: 'Replace jumpmod with jumpmod_v2'

**Why atomic?** If only 3 of 5 files changed, the game would crash with "jumpmod is undefined". Devin ensures all-or-nothing deployment - either all 5 files change together, or none do.

**Critical bug I fixed:** Devin was creating PRs to wrong branch (experiment/enhanced-jump-physics instead of cognition-dashboard-devin-integration). I fixed this by making the base branch instruction CRITICAL and repeating it 3 times in the prompt."

## 🟢 Recover Button Demo (30 seconds)

### Click Restore on removed feature
"Recovery reverses a removal:

**What Devin does:**
1. Loads backup JSON from removal step
2. Analyzes removal PR to understand what changed
3. Restores exact original code to all files
4. Runs tests to verify game still works
5. Creates recovery branch: `recover-bouncy-bounce`
6. Creates PR: 'Recover Bouncy Bounce feature flag'

**Special case - Recovering replaced flags:**
If I recover jumpmod (which was replaced by jumpmod_v2):
- Devin removes jumpmod_v2 completely (not tracked in dashboard)
- Restores jumpmod = 1.056
- Updates all references back to original
This handles the versioning automatically."

## 🔄 GitHub Sync System (30 seconds)

### Click the Sync button
"The Sync button polls GitHub's PR API and parses titles:
- **'Remove [name] feature flag'** → Mark as pending removal
- **'Recover [name] feature flag'** → Mark as pending restoration
- **'Replace [old] with [new]'** → Track replacement with new flag creation

**Why it's necessary:**
- Dashboard state is localStorage (survives page reload)
- GitHub is source of truth
- Auto-sync on page load prevents stale state
- Manual sync after merging a PR

**After clicking 'Check Merge':** It polls GitHub every 500ms for 5 seconds. When merge confirmed, it auto-pulls the git changes and prompts you to reload to see updated code."

## 🎓 Technical Decisions Summary (30 seconds)

### Key Choices
1. **React + localStorage** - Fast, survives reload, no database needed
2. **Devin for automation** - Handles multi-file, test execution, git workflow
3. **Atomic PRs** - All-or-nothing ensures game never breaks
4. **47-test suite** - 3 constructor + 20 map + 24 mod tests verify code quality
5. **Game interaction agent** - Devin spawns headless browser to actually play the game and verify changes work (not just unit tests!)
6. **Human review** - No auto-merge, PRs need approval
7. **GitHub as truth** - Dashboard syncs from GitHub, not the reverse
8. **Branch isolation** - All automations target cognition-dashboard-devin-integration
9. **Auto-complete merge** - After confirming PR merged, feature automatically moves to correct section (no manual sync)

### What I'd improve
- Add webhook listener instead of manual sync
- Visual diff preview before remove/replace
- Rollback button for merged changes
- Feature flag impact analysis (show dependent code)
- Record video of game interaction test (not just screenshots)

## 🎬 Closing (15 seconds)
"This system demonstrates AI-assisted development where:
- The human makes strategic decisions (what to change)
- AI handles tactical execution (how to change it safely)
- **AI verifies the change works** by actually playing the game (not just running unit tests!)
- Human reviews before production (merge approval)

The game interaction agent is the innovation here - Devin doesn't just modify code and run tests, it launches the game, simulates player input, and confirms the change works as intended. This is end-to-end AI testing.

Thanks for watching! Questions welcome."

---

## 📝 Demo Checklist

**Before recording:**
- [ ] Restart dev server: `node watch-and-serve.js`
- [ ] Open game in new window
- [ ] Verify Devin API configured (check badge says "Devin API Ready")
- [ ] Check git status clean
- [ ] Open GitHub repo in separate tab
- [ ] Clear browser cache (Cmd+Shift+R)

**During recording:**
- [ ] Show browser at http://localhost:8000/cognition-dashboard-premium.html
- [ ] Toggle game mode to show "Currently Enabled" indicator
- [ ] Click Remove, show full automation modal
- [ ] Click View PR link to show GitHub
- [ ] Show Check Merge button workflow
- [ ] Show Feature Flags tab with Replace modal
- [ ] Fill in replacement form (use Tab for auto-fill)
- [ ] Show PR created on GitHub
- [ ] Click Sync button to demonstrate sync behavior

**After recording:**
- [ ] Link to GitHub repo in description
- [ ] Link to Devin docs: https://docs.devin.ai
- [ ] Add timestamps in comments
- [ ] Tag: #devin #ai-automation #feature-flags #react
