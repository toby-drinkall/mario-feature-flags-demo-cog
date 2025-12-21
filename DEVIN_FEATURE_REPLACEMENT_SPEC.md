# Exact Feature Flag Replacement Specification

## Current State (What Exists)

### Existing Feature Flag: `useEnhancedJumpPhysics`

**Flag Definition:**
- File: `Source/settings/features.js`
- Line: 9
- Current value: `useEnhancedJumpPhysics: true,`

**Implementation in TypeScript:**
- File: `Source/settings/math.ts`
- Lines: 13-23
- Current NEW behavior: `jumpmod = player.FSM.MapScreener.jumpmod * 1.2;`
- Current OLD behavior: `jumpmod = player.FSM.MapScreener.jumpmod - player.xvel * .0014;`

**Implementation in JavaScript (What Actually Runs):**
- File: `Source/settings/math.js`
- Line: 31
- Current behavior: `var jumpmod = player.FSM.MapScreener.jumpmod - player.xvel * .0014`
- **CRITICAL**: This is OLD code - feature flag NOT implemented in compiled JS!

---

## Replacement Strategy

### Step 1: What to Replace

**Old Feature:**
- Name: `useEnhancedJumpPhysics`
- Description: "Enhanced Jump Physics v2"
- Status: Defined in features.js but NOT active in math.js

**New Feature:**
- Name: `useEnhancedJumpPhysics_v2`
- Description: "Enhanced Jump Physics v3 - Double Jump Height"
- Status: Will be active in BOTH math.ts and math.js

### Step 2: User Input

User provides ONE simple instruction:
```
"Make Mario jump twice as high"
```

System translates to:
```javascript
{
    multiplier: 2.0,
    oldFlagName: "useEnhancedJumpPhysics",
    newFlagName: "useEnhancedJumpPhysics_v2",
    description: "Enhanced Jump Physics v3 - Double Jump Height"
}
```

---

## Exact Changes Required

### File 1: `Source/settings/features.js`

**Line 9 - Change:**
```javascript
// BEFORE
useEnhancedJumpPhysics: true,

// AFTER
useEnhancedJumpPhysics_v2: true,
```

**Line 5 - Change comment:**
```javascript
// BEFORE
// Feature Flag 1: Enhanced Jump Physics v2

// AFTER
// Feature Flag 1: Enhanced Jump Physics v3 - Double Jump Height
```

**Line 8 - Change description:**
```javascript
// BEFORE
// Description: Improved jump physics with momentum-based calculations

// AFTER
// Description: Makes Mario jump twice as high (2x multiplier)
```

---

### File 2: `Source/settings/math.ts` (TypeScript Source)

**Lines 13-23 - Replace entire block:**

**BEFORE:**
```typescript
// FEATURE FLAG: useEnhancedJumpPhysics
var jumpmod: number;
if (player.FSM.settings.features && player.FSM.settings.features.useEnhancedJumpPhysics) {
    // NEW: Enhanced physics with momentum-based calculations
    jumpmod = player.FSM.MapScreener.jumpmod * 1.2;
    var momentum: number = player.xvel * 0.0018;
    jumpmod = jumpmod - momentum;
} else {
    // OLD: Original simple physics (will be removed when flag is deleted)
    jumpmod = player.FSM.MapScreener.jumpmod - player.xvel * .0014;
}
```

**AFTER:**
```typescript
// FEATURE FLAG: useEnhancedJumpPhysics_v2
var jumpmod: number;
if (player.FSM.settings.features && player.FSM.settings.features.useEnhancedJumpPhysics_v2) {
    // NEW v3: Double jump height (2x multiplier)
    // Original formula: jumpmod = player.FSM.MapScreener.jumpmod - player.xvel * .0014
    // To jump 2x higher, we divide jumpmod by 2 (lower jumpmod = higher jump)
    var baseJumpmod: number = player.FSM.MapScreener.jumpmod - player.xvel * .0014;
    jumpmod = baseJumpmod / 2.0;
} else {
    // OLD: Original simple physics
    jumpmod = player.FSM.MapScreener.jumpmod - player.xvel * .0014;
}
```

---

### File 3: `Source/settings/math.js` (Compiled JavaScript - CRITICAL!)

**Line 30-32 - Replace function content:**

**BEFORE:**
```javascript
"decreasePlayerJumpingYvel": function (constants, equations, player) {
    var jumpmod = player.FSM.MapScreener.jumpmod - player.xvel * .0014, power = Math.pow(player.keys.jumplev, jumpmod), dy = player.FSM.unitsize / power;
    player.yvel = Math.max(player.yvel - dy, constants.maxyvelinv);
},
```

**AFTER:**
```javascript
"decreasePlayerJumpingYvel": function (constants, equations, player) {
    // FEATURE FLAG: useEnhancedJumpPhysics_v2
    var jumpmod;
    if (player.FSM.settings.features && player.FSM.settings.features.useEnhancedJumpPhysics_v2) {
        // NEW v3: Double jump height (2x multiplier)
        var baseJumpmod = player.FSM.MapScreener.jumpmod - player.xvel * .0014;
        jumpmod = baseJumpmod / 2.0;
    } else {
        // OLD: Original simple physics
        jumpmod = player.FSM.MapScreener.jumpmod - player.xvel * .0014;
    }
    var power = Math.pow(player.keys.jumplev, jumpmod), dy = player.FSM.unitsize / power;
    player.yvel = Math.max(player.yvel - dy, constants.maxyvelinv);
},
```

---

## Mathematical Explanation

### How Jump Height Works

**Original Formula:**
```javascript
jumpmod = player.FSM.MapScreener.jumpmod - player.xvel * .0014
power = Math.pow(player.keys.jumplev, jumpmod)
dy = player.FSM.unitsize / power
player.yvel = Math.max(player.yvel - dy, constants.maxyvelinv)
```

**Key Insight:**
- `jumpmod` ≈ 1.056 (typical value)
- **LOWER jumpmod = HIGHER jump** (because it's used as an exponent)
- To jump 2x higher: divide jumpmod by 2
- To jump 3x higher: divide jumpmod by 3

**Multiplier to Divisor Mapping:**
| User Says | Multiplier | What We Do to jumpmod |
|-----------|------------|----------------------|
| "Normal jump" | 1x | Use original value |
| "Jump twice as high" | 2x | Divide by 2.0 |
| "Jump three times as high" | 3x | Divide by 3.0 |
| "Jump 50% higher" | 1.5x | Divide by 1.5 |

---

## Devin Instructions Template

### Exact Prompt for "Make Mario jump twice as high"

```
TASK: Replace feature flag useEnhancedJumpPhysics with useEnhancedJumpPhysics_v2
GOAL: Make Mario jump twice as high (2x multiplier)

REPOSITORY: https://github.com/toby-drinkall/mario-feature-flags-demo-cog.git
BRANCH: Create new branch "feature/double-jump-height-v2"

FILES TO MODIFY (3 files):

═══════════════════════════════════════════════════════════════════
FILE 1: Source/settings/features.js
═══════════════════════════════════════════════════════════════════

CHANGE 1 - Line 5:
FIND:
    // Feature Flag 1: Enhanced Jump Physics v2

REPLACE WITH:
    // Feature Flag 1: Enhanced Jump Physics v3 - Double Jump Height

CHANGE 2 - Line 8:
FIND:
    // Description: Improved jump physics with momentum-based calculations

REPLACE WITH:
    // Description: Makes Mario jump twice as high (2x multiplier)

CHANGE 3 - Line 9:
FIND:
    useEnhancedJumpPhysics: true,

REPLACE WITH:
    useEnhancedJumpPhysics_v2: true,

═══════════════════════════════════════════════════════════════════
FILE 2: Source/settings/math.ts
═══════════════════════════════════════════════════════════════════

FIND (Lines 13-23):
            // FEATURE FLAG: useEnhancedJumpPhysics
            var jumpmod: number;
            if (player.FSM.settings.features && player.FSM.settings.features.useEnhancedJumpPhysics) {
                // NEW: Enhanced physics with momentum-based calculations
                jumpmod = player.FSM.MapScreener.jumpmod * 1.2;
                var momentum: number = player.xvel * 0.0018;
                jumpmod = jumpmod - momentum;
            } else {
                // OLD: Original simple physics (will be removed when flag is deleted)
                jumpmod = player.FSM.MapScreener.jumpmod - player.xvel * .0014;
            }

REPLACE WITH:
            // FEATURE FLAG: useEnhancedJumpPhysics_v2
            var jumpmod: number;
            if (player.FSM.settings.features && player.FSM.settings.features.useEnhancedJumpPhysics_v2) {
                // NEW v3: Double jump height (2x multiplier)
                var baseJumpmod: number = player.FSM.MapScreener.jumpmod - player.xvel * .0014;
                jumpmod = baseJumpmod / 2.0;
            } else {
                // OLD: Original simple physics
                jumpmod = player.FSM.MapScreener.jumpmod - player.xvel * .0014;
            }

═══════════════════════════════════════════════════════════════════
FILE 3: Source/settings/math.js (CRITICAL - This is what runs!)
═══════════════════════════════════════════════════════════════════

FIND (Lines 30-33):
        "decreasePlayerJumpingYvel": function (constants, equations, player) {
            var jumpmod = player.FSM.MapScreener.jumpmod - player.xvel * .0014, power = Math.pow(player.keys.jumplev, jumpmod), dy = player.FSM.unitsize / power;
            player.yvel = Math.max(player.yvel - dy, constants.maxyvelinv);
        },

REPLACE WITH:
        "decreasePlayerJumpingYvel": function (constants, equations, player) {
            // FEATURE FLAG: useEnhancedJumpPhysics_v2
            var jumpmod;
            if (player.FSM.settings.features && player.FSM.settings.features.useEnhancedJumpPhysics_v2) {
                // NEW v3: Double jump height (2x multiplier)
                var baseJumpmod = player.FSM.MapScreener.jumpmod - player.xvel * .0014;
                jumpmod = baseJumpmod / 2.0;
            } else {
                // OLD: Original simple physics
                jumpmod = player.FSM.MapScreener.jumpmod - player.xvel * .0014;
            }
            var power = Math.pow(player.keys.jumplev, jumpmod), dy = player.FSM.unitsize / power;
            player.yvel = Math.max(player.yvel - dy, constants.maxyvelinv);
        },

═══════════════════════════════════════════════════════════════════
VALIDATION STEPS
═══════════════════════════════════════════════════════════════════

1. Run syntax check:
   node -c Source/settings/math.js

2. Run syntax check on TypeScript:
   npx tsc --noEmit Source/settings/math.ts

3. Search for old flag name (should find ZERO results):
   grep -r "useEnhancedJumpPhysics[^_]" Source/settings/

4. Search for new flag name (should find 3 results):
   grep -r "useEnhancedJumpPhysics_v2" Source/settings/

═══════════════════════════════════════════════════════════════════
GIT OPERATIONS
═══════════════════════════════════════════════════════════════════

1. Create branch:
   git checkout -b feature/double-jump-height-v2

2. Stage changes:
   git add Source/settings/features.js Source/settings/math.js Source/settings/math.ts

3. Commit with message:
   git commit -m "Replace useEnhancedJumpPhysics with useEnhancedJumpPhysics_v2

   - Changes jump height calculation to 2x multiplier
   - Updates feature flag from v2 to v3
   - Implements double jump height by dividing jumpmod by 2.0
   - Modified 3 files: features.js, math.js, math.ts"

4. Push to remote:
   git push origin feature/double-jump-height-v2

5. Create Pull Request:
   gh pr create --title "Feature: Double Jump Height (v3)" --body "Replaces useEnhancedJumpPhysics with useEnhancedJumpPhysics_v2. Makes Mario jump twice as high by dividing jumpmod by 2.0."

═══════════════════════════════════════════════════════════════════
EXPECTED OUTPUT
═══════════════════════════════════════════════════════════════════

Return JSON:
{
    "status": "success",
    "branch": "feature/double-jump-height-v2",
    "prNumber": <PR_NUMBER>,
    "prUrl": "https://github.com/toby-drinkall/mario-feature-flags-demo-cog/pull/<PR_NUMBER>",
    "filesModified": [
        "Source/settings/features.js",
        "Source/settings/math.js",
        "Source/settings/math.ts"
    ],
    "oldFlag": "useEnhancedJumpPhysics",
    "newFlag": "useEnhancedJumpPhysics_v2",
    "multiplier": 2.0,
    "validationPassed": true
}
```

---

## Dashboard UI Implementation

### HTML Structure

```html
<div class="feature-replacement-section">
    <h3>Feature Flag Replacement</h3>

    <!-- Current feature display -->
    <div class="current-feature">
        <strong>Current:</strong> useEnhancedJumpPhysics (v2)
        <span class="status-badge">Active in TypeScript only</span>
    </div>

    <!-- Jump height selector -->
    <div class="jump-multiplier-selector">
        <label>New Jump Height:</label>
        <select id="jumpMultiplier">
            <option value="1.0">Normal (1x) - Original height</option>
            <option value="1.5">50% Higher (1.5x)</option>
            <option value="2.0" selected>Double Height (2x)</option>
            <option value="3.0">Triple Height (3x)</option>
            <option value="0.5">Half Height (0.5x)</option>
        </select>
    </div>

    <!-- Natural language input (optional) -->
    <div class="natural-language">
        <label>Or type instruction:</label>
        <input
            type="text"
            id="jumpInstruction"
            placeholder="e.g., Make Mario jump twice as high"
            onkeyup="parseJumpInstruction(this.value)"
        />
    </div>

    <!-- Preview -->
    <div class="preview">
        <strong>Will create:</strong>
        <code>useEnhancedJumpPhysics_v2</code>
        <p>Jump calculation: <code>jumpmod / <span id="divisor">2.0</span></code></p>
    </div>

    <!-- Trigger button -->
    <button onclick="replaceJumpFeature()" class="btn-primary">
        Replace Feature with Devin
    </button>
</div>
```

### JavaScript Implementation

```javascript
// Natural language parser
function parseJumpInstruction(text) {
    const lower = text.toLowerCase();

    // Parse multipliers
    if (lower.includes('twice') || lower.includes('double') || lower.includes('2x')) {
        document.getElementById('jumpMultiplier').value = '2.0';
    } else if (lower.includes('triple') || lower.includes('3x')) {
        document.getElementById('jumpMultiplier').value = '3.0';
    } else if (lower.includes('50%') || lower.includes('1.5x')) {
        document.getElementById('jumpMultiplier').value = '1.5';
    } else if (lower.includes('normal') || lower.includes('original')) {
        document.getElementById('jumpMultiplier').value = '1.0';
    } else if (lower.includes('half')) {
        document.getElementById('jumpMultiplier').value = '0.5';
    }

    updatePreview();
}

// Update preview display
function updatePreview() {
    const multiplier = parseFloat(document.getElementById('jumpMultiplier').value);
    const divisor = multiplier === 1.0 ? '1.0 (no change)' : multiplier.toFixed(1);
    document.getElementById('divisor').textContent = divisor;
}

// Build Devin prompt
function buildDevinPrompt(multiplier) {
    const oldFlag = 'useEnhancedJumpPhysics';
    const newFlag = 'useEnhancedJumpPhysics_v2';
    const version = 'v3';

    let description;
    if (multiplier === 2.0) description = 'Double Jump Height';
    else if (multiplier === 3.0) description = 'Triple Jump Height';
    else if (multiplier === 1.5) description = '50% Higher Jump';
    else if (multiplier === 0.5) description = 'Half Jump Height';
    else description = `${multiplier}x Jump Height`;

    return `
TASK: Replace feature flag ${oldFlag} with ${newFlag}
GOAL: Make Mario jump ${multiplier}x higher

REPOSITORY: https://github.com/toby-drinkall/mario-feature-flags-demo-cog.git
BRANCH: Create new branch "feature/jump-height-${version}"

FILES TO MODIFY (3 files):

FILE 1: Source/settings/features.js
Line 9 - Change:
    useEnhancedJumpPhysics: true,
To:
    ${newFlag}: true,

FILE 2: Source/settings/math.ts
Lines 13-23 - Replace feature flag check and calculation:
    if (player.FSM.settings.features.${newFlag}) {
        var baseJumpmod: number = player.FSM.MapScreener.jumpmod - player.xvel * .0014;
        jumpmod = baseJumpmod / ${multiplier.toFixed(1)};
    }

FILE 3: Source/settings/math.js
Lines 30-33 - Add feature flag logic:
    if (player.FSM.settings.features && player.FSM.settings.features.${newFlag}) {
        var baseJumpmod = player.FSM.MapScreener.jumpmod - player.xvel * .0014;
        jumpmod = baseJumpmod / ${multiplier.toFixed(1)};
    } else {
        jumpmod = player.FSM.MapScreener.jumpmod - player.xvel * .0014;
    }

VALIDATION:
- Run: node -c Source/settings/math.js
- Verify: grep -r "${newFlag}" Source/settings/
- Should find exactly 3 occurrences

GIT:
- Create branch: feature/jump-height-${version}
- Commit message: "Replace ${oldFlag} with ${newFlag} (${multiplier}x jump height)"
- Create PR with title: "Feature: ${description}"

Return JSON with PR number and URL.
`.trim();
}

// Main replacement function
async function replaceJumpFeature() {
    const multiplier = parseFloat(document.getElementById('jumpMultiplier').value);
    const prompt = buildDevinPrompt(multiplier);

    // Show loading modal
    showDevinModal('Replacing feature flag...');

    try {
        // Call Devin API
        const result = await DevinAPI.executeTask(prompt);

        if (result.status === 'success') {
            showSuccessModal({
                prNumber: result.prNumber,
                prUrl: result.prUrl,
                oldFlag: 'useEnhancedJumpPhysics',
                newFlag: 'useEnhancedJumpPhysics_v2',
                multiplier: multiplier
            });
        } else {
            showErrorModal(result.error);
        }
    } catch (error) {
        showErrorModal(error.message);
    }
}

// Initialize
document.getElementById('jumpMultiplier').addEventListener('change', updatePreview);
updatePreview();
```

---

## Success Criteria

### Before PR Merge:
1. ❌ Feature flag `useEnhancedJumpPhysics` exists in features.js
2. ❌ Feature flag logic NOT in math.js (compiled)
3. ❌ Mario jumps normal height

### After PR Merge:
1. ✅ Feature flag `useEnhancedJumpPhysics_v2` exists in features.js
2. ✅ Feature flag logic IS in math.js (compiled)
3. ✅ Mario jumps 2x higher when flag is true
4. ✅ Mario jumps normal height when flag is false
5. ✅ No errors in console
6. ✅ Game plays normally

### Testing in Game:
1. Load game at `http://localhost:8000/index.html`
2. Open browser console
3. Check: `FSM.settings.features.useEnhancedJumpPhysics_v2` returns `true`
4. Play level 1-1
5. Press jump button
6. Mario should reach ~6 blocks high (vs ~3 blocks normally)

---

## Error Prevention Checklist

- [ ] Devin MUST modify ALL 3 files (features.js, math.js, math.ts)
- [ ] Devin MUST use exact line numbers provided
- [ ] Devin MUST preserve the else block (original physics)
- [ ] Devin MUST run `node -c` validation
- [ ] Devin MUST use correct divisor (not multiplier)
- [ ] Devin MUST update comments to match new version
- [ ] Devin MUST create branch before committing
- [ ] Devin MUST return PR number in response

---

## Summary

✅ **Existing feature flag:** `useEnhancedJumpPhysics` (line 9 in features.js)
✅ **New feature flag:** `useEnhancedJumpPhysics_v2` (appends _v2)
✅ **User instruction:** "Make Mario jump twice as high"
✅ **Translation:** Divide jumpmod by 2.0
✅ **Files modified:** 3 (features.js, math.js, math.ts)
✅ **Validation:** Syntax check + grep verification
✅ **Result:** PR created, reviewable, testable, revertible

This specification is complete, precise, and executable with zero ambiguity.
