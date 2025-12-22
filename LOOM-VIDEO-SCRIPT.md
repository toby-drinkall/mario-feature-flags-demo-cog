# 5-Minute Loom Video Script: Devin-Powered Feature Flag Automation

## 🎯 Overview (30 seconds)
"Welcome! Today I'm demonstrating an automated feature flag management system I built that uses Devin AI to manage code changes in a Mario Bros game. This dashboard lets me remove, recover, and replace feature flags with zero manual coding - Devin creates atomic pull requests, runs tests, and deploys changes automatically.

What's impressive is the **Replace** operation - Devin must understand code dependencies across 5 different files, remove old code, write new code, migrate all references, and verify the changes work by actually playing the game. This is enterprise-level refactoring done autonomously."

## 🏗️ Architecture Overview (1 minute)

### The Stack
"Let me show you the tech stack:
- **Frontend**: Pure React (no framework) with Tailwind CSS and Framer Motion
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
- Reads Source/settings/mods.js (single file)
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

**This is straightforward** - single file, pure deletion, no dependencies."

## 🟢 Recover Button Demo (45 seconds)

### Click Restore on removed feature
"Recovery adds complexity - Devin must reverse the removal:

**What Devin does:**
1. **Loads backup JSON** from removal step (contains exact code that was deleted)
2. **Analyzes removal PR** on GitHub to understand:
   - Which files were modified
   - Which lines were deleted
   - What the original state was
3. **Restores exact original code** to all affected files
4. Runs all 47 tests to verify game still works
5. **Game Interaction Test**: Agent plays the game to confirm feature is back
6. Creates recovery branch: `recover-bouncy-bounce`
7. Creates PR: 'Recover Bouncy Bounce feature flag'

**Key insight:** Recovery requires Devin to understand git history and PR structure - it's not just 'paste code back', it's intelligently reversing a previous automation."

## 🔵 Replace Button Demo - The Complex Case (1.5 minutes)

### Click Replace on "jumpmod"
"Now for the **most complex automation** - Replace combines removal, recovery mechanisms, AND writing new code across interdependent files.

**Replace Modal shows 3 inputs:**
1. **Current flag name:** jumpmod
2. **New flag name:** jumpmod_v2 (Tab auto-fills '_v2')
3. **Instruction:** 'Current value: 1.056. Note: lower = jump higher. Set to 0.528 for 2x jump height'

**The Challenge**: jumpmod isn't just in one file - it's a **physics constant that flows through the entire game engine**. Devin must understand the dependency graph:

**Step 1: Discovery Phase**
Devin searches the entire codebase and finds jumpmod referenced in 5 files:
1. **Source/settings/objects.js** (LINE 230) - **THE SOURCE OF TRUTH**
   - Defines: `"jumpmod": 1.056`
   - This is where the constant is born
2. **Source/settings/math.ts** (LINE 12) - **THE CALCULATION ENGINE**
   - Uses: `player.FSM.MapScreener.jumpmod`
   - Calculates Mario's jump velocity using this constant
3. **Source/settings/math.js** (LINE 31) - **THE COMPILED VERSION**
   - JavaScript version of the TypeScript calculation
   - Must match math.ts exactly or game breaks
4. **Source/settings/maps.js** (LINE 12) - **THE MAP PHYSICS**
   - References jumpmod to apply gravity to maps
   - Each map uses this constant for consistent physics
5. **Source/FullScreenMario.d.ts** (LINE 7) - **THE TYPE DEFINITION**
   - Declares: `jumpmod: number;`
   - TypeScript needs this to compile

**The Dependency Chain:**
```
objects.js DEFINES jumpmod
    ↓
math.ts/js CALCULATE with jumpmod
    ↓
maps.js APPLIES jumpmod to game levels
    ↓
.d.ts TYPES jumpmod for TypeScript compiler
```

**Why this is technically complex:**
- If Devin only changes **objects.js**, math.ts crashes with `undefined is not a number`
- If Devin only changes **objects.js + math.ts**, the compiled math.js is out of sync
- If Devin only changes **3 of 5 files**, TypeScript won't compile
- The files are **named differently** and located in **different directories** - Devin must trace the references programmatically

**Step 2: Atomic Replacement**
Devin performs all changes as ONE atomic operation:
1. **Remove jumpmod completely** from all 5 files (deletion phase)
2. **Add jumpmod_v2 = 0.528** to objects.js (creation phase)
3. **Update all 4 consuming files** to reference jumpmod_v2 instead (migration phase)
4. **Verify TypeScript compiles** with the new constant name
5. **Verify JavaScript has matching logic** (no desync between .ts and .js)

**Step 3: Validation**
- Runs all 47 tests
- **Game Interaction Test**: Agent verifies Mario jumps exactly 2x higher by:
  * Spawning game with OLD code (baseline measurement)
  * Spawning game with NEW code (comparison measurement)
  * Measuring pixel distance of jumps (proves 2x height mathematically)
  * Confirming Mario can now reach platforms that were previously unreachable
  * Screenshot proof of both states
- If ANY file is wrong, the entire replacement is rolled back

**Step 4: Atomic PR**
- Creates PR with all 5 files changed together
- PR title: 'Replace jumpmod with jumpmod_v2'
- **If the PR is rejected, no files change** - atomic transaction

**Why this matters:**
- Remove = 1 file, pure deletion
- Recover = 1 file, restore from backup
- **Replace = 5 interdependent files, remove old + create new + migrate references**
- Devin must understand: code structure, dependency graph, type systems, compilation
- This demonstrates AI can handle **enterprise-level refactoring** autonomously

**Critical bug I fixed:** Devin was creating PRs to wrong branch (experiment/enhanced-jump-physics instead of cognition-dashboard-devin-integration). I fixed this by making the base branch instruction CRITICAL and repeating it 3 times in the prompt - this shows even AI needs explicit constraints for complex workflows."

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
1. **Pure React + localStorage** - No framework overhead, fast, survives reload, no database needed
2. **Devin for automation** - Handles multi-file coordination, test execution, git workflow
3. **Atomic PRs** - All-or-nothing ensures game never breaks (critical for 5-file replacements)
4. **47-test suite** - 3 constructor + 20 map + 24 mod tests verify code quality
5. **Game interaction agent** - Devin spawns headless browser to actually play the game and verify changes work (not just unit tests!)
6. **Dependency graph analysis** - Devin must trace references across TypeScript, JavaScript, and definition files to perform replacements
7. **Progressive complexity** - Remove (1 file) → Recover (1 file + git history) → Replace (5 interdependent files)
8. **Human review** - No auto-merge, PRs need approval before production
9. **GitHub as truth** - Dashboard syncs from GitHub API, not the reverse
10. **Branch isolation** - All automations target cognition-dashboard-devin-integration
11. **Auto-complete merge** - After confirming PR merged, feature automatically moves to correct section (no manual sync)

### What I'd improve
- Add webhook listener instead of manual sync polling
- Visual dependency graph before replace (show which files will change)
- Rollback button for merged changes (one-click revert)
- Feature flag impact analysis (preview affected code before changes)
- Record video of game interaction test (not just screenshots)
- Parallel test execution for faster feedback

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
