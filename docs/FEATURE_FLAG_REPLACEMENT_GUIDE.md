# Feature Flag Replacement System - Complete Guide

## Overview

This document describes how to implement a feature flag replacement system where Devin can:
1. Remove an existing feature flag (e.g., "Enhanced Jump Physics")
2. Replace it with a new feature flag with different behavior (e.g., "Super Jump")
3. Handle multi-file code changes
4. Create PRs for review

---

## Current State Analysis

### Existing Feature Flags

**Feature Flag 1: `useEnhancedJumpPhysics`**
- **Files**: `settings/features.js`, `settings/math.ts`
- **What it does**: Changes jump physics calculation (momentum-based)
- **Code structure**:
  ```typescript
  // In settings/math.ts lines 12-23
  if (player.FSM.settings.features && player.FSM.settings.features.useEnhancedJumpPhysics) {
      // NEW: Enhanced physics
      jumpmod = player.FSM.MapScreener.jumpmod * 1.2;
      var momentum = player.xvel * 0.0018;
      jumpmod = jumpmod - momentum;
  } else {
      // OLD: Original physics
      jumpmod = player.FSM.MapScreener.jumpmod - player.xvel * .0014;
  }
  ```

**Feature Flag 2: `useFastRunning`**
- **Files**: `settings/features.js`, `settings/math.ts`
- **What it does**: 25% faster acceleration
- **Code structure**: Similar if/else pattern

### Critical Discovery: TWO Math Files!

**IMPORTANT**: There are TWO math files:
1. **`settings/math.ts`** - TypeScript source with feature flags
2. **`settings/math.js`** - Compiled JavaScript WITHOUT feature flags

**Current behavior:**
- `math.ts` has the feature flag logic (lines 12-23, 47-55)
- `math.js` is the COMPILED output with OLD code only (line 30)
- The game actually LOADS `math.js` (not `math.ts`)

**This means the feature flags are NOT currently active in the game!**

---

## Perfect Feature for Replacement: Jump Height

### Why Jump Height is Perfect:

1. ✅ **Single calculation** - One equation: `decreasePlayerJumpingYvel`
2. ✅ **Visible change** - Users can immediately see Mario jump differently
3. ✅ **Multi-file** - Requires changes to 2-3 files
4. ✅ **Easy to parameterize** - Simple multiplier changes behavior
5. ✅ **Safe to modify** - Doesn't affect other game mechanics

### Current Jump Height Code:

**Location**: `settings/math.js` line 29-31
```javascript
"decreasePlayerJumpingYvel": function (constants, equations, player) {
    var jumpmod = player.FSM.MapScreener.jumpmod - player.xvel * .0014,
        power = Math.pow(player.keys.jumplev, jumpmod),
        dy = player.FSM.unitsize / power;
    player.yvel = Math.max(player.yvel - dy, constants.maxyvelinv);
}
```

**Key variables:**
- `jumpmod` - Controls jump strength (lower = higher jump)
- `player.FSM.MapScreener.jumpmod` - Base jump modifier (~1.056)
- `player.xvel * .0014` - Running speed penalty
- `dy` - Actual jump velocity change

---

## Feature Flag Replacement System Design

### User Inputs Required

From dashboard UI, user provides:

```javascript
{
    // What to remove
    oldFeatureName: "Enhanced Jump Physics",
    oldFeatureFlagKey: "useEnhancedJumpPhysics",

    // What to replace with
    newFeatureName: "Super Jump",
    newFeatureFlagKey: "useSuperJump",
    newBehavior: "Make Mario jump twice as high",
    newBehaviorCode: "jumpmod = player.FSM.MapScreener.jumpmod * 2.0;",

    // Or use preset behaviors:
    behaviorPreset: "doubleJumpHeight" // Options: normal, double, triple, low, etc.
}
```

### Behavior Presets

```javascript
const JUMP_BEHAVIOR_PRESETS = {
    "normal": {
        code: "jumpmod = player.FSM.MapScreener.jumpmod - player.xvel * .0014;",
        description: "Original Mario jump physics",
        multiplier: 1.0
    },
    "doubleHeight": {
        code: "jumpmod = player.FSM.MapScreener.jumpmod * 0.5;",
        description: "Mario jumps twice as high",
        multiplier: 2.0
    },
    "tripleHeight": {
        code: "jumpmod = player.FSM.MapScreener.jumpmod * 0.33;",
        description: "Mario jumps three times as high",
        multiplier: 3.0
    },
    "lowGravity": {
        code: "jumpmod = player.FSM.MapScreener.jumpmod * 0.7;",
        description: "Mario jumps 40% higher",
        multiplier: 1.4
    },
    "enhanced": {
        code: "jumpmod = player.FSM.MapScreener.jumpmod * 1.2; var momentum = player.xvel * 0.0018; jumpmod = jumpmod - momentum;",
        description: "Momentum-based physics (current)",
        multiplier: 1.2
    }
};
```

---

## Files That Need Modification

### 1. `Source/settings/features.js`
**What to change:**
- Remove old feature flag definition
- Add new feature flag definition

**Example:**
```javascript
// BEFORE
FullScreenMario.FullScreenMario.settings.features = {
    useEnhancedJumpPhysics: true,
    useFastRunning: true
};

// AFTER
FullScreenMario.FullScreenMario.settings.features = {
    useSuperJump: true,  // NEW FLAG
    useFastRunning: true
};
```

### 2. `Source/settings/math.js`
**What to change:**
- Replace `decreasePlayerJumpingYvel` function
- Add feature flag if/else logic

**Example:**
```javascript
// BEFORE (line 29-31)
"decreasePlayerJumpingYvel": function (constants, equations, player) {
    var jumpmod = player.FSM.MapScreener.jumpmod - player.xvel * .0014,
        power = Math.pow(player.keys.jumplev, jumpmod),
        dy = player.FSM.unitsize / power;
    player.yvel = Math.max(player.yvel - dy, constants.maxyvelinv);
}

// AFTER (with feature flag)
"decreasePlayerJumpingYvel": function (constants, equations, player) {
    // FEATURE FLAG: useSuperJump
    var jumpmod;
    if (player.FSM.settings.features && player.FSM.settings.features.useSuperJump) {
        // NEW: Super Jump - Mario jumps twice as high
        jumpmod = player.FSM.MapScreener.jumpmod * 0.5;
    } else {
        // OLD: Original jump physics
        jumpmod = player.FSM.MapScreener.jumpmod - player.xvel * .0014;
    }

    var power = Math.pow(player.keys.jumplev, jumpmod),
        dy = player.FSM.unitsize / power;
    player.yvel = Math.max(player.yvel - dy, constants.maxyvelinv);
}
```

### 3. `Source/settings/math.ts` (Optional - for TypeScript consistency)
**What to change:** Same as math.js but in TypeScript syntax

---

## Devin Automation Steps

### Step 1: Remove Old Feature Flag

**Prompt for Devin:**
```
Task: Remove the "Enhanced Jump Physics" feature flag and replace it with "Super Jump"

Repository: https://github.com/toby-drinkall/mario-feature-flags-demo-cog.git
Branch: Create new branch "feature/super-jump-replacement"

Instructions:

1. REMOVE OLD FEATURE FLAG from Source/settings/features.js:
   - Delete line: useEnhancedJumpPhysics: true,

2. ADD NEW FEATURE FLAG to Source/settings/features.js:
   - Add line: useSuperJump: true,
   - Add comment: // Feature Flag: Super Jump - Mario jumps twice as high

3. MODIFY Source/settings/math.js function "decreasePlayerJumpingYvel":
   - Find the function at line ~29
   - Replace the jumpmod calculation with feature flag logic:
     ```javascript
     var jumpmod;
     if (player.FSM.settings.features && player.FSM.settings.features.useSuperJump) {
         // NEW: Super Jump - Mario jumps twice as high
         jumpmod = player.FSM.MapScreener.jumpmod * 0.5;
     } else {
         // OLD: Original jump physics
         jumpmod = player.FSM.MapScreener.jumpmod - player.xvel * .0014;
     }
     ```
   - Keep the rest of the function unchanged

4. ALSO UPDATE Source/settings/math.ts for consistency:
   - Make the same changes to the TypeScript version
   - Keep type annotations

5. TEST the changes:
   - Run: npm install
   - Verify syntax: node -c Source/settings/math.js

6. CREATE BRANCH and COMMIT:
   - Branch: feature/super-jump-replacement
   - Commit message: "Replace Enhanced Jump Physics with Super Jump feature flag"
   - Include: "Makes Mario jump twice as high by modifying jump physics calculation"

7. CREATE PULL REQUEST:
   - Title: "Replace Enhanced Jump Physics with Super Jump"
   - Body:
     ```
     ## Changes
     - Removed: useEnhancedJumpPhysics feature flag
     - Added: useSuperJump feature flag
     - Behavior: Mario now jumps twice as high (jumpmod * 0.5)

     ## Files Modified
     - Source/settings/features.js
     - Source/settings/math.js
     - Source/settings/math.ts

     ## Testing
     - [x] Code compiles
     - [x] No syntax errors
     - [ ] Manual gameplay test (requires reviewer)
     ```

8. RETURN the PR number and URL
```

### Step 2: Devin Output Format

Devin should return:
```json
{
    "status": "success",
    "prNumber": 456,
    "prUrl": "https://github.com/toby-drinkall/mario-feature-flags-demo-cog/pull/456",
    "branch": "feature/super-jump-replacement",
    "filesModified": [
        "Source/settings/features.js",
        "Source/settings/math.js",
        "Source/settings/math.ts"
    ],
    "oldFeature": {
        "name": "Enhanced Jump Physics",
        "key": "useEnhancedJumpPhysics"
    },
    "newFeature": {
        "name": "Super Jump",
        "key": "useSuperJump",
        "behavior": "Mario jumps twice as high"
    }
}
```

---

## Dashboard UI Requirements

### Feature Flag Replacement Form

```javascript
<div className="feature-flag-replacement">
    <h3>Replace Feature Flag</h3>

    {/* Step 1: Select feature to remove */}
    <div>
        <label>Remove Feature Flag:</label>
        <select value={oldFeatureKey}>
            <option value="useEnhancedJumpPhysics">Enhanced Jump Physics</option>
            <option value="useFastRunning">Fast Running</option>
        </select>
    </div>

    {/* Step 2: Define new feature */}
    <div>
        <label>New Feature Name:</label>
        <input value={newFeatureName} placeholder="e.g., Super Jump" />

        <label>New Feature Flag Key:</label>
        <input value={newFeatureFlagKey} placeholder="e.g., useSuperJump" />
    </div>

    {/* Step 3: Choose behavior */}
    <div>
        <label>Jump Behavior:</label>
        <select value={behaviorPreset}>
            <option value="normal">Normal (1x height)</option>
            <option value="doubleHeight">Double Height (2x)</option>
            <option value="tripleHeight">Triple Height (3x)</option>
            <option value="lowGravity">Low Gravity (1.4x)</option>
            <option value="enhanced">Enhanced Physics (momentum)</option>
            <option value="custom">Custom (provide code)</option>
        </select>

        {behaviorPreset === 'custom' && (
            <textarea
                placeholder="jumpmod = player.FSM.MapScreener.jumpmod * 0.5;"
                value={customCode}
            />
        )}
    </div>

    {/* Step 4: Trigger Devin */}
    <button onClick={triggerDevinReplacement}>
        Replace Feature Flag with Devin
    </button>
</div>
```

### JavaScript Function

```javascript
async function triggerDevinReplacement() {
    const payload = {
        operation: "replace_feature_flag",
        oldFeature: {
            name: "Enhanced Jump Physics",
            key: "useEnhancedJumpPhysics",
            files: ["Source/settings/features.js", "Source/settings/math.js", "Source/settings/math.ts"]
        },
        newFeature: {
            name: newFeatureName,
            key: newFeatureFlagKey,
            behavior: behaviorPreset,
            customCode: behaviorPreset === 'custom' ? customCode : JUMP_BEHAVIOR_PRESETS[behaviorPreset].code
        },
        prompt: buildDevinPrompt(oldFeature, newFeature)
    };

    const result = await DevinAPI.replaceFeatureFlag(payload);

    // Show PR modal with result
    showPRModal(result);
}
```

---

## Testing the Replacement

### Before Replacement:
1. Load game at `http://localhost:8000/index.html`
2. Play level 1-1
3. Jump height: Normal (can reach ~3 blocks high)

### After Replacement (PR merged):
1. Reload game
2. Play level 1-1
3. Jump height: DOUBLE (can reach ~6 blocks high)

### Visual Comparison:
```
BEFORE (Normal Jump):
Mario: ↑ ↑ ↑ (reaches 3 blocks)
       ███
       ███
       ███

AFTER (Super Jump):
Mario: ↑ ↑ ↑ ↑ ↑ ↑ (reaches 6 blocks)
       ███
       ███
       ███
       ███
       ███
       ███
```

---

## Critical Implementation Notes

### 1. TypeScript vs JavaScript
**Problem**: The game loads `math.js` (not `math.ts`)
**Solution**: Devin must modify BOTH files:
- `math.ts` - Source code
- `math.js` - Compiled output (what the game actually uses)

### 2. Feature Flag Check Pattern
Always use this pattern for safety:
```javascript
if (player.FSM.settings.features && player.FSM.settings.features.useSuperJump) {
    // New behavior
} else {
    // Old behavior (fallback)
}
```

### 3. Preserving Old Code
Keep the OLD code in the else block for:
- Rollback capability
- A/B testing
- Gradual migration

### 4. Code Validation
Devin should always run:
```bash
node -c Source/settings/math.js  # Syntax check
npm install  # Ensure dependencies
```

---

## Example: Complete Replacement Scenario

### User Request:
"Replace Enhanced Jump Physics with Super Jump that makes Mario jump twice as high"

### Dashboard Input:
```javascript
{
    oldFeatureName: "Enhanced Jump Physics",
    oldFeatureFlagKey: "useEnhancedJumpPhysics",
    newFeatureName: "Super Jump",
    newFeatureFlagKey: "useSuperJump",
    behaviorPreset: "doubleHeight"
}
```

### Devin Changes:

**File 1: `Source/settings/features.js`**
```diff
- useEnhancedJumpPhysics: true,
+ useSuperJump: true,  // Super Jump - Mario jumps twice as high
```

**File 2: `Source/settings/math.js`**
```diff
"decreasePlayerJumpingYvel": function (constants, equations, player) {
-   var jumpmod = player.FSM.MapScreener.jumpmod - player.xvel * .0014,
+   // FEATURE FLAG: useSuperJump
+   var jumpmod;
+   if (player.FSM.settings.features && player.FSM.settings.features.useSuperJump) {
+       // NEW: Super Jump - Mario jumps twice as high
+       jumpmod = player.FSM.MapScreener.jumpmod * 0.5;
+   } else {
+       // OLD: Original jump physics
+       jumpmod = player.FSM.MapScreener.jumpmod - player.xvel * .0014;
+   }
    power = Math.pow(player.keys.jumplev, jumpmod),
    dy = player.FSM.unitsize / power;
    player.yvel = Math.max(player.yvel - dy, constants.maxyvelinv);
}
```

**File 3: `Source/settings/math.ts`** (same changes with TypeScript types)

### Result:
- PR created with 3 files modified
- Reviewer can test the new jump height
- Can easily revert by changing flag to `false`

---

## Summary: What You Need to Implement

### 1. Dashboard UI Components
- [ ] Feature flag selection dropdown
- [ ] New feature name input
- [ ] Behavior preset selector
- [ ] Custom code textarea
- [ ] "Replace with Devin" button

### 2. Devin API Integration
- [ ] `replaceFeatureFlag()` function
- [ ] Prompt builder with all file paths
- [ ] PR result handler

### 3. Behavior Presets
- [ ] Define preset configurations
- [ ] Map presets to code snippets
- [ ] Validation for custom code

### 4. Testing Workflow
- [ ] Before/after comparison UI
- [ ] Jump height visual indicators
- [ ] PR merge status tracking

---

## Next Steps

1. **Build Dashboard UI** - Add feature flag replacement form
2. **Define Presets** - Create jump behavior presets
3. **Test with Devin** - Try replacing useEnhancedJumpPhysics
4. **Iterate** - Add more feature flags (running speed, etc.)
5. **Document** - Update README with replacement workflow

---

## Questions Answered

✅ **Is this possible?** Yes, using the existing feature flag pattern
✅ **How many files?** 2-3 (features.js, math.js, math.ts)
✅ **What's the input?** Feature names, keys, and behavior preset
✅ **Perfect feature?** Jump height (single function, visible, safe)
✅ **Devin instructions?** Detailed prompt with exact file locations and code
