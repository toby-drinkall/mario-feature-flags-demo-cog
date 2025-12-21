# Complete Jump Height Analysis & Implementation Plan

## ALL Files That Define Jump Height

### Primary Jump Height Constants (3 KEY files):

1. **`Source/settings/objects.js` - Line 230**
   ```javascript
   "jumpmod": 1.056,
   ```
   - **What it does:** Base jump strength modifier (lower = higher jump)
   - **Used by:** Player's decreasePlayerJumpingYvel function
   - **Current value:** 1.056

2. **`Source/settings/objects.js` - Line 232**
   ```javascript
   "maxyvelinv": FullScreenMario.FullScreenMario.unitsize * -3.5,
   ```
   - **What it does:** Maximum upward velocity (how fast Mario can move up)
   - **Current value:** unitsize * -3.5 (approximately -14)
   - **Effect:** Caps jump height

3. **`Source/settings/math.js` - Line 31**
   ```javascript
   var jumpmod = player.FSM.MapScreener.jumpmod - player.xvel * .0014
   ```
   - **What it does:** Calculates actual jumpmod based on running speed
   - **Formula:** Base jumpmod - (horizontal velocity * 0.0014)
   - **Effect:** Running makes jump slightly lower

### Secondary Jump Height Values (Enemy/Object jumps):

4. **`Source/settings/objects.js` - Line 386 & 630**
   ```javascript
   "jumpheight": FullScreenMario.FullScreenMario.unitsize * 1.17,
   ```
   - **What it does:** Jump height for Koopa enemies
   - **Not player-related**

5. **`Source/FullScreenMario.js` - Line 4441**
   ```javascript
   "jumpheight": thing.FSM.unitsize * 1.56,
   ```
   - **What it does:** Jump height for springs/bouncy objects
   - **Not player-related**

---

## Files to Modify for Double Jump Height

### CRITICAL: These 3 files MUST be changed:

| File | Line | Current Value | New Value (2x) | Description |
|------|------|---------------|----------------|-------------|
| `objects.js` | 230 | `1.056` | `0.528` | Primary jump modifier (÷2) |
| `objects.js` | 232 | `unitsize * -3.5` | `unitsize * -7.0` | Max upward velocity (×2) |
| `math.js` | 31 | Uses jumpmod | Use new jumpmod | Jump calculation |

**Math Explanation:**
- `jumpmod` is used as an exponent: `power = jumplev ^ jumpmod`
- **Lower jumpmod = Higher jump**
- To jump 2x higher: divide jumpmod by 2 (1.056 → 0.528)
- `maxyvelinv` is a velocity cap, needs to double to allow 2x height

---

## Exact Pending Section Code (To Replicate)

### From Testing Game Modes Tab (Line 1805-1870):

```javascript
{/* Pending Removal PRs */}
{pendingRemoval.length > 0 && (
    <>
        {/* Separator with label */}
        <div className="relative mb-4 mt-8">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-yellow-500/30"></div>
            </div>
            <div className="relative flex justify-center">
                <span className="px-4 text-sm font-medium text-yellow-400 glass-card rounded-full py-1 border border-yellow-500/30">
                    ⏳ Pending Removal (Awaiting PR Merge)
                </span>
            </div>
        </div>

        {/* Grid of pending items */}
        <div className="grid grid-cols-2 gap-3 mb-8">
            {pendingRemoval.map(feature => (
                <div key={feature.name} className="glass-card rounded-2xl p-4 border-2 border-yellow-500/30">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold text-primary mb-1">{feature.name}</h3>
                            <p className="text-xs text-yellow-400 mb-2">
                                PR #{feature.prNumber} • {Math.floor((Date.now() - feature.createdAt) / 60000)}m ago
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        {/* View PR Button */}
                        <a
                            href={feature.prUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 px-3 py-1.5 text-xs font-medium text-center text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-all flex items-center justify-center gap-1"
                        >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                            </svg>
                            View PR
                        </a>

                        {/* Check Merge Button */}
                        <button
                            onClick={() => checkAndCompleteMerge(feature, 'removal')}
                            disabled={checkingMerge === feature.name || mergeSuccess === feature.name}
                            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1 ${
                                mergeSuccess === feature.name
                                    ? 'bg-emerald-500/30 text-emerald-300 border-2 border-emerald-400'
                                    : checkingMerge === feature.name
                                    ? 'bg-gray-500/20 text-gray-400 cursor-wait'
                                    : 'text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20'
                            }`}
                        >
                            {mergeSuccess === feature.name ? (
                                <>
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    Merge Complete!
                                </>
                            ) : checkingMerge === feature.name ? (
                                <>
                                    <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full spinner" />
                                    Checking...
                                </>
                            ) : (
                                'Check Merge'
                            )}
                        </button>
                    </div>
                </div>
            ))}
        </div>
    </>
)}
```

---

## For Feature Flags Tab - Pending Replacement Section

**Copy the above, but change:**
1. `pendingRemoval` → `pendingReplacement`
2. Border color: `border-yellow-500/30` → `border-purple-500/30`
3. Text color: `text-yellow-400` → `text-purple-400`
4. Label: `"⏳ Pending Removal"` → `"⏳ Pending Replacement"`
5. Function: `checkAndCompleteMerge(feature, 'removal')` → `checkAndCompleteMerge(feature, 'replacement')`

**Additional display for replacement:**
```javascript
<h3 className="text-sm font-semibold text-primary mb-1">
    {feature.name} → {feature.newName}
</h3>
<p className="text-xs text-purple-400 mb-2">
    PR #{feature.prNumber} • {Math.floor((Date.now() - feature.createdAt) / 60000)}m ago
</p>
<p className="text-xs text-secondary">
    {feature.instruction} ({feature.multiplier}x multiplier)
</p>
```

---

## Removed Feature Flags Section

### From Testing Game Modes (Line 1944-1989):

```javascript
{/* Separator - only show if there are removed features */}
{removedFeatures.length > 0 && (
    <div className="relative mb-8">
        <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10 dark:border-white/10 light:border-slate-300"></div>
        </div>
        <div className="relative flex justify-center">
            <span className="px-4 text-sm text-tertiary glass-card rounded-full py-1">
                Removed Game Modes
            </span>
        </div>
    </div>
)}

{/* Removed Features - show in same grid layout */}
{removedFeatures.length > 0 && (
    <div className="grid grid-cols-2 gap-3">
        {removedFeatures.map(feature => (
            <div key={feature.name} className="glass-card rounded-2xl p-4 opacity-60 hover:opacity-100 transition">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <h3 className="text-sm font-semibold text-primary mb-1">{feature.name}</h3>
                        <p className="text-xs text-tertiary mb-2">
                            Removed {Math.floor((Date.now() - feature.removedAt) / 60000)}m ago
                        </p>
                        <div className="flex items-center gap-3 text-xs text-tertiary">
                            <span>PR #{feature.prNumber}</span>
                            <span>•</span>
                            <span>{feature.filesAffected?.length || 0} files</span>
                        </div>
                    </div>
                    <button
                        onClick={() => setActiveModal({ type: 'recover', feature: feature })}
                        className="px-3 py-1.5 text-xs font-medium btn-recover text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-all"
                    >
                        Restore
                    </button>
                </div>
            </div>
        ))}
    </div>
)}
```

**For Feature Flags tab, change:**
- Label: `"Removed Game Modes"` → `"Removed Feature Flags"`
- Data source: `removedFeatures` → `removedFeatureFlags`
- Modal type: `'recover'` → `'recover-flag'`

---

## Updated Feature Flag Card Data

### Line 533-550: Updated to show ALL affected files:

```javascript
const featureFlagsData = [
    {
        name: "PHYSICS_JUMPMOD",
        displayName: "Jump Height Physics",
        description: "Mario's jump height calculation (3 constants)",
        file: "Source/settings/objects.js",
        lineStart: 230,
        lineEnd: 232,
        currentValue: {
            jumpmod: 1.056,
            maxyvelinv: "unitsize * -3.5"
        },
        category: "physics",
        filesAffected: [
            {
                file: "Source/settings/objects.js",
                lines: [230, 232],
                constants: ["jumpmod", "maxyvelinv"],
                description: "Primary jump constants"
            },
            {
                file: "Source/settings/math.js",
                lineStart: 30,
                lineEnd: 33,
                description: "Jump calculation function using jumpmod"
            }
        ],
        totalLines: 4,
        enabled: true
    }
];
```

---

## Summary: Layout Structure

### Feature Flags Tab Should Have:

```
┌─────────────────────────────────────────────────┐
│ ACTIVE FEATURE FLAGS                            │
│                                                 │
│ Jump Height Physics                 [Replace]  │
│ 4 lines • 2 files • jumpmod: 1.056            │
└─────────────────────────────────────────────────┘

⏳ Pending Replacement (Awaiting PR Merge) [Purple]

┌─────────────────────────────────────────────────┐
│ PHYSICS_JUMPMOD → PHYSICS_JUMPMOD_V2            │
│ PR #123 • 5m ago                                │
│ Make Mario jump twice as high (2x multiplier)   │
│                                                 │
│ [View PR on GitHub]    [Check Merge]            │
└─────────────────────────────────────────────────┘

──────────── Removed Feature Flags ────────────────

┌─────────────────────────────────────────────────┐
│ PHYSICS_JUMPMOD_OLD                             │
│ Removed 1h ago                                  │
│ PR #120 • 2 files                               │
│                                   [Restore]     │
└─────────────────────────────────────────────────┘
```

---

## Implementation Checklist

- [x] Updated featureFlagsData with PHYSICS_JUMPMOD
- [x] Changed button to "Replace" (purple)
- [x] Show current value (1.056)
- [x] Add Pending Replacement section (copy from line 1805-1870, modify colors)
- [x] Add Removed Feature Flags section (already exists, just populate)
- [x] Add state management for pendingReplacement
- [x] Add checkAndCompleteMerge function for replacements
- [x] Add completeReplacement function
- [ ] Build PhysicsReplacementModal with 3 input fields
- [ ] Connect Replace button to open modal

---

## Key Insight

**Jump height is controlled by 3 constants in 2 files:**
1. `jumpmod = 1.056` (objects.js:230)
2. `maxyvelinv = unitsize * -3.5` (objects.js:232)
3. Calculation using jumpmod (math.js:31)

**To make Mario jump 2x higher:**
- jumpmod: 1.056 → 0.528 (÷2)
- maxyvelinv: unitsize * -3.5 → unitsize * -7.0 (×2)
- Update calculation in math.js to use new values

This is more complex than just changing one value!
