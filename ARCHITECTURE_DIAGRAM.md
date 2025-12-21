# Architecture: How Removal & Restoration Works

## The Three-Layer System

```
┌─────────────────────────────────────────────────────────────────┐
│                     YOUR DASHBOARD (Layer 1)                     │
│                                                                  │
│  modsData = [                     ← HARDCODED CATALOG           │
│    {name: "Bouncy Bounce", ...},    (Never changes!)            │
│    {name: "Dark is Night", ...},                                │
│    ...all 26 features...                                        │
│  ]                                                               │
│                                                                  │
│  localStorage:                                                   │
│  - removed_features: ["Bouncy Bounce"]  ← UI STATE              │
│  - enabled_features: []                                          │
│                                                                  │
│  Display Logic:                                                  │
│  - Active = modsData MINUS removed MINUS enabled                │
│  - Removed = items in removed_features                          │
└─────────────────────────────────────────────────────────────────┘
                              ↕ Toggle ON/OFF
┌─────────────────────────────────────────────────────────────────┐
│                    RUNNING GAME (Layer 2)                        │
│                                                                  │
│  FSM.ModAttacher.mods = {                                        │
│    "Bouncy Bounce": {enabled: false, ...}  ← Loaded from mods.js│
│    "Dark is Night": {enabled: false, ...}                       │
│    ...                                                           │
│  }                                                               │
│                                                                  │
│  Game loads whatever is in Source/settings/mods.js              │
└─────────────────────────────────────────────────────────────────┘
                              ↕ Refresh to reload
┌─────────────────────────────────────────────────────────────────┐
│                   SOURCE CODE (Layer 3)                          │
│                                                                  │
│  Source/settings/mods.js:                                        │
│                                                                  │
│  Line 5:   { "name": "Bouncy Bounce",      ← ACTUAL CODE        │
│  Line 6:     "description": "...",                              │
│  Line 7-35:  ...code...                                         │
│  Line 35:  },                                                    │
│                                                                  │
│  Devin edits this file (removes/restores lines)                 │
└─────────────────────────────────────────────────────────────────┘
```

## Example: Removing "Bouncy Bounce"

### BEFORE Removal

```javascript
// Layer 1: Dashboard
modsData = [
  {name: "Bouncy Bounce", lineStart: 5, lineEnd: 35},
  {name: "Dark is Night", lineStart: 37, lineEnd: 82},
  // ... 24 more
];
localStorage.removed_features = [];
activeFeatures = modsData; // All 26 features

// Layer 2: Running Game
FSM.ModAttacher.mods["Bouncy Bounce"] = {enabled: false}; // Exists

// Layer 3: Source Code
Source/settings/mods.js has 734 lines
Lines 5-35 contain Bouncy Bounce code
```

### AFTER Clicking "Remove" (Instant)

```javascript
// Layer 1: Dashboard
modsData = [/* still has all 26 features */];
localStorage.removed_features = [{
  name: "Bouncy Bounce",
  file: "Source/settings/mods.js",
  lineStart: 5,
  lineEnd: 35,
  backupId: "backup-bouncy-bounce.json"
}];
activeFeatures = modsData.filter(/* not in removed */); // 25 features

// Layer 2: Running Game
FSM.ModAttacher.mods["Bouncy Bounce"] = {enabled: false}; // Turned OFF
// But still exists in game.mods object

// Layer 3: Source Code
Source/settings/mods.js STILL has 734 lines ← NO CHANGE YET
Lines 5-35 STILL have Bouncy Bounce code
```

### AFTER Devin Completes + PR Merged

```javascript
// Layer 1: Dashboard
modsData = [/* still has all 26 features */];
localStorage.removed_features = [{
  name: "Bouncy Bounce",
  prNumber: 123,  // ← Now has PR number
  ...
}];
activeFeatures = 25 features

// Layer 2: Running Game (NOT REFRESHED YET)
FSM.ModAttacher.mods["Bouncy Bounce"] = {enabled: false}; // Still exists!
// Game is running old code

// Layer 3: Source Code
Source/settings/mods.js NOW has 703 lines ← CODE DELETED
Lines 5-35 DELETED, "Dark is Night" now starts at line 5
```

### AFTER Game Refresh

```javascript
// Layer 1: Dashboard
// Same as before

// Layer 2: Running Game (FRESH LOAD)
FSM.ModAttacher.mods["Bouncy Bounce"] = undefined; // DOESN'T EXIST
// Game loaded new mods.js which doesn't have Bouncy Bounce

// Layer 3: Source Code
// Same as before - 703 lines
```

## Example: Restoring "Bouncy Bounce"

### BEFORE Restoration

```javascript
// Layer 1: Dashboard
localStorage.removed_features = [{name: "Bouncy Bounce", ...}];
activeFeatures = 25 features (no Bouncy Bounce)

// Layer 2: Running Game
FSM.ModAttacher.mods["Bouncy Bounce"] = undefined; // Doesn't exist

// Layer 3: Source Code
Source/settings/mods.js = 703 lines (code deleted)
```

### AFTER Clicking "Restore" (Instant)

```javascript
// Layer 1: Dashboard
localStorage.removed_features = []; // ← Removed from list
activeFeatures = 26 features (Bouncy Bounce back in list!)

// Layer 2: Running Game
FSM.ModAttacher.mods["Bouncy Bounce"] = undefined; // Still doesn't exist
// Because code still deleted

// Layer 3: Source Code
Source/settings/mods.js = 703 lines ← NO CHANGE YET
```

### AFTER Devin Restores + PR Merged

```javascript
// Layer 1: Dashboard
// Same as before

// Layer 2: Running Game (NOT REFRESHED)
FSM.ModAttacher.mods["Bouncy Bounce"] = undefined; // Still doesn't exist
// Game running old code

// Layer 3: Source Code
Source/settings/mods.js = 734 lines ← CODE RESTORED
Lines 5-35 have Bouncy Bounce code again!
```

### AFTER Game Refresh

```javascript
// Layer 1: Dashboard
// Same as before

// Layer 2: Running Game (FRESH LOAD)
FSM.ModAttacher.mods["Bouncy Bounce"] = {enabled: false}; // EXISTS AGAIN!
// Game loaded new mods.js which has Bouncy Bounce restored

// Layer 3: Source Code
// Same - 734 lines with code
```

## Why This Architecture Works

### 1. Dashboard as "Registry"

The `modsData` array is a **permanent catalog** of all features:
- Never changes
- Always has all 26 features
- Used for tracking and filtering only

```javascript
// This array is the "source of truth" for what features exist
const modsData = [/* all 26 features hardcoded */];

// localStorage just tracks WHERE they are:
// - In "Active" (default)
// - In "Removed" (removed_features)
// - In "Enabled" (enabled_features)
```

### 2. Game as "Runtime"

The game only knows about what's in the file when it loads:

```javascript
// When game starts:
<script src="settings/mods.js"></script>

// This populates:
FSM.ModAttacher.mods = {
  /* whatever is in mods.js at load time */
};
```

### 3. Source Code as "Permanent Storage"

The actual JavaScript file is the source of truth for what code exists:
- Git tracks every change
- PRs allow review
- Merging makes it permanent

## The Key to Restoration: Backups

When Devin removes code, it MUST create a backup:

### Devin's Removal Process:
```bash
# 1. Extract the code
sed -n '5,35p' Source/settings/mods.js > backups/bouncy-bounce.json

# 2. Delete from file
sed -i '' '5,35d' Source/settings/mods.js

# 3. Commit both
git add Source/settings/mods.js backups/bouncy-bounce.json
git commit -m "Remove Bouncy Bounce (backup created)"
```

### Devin's Restoration Process:
```bash
# 1. Load the backup
backup=$(cat backups/bouncy-bounce.json)

# 2. Find insertion point (line 5 in this case)
# Insert the code back at the same location

# 3. Commit the restoration
git add Source/settings/mods.js
git commit -m "Restore Bouncy Bounce from backup"
```

## Timeline View

```
TIME: 0s ─────────────────────────────────────────────────────────►

      You click "Remove"
      ├─► Dashboard: Hide feature (instant)
      │   Game: Turn off mod (instant)
      │   Code: No change yet
      │
      └─► Devin starts working...

TIME: 30s ────────────────────────────────────────────────────────►

      Devin working...

TIME: 90s ────────────────────────────────────────────────────────►

      ├─► Devin: Creates PR #123
      │   Dashboard: Still shows as removed
      │   Game: Still has mod off
      │   Code: No change yet (PR not merged)
      │
      └─► You review PR on GitHub...

TIME: 120s ───────────────────────────────────────────────────────►

      ├─► You merge PR #123
      │   Dashboard: Shows PR #123 in removed feature
      │   Game: Still has mod off (running old code)
      │   Code: Lines 5-35 DELETED
      │
      └─► You refresh game

TIME: 125s ───────────────────────────────────────────────────────►

      Dashboard: Shows as removed with PR #123
      Game: "Bouncy Bounce" doesn't exist
      Code: Deleted (703 lines)

      ✅ REMOVAL COMPLETE

─────────────────────────────────────────────────────────────────────

TIME: 200s ───────────────────────────────────────────────────────►

      You click "Restore"
      ├─► Dashboard: Show in active (instant)
      │   Game: Still doesn't exist (code deleted)
      │   Code: Still 703 lines
      │
      └─► Devin starts restoration...

TIME: 290s ───────────────────────────────────────────────────────►

      ├─► Devin: Creates restore PR #124
      │   Dashboard: Shows as active
      │   Game: Still doesn't exist
      │   Code: Still 703 lines (PR not merged)
      │
      └─► You merge PR #124

TIME: 300s ───────────────────────────────────────────────────────►

      ├─► Code: Lines 5-35 RESTORED (734 lines)
      │   Dashboard: Shows as active
      │   Game: Still doesn't exist (running old code)
      │
      └─► You refresh game

TIME: 305s ───────────────────────────────────────────────────────►

      Dashboard: Shows as active
      Game: "Bouncy Bounce" exists, can toggle
      Code: Restored (734 lines)

      ✅ RESTORATION COMPLETE
```

## Summary

**The dashboard is a "management interface":**
- Tracks which features are where (Active/Removed/Enabled)
- Shows instant feedback
- Controls game toggles

**Devin is the "code editor":**
- Makes real changes to source files
- Creates backups for restoration
- Works through PRs for review

**The game is the "runtime":**
- Only knows what's loaded from mods.js
- Must refresh to see code changes
- Instant toggle of enabled mods

**You are the "orchestrator":**
- Control when to remove/restore
- Review and merge PRs
- Decide when to refresh game

This architecture allows:
- ✅ Instant UI feedback
- ✅ Permanent code changes via PRs
- ✅ Full restoration capability
- ✅ Version control of all changes
- ✅ Review before permanent changes
