# Feature Removal & Restoration Workflow

## The Complete Architecture

### Three Layers of State

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 1: Dashboard UI State (localStorage)                  │
│ - Which features are in "Active" vs "Removed"               │
│ - Instant updates                                            │
│ - Survives page refresh                                      │
└─────────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────────┐
│ Layer 2: Running Game State (game window)                   │
│ - Which mods are enabled/disabled                           │
│ - Based on whatever code is loaded                          │
│ - Resets when game refreshes                                │
└─────────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────────┐
│ Layer 3: Source Code (Source/settings/mods.js)              │
│ - The actual JavaScript code                                │
│ - Changed via Devin PRs                                     │
│ - Permanent (until next PR)                                 │
└─────────────────────────────────────────────────────────────┘
```

## Removal Workflow (Complete)

### Step 1: User Clicks "Remove Bouncy Bounce"

**Dashboard immediately does:**
```javascript
// 1. Move to "removed_features" in localStorage
const removed = {
    name: "Bouncy Bounce",
    file: "Source/settings/mods.js",
    lineStart: 5,
    lineEnd: 35,
    removedAt: Date.now(),
    prNumber: null, // Set when Devin completes
    backupId: "backup-bouncy-bounce-123.json"
};
localStorage.setItem('removed_features', [...removed]);

// 2. If game is connected, disable the mod
if (gameWindow.FSM.ModAttacher.getMod("Bouncy Bounce").enabled) {
    gameWindow.FSM.ModAttacher.toggleMod("Bouncy Bounce");
}
```

**Result after this step:**
- ✅ Dashboard shows feature in "Removed Features" section
- ✅ Game has mod turned OFF
- ❌ Source code STILL HAS the code (mods.js unchanged)

### Step 2: Devin Automation Runs

**Devin does (takes 1-3 minutes):**

```bash
# 1. Create backup
cat Source/settings/mods.js | sed -n '5,35p' > /tmp/backup-bouncy-bounce-20251220.json

# 2. Remove lines 5-35 from mods.js
sed -i '' '5,35d' Source/settings/mods.js

# 3. Git operations
git checkout -b remove-bouncy-bounce
git add Source/settings/mods.js
git commit -m "Remove Bouncy Bounce feature flag"
git push origin remove-bouncy-bounce

# 4. Create PR
gh pr create --title "Remove Bouncy Bounce feature flag" \
             --body "Automated removal of feature flag..."
```

**Result after this step:**
- ✅ Dashboard still shows feature as removed
- ✅ Game still has mod off
- ✅ PR exists on GitHub (NOT merged yet)
- ❌ Source code still unchanged (PR not merged)

### Step 3: You Merge the PR on GitHub

**When you merge the PR:**
```bash
# On GitHub: Click "Merge Pull Request"
# Git merges the branch to main/master
# Source/settings/mods.js now has lines 5-35 deleted
```

**Result after this step:**
- ✅ Dashboard shows feature as removed
- ✅ Game still has mod off (still running old code)
- ✅ Source code PERMANENTLY changed (code deleted)
- ✅ PR merged and closed

### Step 4: Game Refresh

**When you refresh the game:**
```javascript
// Game loads Source/settings/mods.js fresh
// Bouncy Bounce code no longer exists in the file
// FSM.ModAttacher.mods will NOT have "Bouncy Bounce"
```

**Result after this step:**
- ✅ Dashboard shows feature as removed
- ✅ Game doesn't have "Bouncy Bounce" as an option anymore
- ✅ Source code deleted
- ✅ Feature truly gone from game

## Restoration Workflow (Complete)

Now here's where it gets interesting - restoring something that was removed!

### Step 1: User Clicks "Restore" on Bouncy Bounce

**Dashboard immediately does:**
```javascript
// 1. Remove from "removed_features" in localStorage
const newRemoved = removedFeatures.filter(r => r.name !== "Bouncy Bounce");
localStorage.setItem('removed_features', newRemoved);

// 2. Re-sync game state (feature becomes available again)
updateModStates(gameWindow);
```

**Result after this step:**
- ✅ Dashboard shows feature back in "Active Features"
- ❌ Game STILL doesn't have it (code still deleted from mods.js)
- ❌ Source code still deleted (no PR yet)

### Step 2: Devin Restoration Runs

**Devin does:**

```bash
# 1. Find the backup file
backup_file="/tmp/backup-bouncy-bounce-20251220.json"

# 2. Read the backup
cat $backup_file
# Contains the 31 lines of original Bouncy Bounce code

# 3. Analyze the current mods.js structure
# Find where to insert (after line 4, before current line 5)

# 4. Insert the code back
head -n 4 Source/settings/mods.js > /tmp/temp.js
cat $backup_file >> /tmp/temp.js
tail -n +5 Source/settings/mods.js >> /tmp/temp.js
mv /tmp/temp.js Source/settings/mods.js

# 5. Git operations
git checkout -b restore-bouncy-bounce
git add Source/settings/mods.js
git commit -m "Restore Bouncy Bounce feature flag"
git push origin restore-bouncy-bounce

# 6. Create PR
gh pr create --title "Restore Bouncy Bounce feature flag" \
             --body "This reverts the removal PR and restores the feature"
```

**Result after this step:**
- ✅ Dashboard shows feature as active
- ❌ Game still doesn't have it (code not merged yet)
- ✅ PR exists to restore code
- ❌ Source code still deleted (PR not merged)

### Step 3: You Merge the Restore PR

**When you merge the restore PR:**
```bash
# GitHub merges restore-bouncy-bounce to main
# Source/settings/mods.js now has lines 5-35 restored
```

**Result after this step:**
- ✅ Dashboard shows feature as active
- ❌ Game still doesn't have it (running old code)
- ✅ Source code RESTORED (code back in file)
- ✅ PR merged

### Step 4: Game Refresh

**When you refresh the game:**
```javascript
// Game loads Source/settings/mods.js fresh
// Bouncy Bounce code exists again!
// FSM.ModAttacher.mods["Bouncy Bounce"] is available
```

**Result after this step:**
- ✅ Dashboard shows feature as active
- ✅ Game has "Bouncy Bounce" back as an option
- ✅ Source code restored
- ✅ Feature fully functional again

## The Key Insight: Static modsData Array

The dashboard has a **hardcoded list** of all features:

```javascript
const modsData = [
    { name: "Bouncy Bounce", ... },
    { name: "Dark is the Night", ... },
    { name: "Earthquake!", ... },
    // etc - all 26+ features
];
```

**This list never changes!** It's the "catalog" of all features that exist or have existed.

### How the Dashboard Filters Features:

```javascript
// Active features = everything NOT in removed or enabled lists
const activeFeatures = modsData.filter(m =>
    !removedFeatures.find(r => r.name === m.name) &&
    !enabledFeatures.find(e => e.name === m.name)
);

// Removed features = items in removed_features localStorage
const removedFeatures = JSON.parse(localStorage.getItem('removed_features'));
```

### Why This Works:

1. **Removal**: Feature moves from activeFeatures → removedFeatures (just filtering)
2. **Restoration**: Feature moves back removedFeatures → activeFeatures (just filtering)
3. **modsData never changes** - it always has the full list
4. **Game state depends on what's in mods.js** when it loads

## Backup Storage Strategy

When Devin creates backups, they should be stored in a predictable location:

### Option 1: In Your Repository (Recommended)
```bash
mkdir -p backups/
echo "{ ... Bouncy Bounce code ... }" > backups/bouncy-bounce.json
git add backups/
git commit -m "Backup before removing Bouncy Bounce"
```

**Pros:**
- ✅ Backups version controlled
- ✅ Easy for Devin to find
- ✅ Never lost

**Cons:**
- ❌ Repository gets larger

### Option 2: System Temp Directory
```bash
echo "{ ... }" > /tmp/backup-bouncy-bounce-123.json
```

**Pros:**
- ✅ Keeps repository clean

**Cons:**
- ❌ May be deleted
- ❌ Harder for Devin to find later

### Recommended: Repository with .gitignore

```bash
# Create backups directory
mkdir -p .backups/

# Add to .gitignore if you want
echo ".backups/" >> .gitignore

# Or commit them for safety
git add .backups/
```

## How to Test the Complete Workflow

### Test 1: Remove and Check Each Layer

```bash
# Before removal
wc -l Source/settings/mods.js
# → 734 lines

# Click "Remove Bouncy Bounce" in dashboard
# Wait for Devin to complete

# Check if PR was created
gh pr list

# Merge the PR on GitHub

# Pull the changes
git pull origin master

# Check file
wc -l Source/settings/mods.js
# → 703 lines (31 lines removed)

# Refresh game - Bouncy Bounce should be gone
```

### Test 2: Restore and Check Each Layer

```bash
# Click "Restore" in dashboard
# Wait for Devin to complete

# Check for restore PR
gh pr list

# Merge the restore PR

# Pull changes
git pull origin master

# Check file
wc -l Source/settings/mods.js
# → 734 lines (31 lines restored)

# Refresh game - Bouncy Bounce should be back
```

## Visual Summary

```
┌──────────────────────────────────────────────────────────────┐
│                        REMOVAL FLOW                           │
└──────────────────────────────────────────────────────────────┘

User Action: "Remove Bouncy Bounce"
        ↓
    INSTANT
        ↓
Dashboard: Move to "Removed" section
Game: Turn OFF mod (if running)
        ↓
    1-3 MINUTES (Devin working)
        ↓
Devin: Create backup, delete code, create PR
        ↓
    USER ACTION REQUIRED
        ↓
You: Merge PR on GitHub
        ↓
    INSTANT
        ↓
Code: Lines 5-35 deleted from mods.js
        ↓
    USER ACTION REQUIRED
        ↓
You: Refresh game
        ↓
    INSTANT
        ↓
Game: "Bouncy Bounce" no longer exists


┌──────────────────────────────────────────────────────────────┐
│                      RESTORATION FLOW                         │
└──────────────────────────────────────────────────────────────┘

User Action: "Restore Bouncy Bounce"
        ↓
    INSTANT
        ↓
Dashboard: Move to "Active" section
        ↓
    1-3 MINUTES (Devin working)
        ↓
Devin: Load backup, insert code, create restore PR
        ↓
    USER ACTION REQUIRED
        ↓
You: Merge restore PR on GitHub
        ↓
    INSTANT
        ↓
Code: Lines 5-35 restored in mods.js
        ↓
    USER ACTION REQUIRED
        ↓
You: Refresh game
        ↓
    INSTANT
        ↓
Game: "Bouncy Bounce" exists again, can be toggled
```

## Summary

**Dashboard manages UI state** (instant, local)
- Shows where features are (Active/Removed)
- Toggles mods in running game
- Tracks via localStorage

**Devin manages code state** (slow, permanent)
- Creates backups before removal
- Edits actual source files
- Creates PRs for review

**You control the final state** (merge PRs)
- Merge removal PR → code deleted
- Merge restore PR → code restored
- Refresh game to see changes

The beauty of this system is:
- ✅ Dashboard gives instant feedback
- ✅ Devin makes real, reviewable changes
- ✅ You stay in control (must merge PRs)
- ✅ Everything is version controlled
- ✅ Backups enable restoration

It's a multi-layer system where each layer serves a specific purpose!
