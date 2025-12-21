# Dashboard Implementation Steps - Physics Feature Flag Replacement

## Current State Analysis

**File:** `Source/cognition-dashboard-premium.html`
**Line:** 533-550

### Existing Feature Flag Data:
```javascript
const featureFlagsData = [
    {
        name: "useEnhancedJumpPhysics",  // ← TypeScript feature (NOT REAL)
        displayName: "Enhanced Jump Physics",
        file: "Source/settings/features.js",
        // ...
    }
];
```

**Problem:** This feature flag is in TypeScript but NOT in the compiled JavaScript that actually runs!

---

## STEP 1: Replace with REAL Physics Constant

**Location:** Line 533-550

**REMOVE:**
```javascript
const featureFlagsData = [
    {
        name: "useEnhancedJumpPhysics",
        displayName: "Enhanced Jump Physics",
        description: "Improved jump physics with momentum calculations",
        file: "Source/settings/features.js",
        lineStart: 9,
        lineEnd: 9,
        lines: 1,
        category: "physics",
        filesAffected: [
            { file: "Source/settings/features.js", lines: 1 },
            { file: "Source/settings/math.ts", lineStart: 13, lineEnd: 23, lines: 11 },
            { file: "Source/settings/math.js", lineStart: 30, lineEnd: 33, lines: 4 }
        ],
        enabled: true
    }
];
```

**REPLACE WITH:**
```javascript
const featureFlagsData = [
    {
        name: "PHYSICS_JUMPMOD",
        displayName: "Jump Height Modifier",
        description: "Controls Mario's jump height (lower = higher jump)",
        file: "Source/settings/objects.js",
        lineStart: 230,
        lineEnd: 230,
        lines: 1,
        currentValue: 1.056,
        category: "physics",
        filesAffected: [
            { file: "Source/settings/objects.js", line: 230, description: "jumpmod constant" },
            { file: "Source/settings/math.js", lineStart: 30, lineEnd: 33, description: "jump calculation function" }
        ],
        enabled: true // Currently active in game
    }
];
```

---

## STEP 2: Update FeatureFlagCard Component

**Location:** Line 729-769

**CHANGE:** Add "Replace" button instead of just "Remove"

**FIND (Line 759-766):**
```javascript
<div className="flex items-center gap-2 ml-4">
    <button
        onClick={() => onRemove(feature)}
        className="px-3 py-1.5 text-xs font-medium btn-remove text-red-400 hover:text-red-300 hover:bg-red-500/10 dark:text-red-400 dark:hover:text-red-300 rounded-lg transition-all"
    >
        Remove
    </button>
</div>
```

**REPLACE WITH:**
```javascript
<div className="flex items-center gap-2 ml-4">
    <button
        onClick={() => onReplace(feature)}
        className="px-3 py-1.5 text-xs font-medium text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-lg transition-all"
    >
        Replace
    </button>
</div>
```

**UPDATE function signature (Line 729):**
```javascript
// FROM:
function FeatureFlagCard({ feature, onRemove }) {

// TO:
function FeatureFlagCard({ feature, onReplace }) {
```

---

## STEP 3: Add Physics Replacement Modal

**Location:** After line 796 (after RemovedFeatureFlagCard)

**ADD NEW COMPONENT:**
```javascript
function PhysicsReplacementModal({ feature, onComplete, onCancel }) {
    const [newFlagName, setNewFlagName] = useState(feature.name + '_V2');
    const [behaviorInstruction, setBehaviorInstruction] = useState('');
    const [multiplier, setMultiplier] = useState(2.0);
    const [showProgress, setShowProgress] = useState(false);
    const [currentStep, setCurrentStep] = useState(-1);

    // Parse natural language instruction
    const parseMultiplier = (text) => {
        const lower = text.toLowerCase();
        if (lower.includes('twice') || lower.includes('double') || lower.includes('2x')) return 2.0;
        if (lower.includes('triple') || lower.includes('3x')) return 3.0;
        if (lower.includes('half') || lower.includes('0.5x')) return 0.5;
        const match = lower.match(/(\d+\.?\d*)\s*x/);
        if (match) return parseFloat(match[1]);
        return 2.0;
    };

    // Update multiplier when instruction changes
    React.useEffect(() => {
        if (behaviorInstruction) {
            setMultiplier(parseMultiplier(behaviorInstruction));
        }
    }, [behaviorInstruction]);

    const replacementSteps = [
        { id: 'analyze', label: 'Analyzing physics constants in objects.js', duration: 2000 },
        { id: 'backup', label: 'Creating backup of current physics', duration: 1500 },
        { id: 'calculate', label: 'Calculating new physics values', duration: 1000 },
        { id: 'modify_objects', label: `Updating objects.js with ${newFlagName}`, duration: 3000 },
        { id: 'modify_math', label: 'Updating math.js to use new physics flag', duration: 2500 },
        { id: 'create_flag_def', label: 'Creating physics flag definition file', duration: 2000 },
        { id: 'validate', label: 'Validating syntax and physics calculations', duration: 2000 },
        { id: 'test', label: 'Running physics simulation test', duration: 3000 },
        { id: 'commit', label: 'Creating git commit', duration: 1500 },
        { id: 'push', label: 'Pushing to GitHub', duration: 2000 },
        { id: 'pr', label: 'Creating Pull Request', duration: 2500 }
    ];

    const handleStartReplacement = async () => {
        setShowProgress(true);
        setCurrentStep(0);

        // Simulate Devin automation
        for (let i = 0; i < replacementSteps.length; i++) {
            await new Promise(resolve => setTimeout(resolve, replacementSteps[i].duration));
            setCurrentStep(i + 1);
        }

        // Complete
        const mockPR = {
            number: Math.floor(Math.random() * 1000) + 100,
            url: 'https://github.com/toby-drinkall/mario-feature-flags-demo-cog/pull/123'
        };

        onComplete({
            ...feature,
            newName: newFlagName,
            multiplier: multiplier,
            instruction: behaviorInstruction,
            prNumber: mockPR.number,
            prUrl: mockPR.url,
            createdAt: Date.now()
        });
    };

    if (showProgress) {
        return (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="glass-card rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <h2 className="text-xl font-bold text-primary mb-6">Devin is Replacing Physics Flag</h2>

                    {/* Progress Steps */}
                    <div className="space-y-3 mb-6">
                        {replacementSteps.map((step, index) => (
                            <div
                                key={step.id}
                                className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                                    currentStep > index ? 'bg-emerald-500/20' :
                                    currentStep === index ? 'bg-blue-500/20' : 'bg-gray-500/10'
                                }`}
                            >
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                    currentStep > index ? 'bg-emerald-500 text-white' :
                                    currentStep === index ? 'bg-blue-500 text-white' : 'bg-gray-500 text-gray-300'
                                }`}>
                                    {currentStep > index ? '✓' : index + 1}
                                </div>
                                <span className={`text-sm ${
                                    currentStep >= index ? 'text-primary' : 'text-tertiary'
                                }`}>
                                    {step.label}
                                </span>
                            </div>
                        ))}
                    </div>

                    {currentStep >= replacementSteps.length && (
                        <div className="text-center">
                            <div className="text-emerald-400 font-semibold mb-2">✓ Replacement Complete!</div>
                            <p className="text-sm text-secondary">PR created and ready for review.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass-card rounded-3xl p-8 max-w-2xl w-full">
                <h2 className="text-xl font-bold text-primary mb-6">Replace Physics Feature Flag</h2>

                {/* Field 1: Current Feature Flag (auto-filled, disabled) */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-secondary mb-2">
                        Current Feature Flag:
                    </label>
                    <div className="flex items-center gap-3">
                        <input
                            type="text"
                            value={feature.name}
                            disabled
                            className="flex-1 px-4 py-2 bg-gray-500/20 border border-white/10 rounded-lg text-primary"
                        />
                        <span className="px-3 py-1 text-xs bg-purple-500/20 text-purple-400 rounded-lg">
                            {feature.file.split('/').pop()}:{feature.lineStart}
                        </span>
                        <span className="px-3 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-lg">
                            Current: {feature.currentValue}
                        </span>
                    </div>
                </div>

                {/* Field 2: New Feature Flag Name */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-secondary mb-2">
                        New Feature Flag Name:
                    </label>
                    <input
                        type="text"
                        value={newFlagName}
                        onChange={(e) => setNewFlagName(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-500/20 border border-white/10 rounded-lg text-primary focus:border-purple-500 focus:outline-none"
                        placeholder="PHYSICS_JUMPMOD_V2"
                    />
                </div>

                {/* Field 3: Behavior Change */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-secondary mb-2">
                        Behavior Change:
                    </label>
                    <textarea
                        value={behaviorInstruction}
                        onChange={(e) => setBehaviorInstruction(e.target.value)}
                        rows="2"
                        className="w-full px-4 py-2 bg-gray-500/20 border border-white/10 rounded-lg text-primary focus:border-purple-500 focus:outline-none resize-none"
                        placeholder="Make Mario jump twice as high"
                    />
                </div>

                {/* Preview */}
                {behaviorInstruction && (
                    <div className="mb-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                        <div className="text-sm font-medium text-purple-400 mb-2">Devin will:</div>
                        <ul className="text-xs text-secondary space-y-1">
                            <li>• Change jumpmod from {feature.currentValue} to {(feature.currentValue / multiplier).toFixed(3)} (÷{multiplier.toFixed(1)} = {multiplier.toFixed(1)}x jump height)</li>
                            <li>• Update 2 files: objects.js, math.js</li>
                            <li>• Create feature flag: {newFlagName}</li>
                        </ul>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={handleStartReplacement}
                        disabled={!behaviorInstruction}
                        className="flex-1 px-6 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all"
                    >
                        Start Devin Automation
                    </button>
                    <button
                        onClick={onCancel}
                        className="px-6 py-3 bg-gray-500/20 hover:bg-gray-500/30 text-secondary hover:text-primary font-medium rounded-lg transition-all"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
```

---

## STEP 4: Add Pending Replacement Section

**Location:** After line 2010 (after active feature flags grid)

**ADD BETWEEN active flags and removed flags:**
```javascript
{/* Pending Replacement PRs */}
{pendingReplacement.length > 0 && (
    <>
        <div className="relative mb-4 mt-8">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-purple-500/30"></div>
            </div>
            <div className="relative flex justify-center">
                <span className="px-4 text-sm font-medium text-purple-400 glass-card rounded-full py-1 border border-purple-500/30">
                    ⏳ Pending Replacement (Awaiting PR Merge)
                </span>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-8">
            {pendingReplacement.map(flag => (
                <div key={flag.name} className="glass-card rounded-2xl p-4 border-2 border-purple-500/30">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold text-primary mb-1">
                                {flag.name} → {flag.newName}
                            </h3>
                            <p className="text-xs text-purple-400 mb-2">
                                PR #{flag.prNumber} • {Math.floor((Date.now() - flag.createdAt) / 60000)}m ago
                            </p>
                            <p className="text-xs text-secondary mb-2">
                                {flag.instruction} ({flag.multiplier}x multiplier)
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <a
                            href={flag.prUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 px-3 py-1.5 text-xs font-medium text-center text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-all flex items-center justify-center gap-1"
                        >
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                            </svg>
                            View PR
                        </a>
                        <button
                            onClick={() => checkReplacementMerge(flag)}
                            className="flex-1 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg transition-all"
                        >
                            Check Merge
                        </button>
                    </div>
                </div>
            ))}
        </div>
    </>
)}
```

---

## STEP 5: Add State Management

**Location:** Around line 1400 (with other useState declarations)

**ADD:**
```javascript
const [pendingReplacement, setPendingReplacement] = useState(() => {
    const saved = localStorage.getItem('pending_replacement_flags');
    return saved ? JSON.parse(saved) : [];
});

React.useEffect(() => {
    localStorage.setItem('pending_replacement_flags', JSON.stringify(pendingReplacement));
}, [pendingReplacement]);
```

---

## STEP 6: Update Modal Handling

**Location:** Around line 2042 (activeModal handling)

**CHANGE:**
```javascript
{activeModal && (
    <>
        {activeModal.type === 'replace-flag' ? (
            <PhysicsReplacementModal
                feature={activeModal.feature}
                onComplete={(replacementData) => {
                    // Add to pending replacement
                    setPendingReplacement([...pendingReplacement, replacementData]);
                    setActiveModal(null);
                }}
                onCancel={() => setActiveModal(null)}
            />
        ) : (
            <AutomationModal
                feature={activeModal.feature}
                type={activeModal.type}
                onComplete={(prNumber) => {
                    // ... existing handling
                }}
                onCancel={() => setActiveModal(null)}
            />
        )}
    </>
)}
```

---

## STEP 7: Update Feature Flag Card Usage

**Location:** Around line 1996

**CHANGE:**
```javascript
<FeatureFlagCard
    key={flag.name}
    feature={flag}
    onReplace={(f) => setActiveModal({ type: 'replace-flag', feature: f })}  // Changed from onRemove
/>
```

---

## SUMMARY OF CHANGES

### Files Modified: 1
- `Source/cognition-dashboard-premium.html`

### Lines Changed: ~300 lines

### New Components:
1. `PhysicsReplacementModal` - 3-field modal with progress
2. Pending Replacement section - matches existing design

### Layout Sections:
1. **Active Physics Flags** (top)
2. **Pending Replacement** (middle - yellow border, appears after automation)
3. **Removed Physics Flags** (bottom)

### Matching Design Elements:
- ✅ Same glass-card styling
- ✅ Same grid layout (2 columns)
- ✅ Same PR link button with GitHub icon
- ✅ Same Check Merge button with spinner
- ✅ Same separator divider with centered label
- ✅ Same color scheme (purple for replacement, yellow for pending, etc.)

---

## TESTING CHECKLIST

After implementation:
1. [ ] Load dashboard at http://localhost:8000/cognition-dashboard-premium.html
2. [ ] Switch to "Feature Flags" tab
3. [ ] See "PHYSICS_JUMPMOD" card with current value 1.056
4. [ ] Click "Replace" button
5. [ ] Modal appears with 3 fields
6. [ ] Type "Make Mario jump twice as high"
7. [ ] See preview: "Change jumpmod from 1.056 to 0.528"
8. [ ] Click "Start Devin Automation"
9. [ ] See 11-step progress
10. [ ] After completion, card moves to "Pending Replacement" section
11. [ ] Click "View PR" - opens GitHub
12. [ ] Click "Check Merge" - shows status

This matches the EXACT design of the Testing Game Modes section!
