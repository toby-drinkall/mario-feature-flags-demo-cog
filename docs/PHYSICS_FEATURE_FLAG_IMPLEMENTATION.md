# Physics Feature Flag Replacement - Complete Implementation Plan

## ACTUAL PHYSICS CONSTANTS FOUND

### Location: `Source/settings/objects.js` Line 230-232

```javascript
"Area": {
    "floor": 104,
    "jumpmod": 1.056,                                              // ← JUMP HEIGHT
    "maxyvel": FullScreenMario.FullScreenMario.unitsize * 2,      // ← MAX FALL SPEED
    "maxyvelinv": FullScreenMario.FullScreenMario.unitsize * -3.5, // ← MAX JUMP SPEED
    "gravity": FullScreenMario.FullScreenMario.gravity,            // ← GRAVITY
    // ...
}
```

**This is the REAL feature flag we'll replace!**

---

## PHYSICS CONSTANTS THAT CONTROL JUMP HEIGHT

| Constant | Current Value | What It Does | File Location |
|----------|---------------|--------------|---------------|
| `jumpmod` | 1.056 | Jump strength modifier (LOWER = HIGHER JUMP) | objects.js:230 |
| `maxyvelinv` | unitsize * -3.5 | Maximum upward velocity | objects.js:232 |
| `gravity` | 0.4 | How fast Mario falls | FullScreenMario.js |

**Primary constant:** `jumpmod = 1.056`

---

## NEW MODAL: Physics Feature Flag Replacement

### Step 1: User Interface (3 Input Fields)

```jsx
<div className="physics-replacement-modal">
    <h2>Replace Physics Feature Flag</h2>

    {/* Field 1: Current Feature Flag (Auto-filled) */}
    <div className="form-field">
        <label>Current Feature Flag:</label>
        <input
            type="text"
            value="PHYSICS_JUMPMOD"
            disabled
            className="auto-filled"
        />
        <span className="location-badge">objects.js:230</span>
        <span className="current-value">Current: 1.056</span>
    </div>

    {/* Field 2: New Feature Flag Name */}
    <div className="form-field">
        <label>New Feature Flag Name:</label>
        <input
            type="text"
            id="newFlagName"
            placeholder="PHYSICS_JUMPMOD_V2"
            value={currentFlagName + "_V2"}
        />
    </div>

    {/* Field 3: Behavior Change */}
    <div className="form-field">
        <label>Behavior Change:</label>
        <textarea
            id="behaviorInstruction"
            placeholder="Make Mario jump twice as high"
            rows="2"
        ></textarea>
    </div>

    {/* Parsed Preview */}
    <div className="preview-box">
        <strong>Devin will:</strong>
        <ul>
            <li>Change jumpmod from 1.056 to 0.528 (÷2 = 2x jump height)</li>
            <li>Update 2 files: objects.js, math.js</li>
            <li>Create feature flag: PHYSICS_JUMPMOD_V2</li>
        </ul>
    </div>

    <button onClick={triggerPhysicsReplacement}>
        Start Devin Automation
    </button>
</div>
```

---

## DEVIN AUTOMATION STEPS (Real-time Progress)

### Step-by-Step Progress Indicators

```javascript
const PHYSICS_REPLACEMENT_STEPS = [
    {
        id: 'analyze',
        label: 'Analyzing physics constants in objects.js',
        duration: 2000,
        devinAction: 'Read Source/settings/objects.js and locate jumpmod value'
    },
    {
        id: 'backup',
        label: 'Creating backup of current physics',
        duration: 1500,
        devinAction: 'Save current jumpmod=1.056 to backup file'
    },
    {
        id: 'calculate',
        label: 'Calculating new physics values',
        duration: 1000,
        devinAction: 'Parse "jump twice as high" → new jumpmod = 1.056 / 2 = 0.528'
    },
    {
        id: 'modify_objects',
        label: 'Updating objects.js with PHYSICS_JUMPMOD_V2',
        duration: 3000,
        devinAction: `
            In Source/settings/objects.js line 230:
            Change: "jumpmod": 1.056,
            To:     "jumpmod": (FSM.settings.physics?.PHYSICS_JUMPMOD_V2 ? 0.528 : 1.056),
        `
    },
    {
        id: 'modify_math',
        label: 'Updating math.js to use new physics flag',
        duration: 2500,
        devinAction: `
            In Source/settings/math.js line 31:
            Add check for PHYSICS_JUMPMOD_V2 feature flag
        `
    },
    {
        id: 'create_flag_def',
        label: 'Creating physics flag definition file',
        duration: 2000,
        devinAction: `
            Create Source/settings/physics-flags.js:
            FullScreenMario.FullScreenMario.settings.physics = {
                PHYSICS_JUMPMOD_V2: true
            };
        `
    },
    {
        id: 'validate',
        label: 'Validating syntax and physics calculations',
        duration: 2000,
        devinAction: 'Run: node -c objects.js && node -c math.js'
    },
    {
        id: 'test',
        label: 'Running physics simulation test',
        duration: 3000,
        devinAction: 'Verify jumpmod calculation: 0.528 / 1.056 = 2.0x multiplier'
    },
    {
        id: 'commit',
        label: 'Creating git commit',
        duration: 1500,
        devinAction: 'git commit -m "Replace PHYSICS_JUMPMOD with PHYSICS_JUMPMOD_V2 (2x jump)"'
    },
    {
        id: 'push',
        label: 'Pushing to GitHub',
        duration: 2000,
        devinAction: 'git push origin feature/physics-jumpmod-v2'
    },
    {
        id: 'pr',
        label: 'Creating Pull Request',
        duration: 2500,
        devinAction: 'gh pr create --title "Physics: Double Jump Height (JUMPMOD_V2)"'
    }
];
```

---

## COMPLETE DEVIN PROMPT TEMPLATE

```javascript
function buildPhysicsReplacementPrompt(userInstruction) {
    // Parse user instruction
    const multiplier = parseMultiplier(userInstruction); // "twice" → 2.0

    return `
TASK: Replace physics feature flag PHYSICS_JUMPMOD with PHYSICS_JUMPMOD_V2
USER INSTRUCTION: "${userInstruction}"
CALCULATED MULTIPLIER: ${multiplier}x jump height

REPOSITORY: https://github.com/toby-drinkall/mario-feature-flags-demo-cog.git
BRANCH: feature/physics-jumpmod-v2

═══════════════════════════════════════════════════════════════════
STEP 1: ANALYZE CURRENT PHYSICS
═══════════════════════════════════════════════════════════════════

File: Source/settings/objects.js
Line: 230
Current value: "jumpmod": 1.056

Read this file and confirm the current jumpmod value.

═══════════════════════════════════════════════════════════════════
STEP 2: CALCULATE NEW PHYSICS VALUE
═══════════════════════════════════════════════════════════════════

User wants: ${multiplier}x jump height
Physics formula: Lower jumpmod = Higher jump
Calculation: new_jumpmod = current_jumpmod / ${multiplier}
Result: new_jumpmod = 1.056 / ${multiplier} = ${(1.056 / multiplier).toFixed(3)}

═══════════════════════════════════════════════════════════════════
STEP 3: CREATE PHYSICS FLAGS FILE
═══════════════════════════════════════════════════════════════════

CREATE NEW FILE: Source/settings/physics-flags.js

Content:
\`\`\`javascript
// Physics Feature Flags
// Control in-game physics constants that can be replaced

FullScreenMario.FullScreenMario.settings.physics = {
    // Jump Height Modifier v2
    // Original: 1.056
    // New: ${(1.056 / multiplier).toFixed(3)} (${multiplier}x jump height)
    PHYSICS_JUMPMOD_V2: true
};
\`\`\`

═══════════════════════════════════════════════════════════════════
STEP 4: MODIFY objects.js
═══════════════════════════════════════════════════════════════════

File: Source/settings/objects.js
Line: 230

FIND:
    "jumpmod": 1.056,

REPLACE WITH:
    "jumpmod": (function() {
        var FSM = FullScreenMario.FullScreenMario;
        if (FSM.settings.physics && FSM.settings.physics.PHYSICS_JUMPMOD_V2) {
            return ${(1.056 / multiplier).toFixed(3)}; // ${multiplier}x jump height
        }
        return 1.056; // Original
    })(),

═══════════════════════════════════════════════════════════════════
STEP 5: MODIFY index.html TO LOAD PHYSICS FLAGS
═══════════════════════════════════════════════════════════════════

File: Source/index.html

Find the script tags section and ADD BEFORE FullScreenMario.js:
    <script src="settings/physics-flags.js"></script>

═══════════════════════════════════════════════════════════════════
STEP 6: VALIDATION
═══════════════════════════════════════════════════════════════════

Run these commands:
1. node -c Source/settings/objects.js
2. node -c Source/settings/physics-flags.js
3. grep -r "PHYSICS_JUMPMOD_V2" Source/

Expected: 2 occurrences (physics-flags.js and objects.js)

═══════════════════════════════════════════════════════════════════
STEP 7: GIT OPERATIONS
═══════════════════════════════════════════════════════════════════

1. git checkout -b feature/physics-jumpmod-v2
2. git add Source/settings/physics-flags.js Source/settings/objects.js Source/index.html
3. git commit -m "Replace PHYSICS_JUMPMOD with PHYSICS_JUMPMOD_V2

- Creates physics feature flag system
- Changes jumpmod from 1.056 to ${(1.056 / multiplier).toFixed(3)}
- Mario now jumps ${multiplier}x higher
- Adds physics-flags.js for flag definitions
- Updates objects.js with conditional physics
- Updates index.html to load physics flags"

4. git push origin feature/physics-jumpmod-v2
5. gh pr create --title "Physics: ${multiplier}x Jump Height (JUMPMOD_V2)" --body "Replaces PHYSICS_JUMPMOD with PHYSICS_JUMPMOD_V2. User instruction: ${userInstruction}"

═══════════════════════════════════════════════════════════════════
EXPECTED RETURN
═══════════════════════════════════════════════════════════════════

Return JSON:
{
    "status": "success",
    "prNumber": <NUMBER>,
    "prUrl": "https://github.com/.../pull/<NUMBER>",
    "branch": "feature/physics-jumpmod-v2",
    "filesModified": [
        "Source/settings/physics-flags.js",
        "Source/settings/objects.js",
        "Source/index.html"
    ],
    "physicsChanges": {
        "oldJumpmod": 1.056,
        "newJumpmod": ${(1.056 / multiplier).toFixed(3)},
        "multiplier": ${multiplier},
        "userInstruction": "${userInstruction}"
    }
}
`;
}
```

---

## DASHBOARD LAYOUT: 3 SECTIONS

### Layout Structure

```jsx
<div className="physics-feature-flags-section">
    {/* LEFT: Active Physics Flags */}
    <div className="active-physics-flags">
        <h3>Active Physics Flags</h3>
        <div className="physics-flag-card">
            <div className="flag-name">PHYSICS_JUMPMOD</div>
            <div className="flag-location">objects.js:230</div>
            <div className="flag-value">jumpmod: 1.056</div>
            <button onClick={openReplacementModal}>
                Replace Flag
            </button>
        </div>
    </div>

    {/* MIDDLE: Pending PR Merge (appears after automation) */}
    {pendingPR && (
        <div className="pending-pr-section">
            <h3>⏳ Pending PR Merge</h3>
            <div className="pr-card">
                <div className="pr-header">
                    <span className="pr-number">#{pendingPR.number}</span>
                    <span className="pr-title">{pendingPR.title}</span>
                </div>
                <div className="pr-details">
                    <span className="old-flag">PHYSICS_JUMPMOD</span>
                    <span className="arrow">→</span>
                    <span className="new-flag">PHYSICS_JUMPMOD_V2</span>
                </div>
                <div className="pr-changes">
                    Jump height: 1.056 → 0.528 (2x multiplier)
                </div>
                <div className="pr-status">
                    ⚠️ Not merged yet - changes not live in game
                </div>
                <div className="pr-actions">
                    <button onClick={() => window.open(pendingPR.url)}>
                        View PR on GitHub
                    </button>
                    <button onClick={() => window.open(pendingPR.devinSession)}>
                        View Devin Session
                    </button>
                    <button onClick={checkMergeStatus}>
                        Check Merge Status
                    </button>
                </div>
            </div>
        </div>
    )}

    {/* RIGHT: Removed Physics Flags */}
    <div className="removed-physics-flags">
        <h3>Removed Physics Flags</h3>
        {removedFlags.map(flag => (
            <div className="removed-flag-card">
                <div className="flag-name">{flag.name}</div>
                <div className="removed-date">Removed {flag.removedAt}</div>
                <div className="pr-link">
                    PR #{flag.prNumber}
                    {flag.merged && <span className="merged-badge">✓ Merged</span>}
                </div>
                <button onClick={() => restoreFlag(flag)}>
                    Restore Flag
                </button>
            </div>
        ))}
    </div>
</div>
```

---

## REAL-TIME DEVIN PROGRESS MODAL

### Modal with Live Updates

```jsx
<div className="devin-progress-modal">
    <h2>Devin is Replacing Physics Flag</h2>

    <div className="progress-container">
        {PHYSICS_REPLACEMENT_STEPS.map((step, index) => (
            <div
                key={step.id}
                className={`progress-step ${
                    currentStep > index ? 'completed' :
                    currentStep === index ? 'active' : 'pending'
                }`}
            >
                <div className="step-indicator">
                    {currentStep > index ? '✓' : index + 1}
                </div>
                <div className="step-content">
                    <div className="step-label">{step.label}</div>
                    {currentStep === index && (
                        <div className="step-action">{step.devinAction}</div>
                    )}
                </div>
            </div>
        ))}
    </div>

    {/* Devin Live Output */}
    <div className="devin-live-output">
        <h4>Devin Terminal Output:</h4>
        <pre>{devinOutput}</pre>
    </div>

    {/* Action Buttons */}
    <div className="modal-actions">
        <button onClick={viewDevinSession}>
            View Live Devin Session
        </button>
        <button onClick={cancelAutomation} className="btn-danger">
            Cancel Automation
        </button>
    </div>
</div>
```

---

## JAVASCRIPT IMPLEMENTATION

### Main Functions

```javascript
// Parse user instruction to multiplier
function parseMultiplier(instruction) {
    const lower = instruction.toLowerCase();

    if (lower.includes('twice') || lower.includes('double') || lower.includes('2x')) {
        return 2.0;
    } else if (lower.includes('triple') || lower.includes('3x')) {
        return 3.0;
    } else if (lower.includes('half') || lower.includes('0.5x')) {
        return 0.5;
    }

    // Try to extract number
    const match = lower.match(/(\d+\.?\d*)\s*x|(\d+\.?\d*)\s*times/);
    if (match) {
        return parseFloat(match[1] || match[2]);
    }

    // Default
    return 2.0;
}

// Open replacement modal
function openReplacementModal() {
    setModalState({
        type: 'physics_replacement',
        currentFlag: 'PHYSICS_JUMPMOD',
        currentValue: 1.056,
        location: 'objects.js:230',
        newFlagName: 'PHYSICS_JUMPMOD_V2',
        behaviorInstruction: ''
    });
}

// Trigger Devin automation
async function triggerPhysicsReplacement() {
    const instruction = document.getElementById('behaviorInstruction').value;
    const multiplier = parseMultiplier(instruction);
    const prompt = buildPhysicsReplacementPrompt(instruction);

    // Show progress modal
    setShowProgress(true);
    setCurrentStep(0);

    // Start Devin automation
    const result = await DevinAPI.executeTask(prompt);

    // Update progress in real-time
    for (let i = 0; i < PHYSICS_REPLACEMENT_STEPS.length; i++) {
        setCurrentStep(i);
        await sleep(PHYSICS_REPLACEMENT_STEPS[i].duration);

        // Fetch live Devin output
        const output = await DevinAPI.getSessionOutput(result.sessionId);
        setDevinOutput(output);
    }

    // Complete
    setCurrentStep(PHYSICS_REPLACEMENT_STEPS.length);
    setPendingPR(result);
}

// Check PR merge status
async function checkMergeStatus() {
    const status = await GitHubAPI.getPRStatus(pendingPR.number);

    if (status.merged) {
        // Move to "Removed" section
        setRemovedFlags([...removedFlags, {
            name: 'PHYSICS_JUMPMOD',
            prNumber: pendingPR.number,
            merged: true,
            removedAt: new Date().toISOString()
        }]);

        // Clear pending
        setPendingPR(null);

        // Show success message
        alert('PR merged! Physics flag replaced. Reload game to see 2x jump height.');
    } else {
        alert('PR not merged yet. Please merge on GitHub first.');
    }
}
```

---

## COMPLETE IMPLEMENTATION CHECKLIST

### Phase 1: Find Physics Constants
- [x] Located jumpmod in objects.js:230
- [x] Confirmed this is the REAL physics constant
- [x] Verified it's not a mod or feature flag

### Phase 2: UI Components
- [ ] Create physics replacement modal (3 fields)
- [ ] Add "Replace Flag" button to physics flag card
- [ ] Create 3-section layout (Active | Pending | Removed)
- [ ] Build progress modal with 11 steps
- [ ] Add Devin live output display

### Phase 3: Logic
- [ ] Implement `parseMultiplier()` function
- [ ] Build `buildPhysicsReplacementPrompt()` function
- [ ] Create `triggerPhysicsReplacement()` function
- [ ] Add real-time progress tracking
- [ ] Implement PR status checking

### Phase 4: Devin Integration
- [ ] Test Devin prompt with "jump twice as high"
- [ ] Verify 11-step progress matches Devin actions
- [ ] Confirm PR creation
- [ ] Test merge detection

### Phase 5: Testing
- [ ] Verify physics change in game (1.056 → 0.528)
- [ ] Confirm Mario jumps 2x higher
- [ ] Test restore functionality
- [ ] Validate with different multipliers (3x, 0.5x, etc.)

---

## FILES TO MODIFY

1. **`Source/cognition-dashboard-premium.html`**
   - Add physics replacement modal
   - Add 3-section layout
   - Add progress tracking

2. **NEW: `Source/settings/physics-flags.js`**
   - Created by Devin
   - Contains PHYSICS_JUMPMOD_V2 flag

3. **`Source/settings/objects.js`**
   - Modified by Devin
   - Line 230: Add conditional jumpmod

4. **`Source/index.html`**
   - Modified by Devin
   - Add `<script src="settings/physics-flags.js"></script>`

---

## SUMMARY

✅ **Found REAL physics constant:** jumpmod = 1.056 (objects.js:230)
✅ **Different modal:** Physics replacement (not mod removal)
✅ **3 input fields:** Current flag (auto), New name (user), Behavior (user)
✅ **11 Devin steps:** Each mapped to progress indicator
✅ **Same 3-section layout:** Active | Pending | Removed
✅ **All features:** PR link, Devin session link, cancel, live updates, merge check

This is the CORRECT implementation for physics feature flag replacement!
