# Devin Automation Design

## Overview

This document designs the **exact workflow** Devin should follow when removing or recovering feature flags from the Mario game.

## Current State

✅ **Ready**:
- Dashboard with 16 features
- Devin API integration
- Repository: `https://github.com/toby-drinkall/mario-feature-flags-demo.git`
- API key configured

⏳ **Needs**:
- Devin GitHub access (you need to authorize)
- First test run
- Refinement based on results

---

## Feature Removal Workflow

### Phase 1: Session Initialization (5s)

**Devin receives**:
```javascript
{
  feature: {
    name: "Bouncy Bounce",
    file: "Source/settings/mods.js",
    lineStart: 5,
    lineEnd: 35,
    lines: 31,
    description: "Mario landing causes him to jump.",
    category: "movement"
  }
}
```

**Devin creates**:
- Session ID: `dvn_xyz123`
- Clones repository to workspace
- Checks out `master` branch

### Phase 2: Pre-Removal Validation (10s)

**Devin verifies**:
1. File exists: `Source/settings/mods.js` ✓
2. Lines match:
   ```javascript
   // Line 5-35 should contain:
   {
       "name": "Bouncy Bounce",
       "description": "...",
       "events": { ... }
   }
   ```
3. Valid JSON syntax ✓
4. No uncommitted changes ✓

**If validation fails**:
- Return error immediately
- Don't proceed

### Phase 3: Create Backup (5s)

**Devin creates**:
```
backups/bouncy-bounce-2025-01-18-143022.json
```

**Backup contains**:
```json
{
  "featureName": "Bouncy Bounce",
  "removedAt": "2025-01-18T14:30:22.123Z",
  "removedBy": "dashboard-automation",
  "file": "Source/settings/mods.js",
  "lineStart": 5,
  "lineEnd": 35,
  "code": "{\n    \"name\": \"Bouncy Bounce\",\n    ...\n}",
  "reason": "User-initiated removal via feature dashboard",
  "metadata": {
    "category": "movement",
    "description": "Mario landing causes him to jump.",
    "linesRemoved": 31
  }
}
```

**Commit backup**:
```bash
git add backups/bouncy-bounce-2025-01-18-143022.json
git commit -m "backup: Save Bouncy Bounce before removal"
```

### Phase 4: Remove Feature Code (10s)

**Devin edits** `Source/settings/mods.js`:

**Before** (lines 5-35):
```javascript
{
    "name": "Bouncy Bounce",
    "description": "Mario landing causes him to jump.",
    "events": {
        "onPlayerLanding": function (mod, player) {
            player.yvel = player.FSM.unitsize * -1.4;
        }
    }
},
{
    "name": "Dark is the Night",
    ...
}
```

**After** (lines deleted 5-35, line 36 becomes line 5):
```javascript
{
    "name": "Dark is the Night",
    ...
}
```

**Important**:
- Remove the entire object including trailing comma
- Maintain valid JSON array syntax
- Don't touch surrounding features
- Preserve formatting (4-space indentation)

### Phase 5: Validate Removal (5s)

**Devin checks**:
1. JSON is still valid ✓
2. No syntax errors ✓
3. File parses correctly ✓
4. Array structure intact ✓

**Run linter**:
```bash
node -e "JSON.parse(require('fs').readFileSync('Source/settings/mods.js'))"
```

### Phase 6: Run Test Suite (15s)

**Devin executes**:
```bash
npm test
# OR
# Check if game loads without errors
```

**Expected**:
- All tests pass ✓
- No console errors ✓
- Game initializes successfully ✓

**If tests fail**:
- Revert changes
- Return error with test output
- Don't create PR

### Phase 7: Git Operations (15s)

**Create branch**:
```bash
git checkout -b remove-bouncy-bounce
```

**Commit changes**:
```bash
git add Source/settings/mods.js
git commit -m "Remove Bouncy Bounce feature flag

- Removed feature flag from Source/settings/mods.js (lines 5-35)
- Feature: Mario landing causes him to jump
- Category: movement
- Lines removed: 31
- Backup created: backups/bouncy-bounce-2025-01-18-143022.json
- Tests passing: ✓

🤖 Automated removal via Devin"
```

**Push to remote**:
```bash
git push -u origin remove-bouncy-bounce
```

### Phase 8: Create Pull Request (10s)

**Devin creates PR** with:

**Title**:
```
Remove Bouncy Bounce feature flag
```

**Description**:
```markdown
## Summary
Removes the "Bouncy Bounce" feature flag from the codebase.

## Changes
- **Removed**: `Source/settings/mods.js` lines 5-35 (31 lines)
- **Feature**: Mario landing causes him to jump
- **Category**: movement

## Validation
- ✅ Backup created: `backups/bouncy-bounce-2025-01-18-143022.json`
- ✅ Tests passing (all 47 tests)
- ✅ Game loads successfully
- ✅ No syntax errors

## Recovery
To recover this feature, use the dashboard's "Recover" button or restore from backup file.

## Automation
🤖 This PR was created automatically by Devin via the feature management dashboard.

**Session ID**: dvn_xyz123
**Initiated**: 2025-01-18 14:30:22 UTC
**Duration**: 75 seconds
```

**Labels**: `automation`, `feature-flag`, `removal`

### Phase 9: Return Results (instant)

**Devin returns**:
```javascript
{
  sessionId: "dvn_xyz123",
  prNumber: 124,
  prUrl: "https://github.com/toby-drinkall/mario-feature-flags-demo/pull/124",
  branch: "remove-bouncy-bounce",
  backupPath: "backups/bouncy-bounce-2025-01-18-143022.json",
  linesRemoved: 31,
  duration: 75000, // ms
  testsRun: 47,
  testsPassed: 47
}
```

**Dashboard displays**:
- ✅ Feature Removed!
- PR #124 (clickable link)
- Duration: 75s
- Tests: 47 passing

---

## Feature Recovery Workflow

### Similar to Removal but:

1. **Load backup file**
2. **Find insertion point** (where it was removed from)
3. **Insert code** back into `Source/settings/mods.js`
4. **Run tests**
5. **Create recovery branch**: `recover-bouncy-bounce`
6. **Create PR**: "Recover Bouncy Bounce feature flag"
7. **Link to original removal PR** in description

---

## Error Handling

### Validation Errors
```javascript
{
  error: "Feature code not found at specified lines",
  details: "Lines 5-35 don't match expected feature",
  action: "Check if feature was already removed"
}
```

### Test Failures
```javascript
{
  error: "Test suite failed after removal",
  details: "3 tests failed: test-game-init, test-mods-load, test-ui",
  action: "Changes reverted, feature not removed",
  testOutput: "..."
}
```

### Git/GitHub Errors
```javascript
{
  error: "Failed to create pull request",
  details: "Permission denied: repository access required",
  action: "Check GitHub integration in Devin dashboard"
}
```

---

## Safety Mechanisms

### 1. Dry Run Mode (Optional)
Add `dryRun: true` to test without making changes:
- Validates feature location ✓
- Runs removal logic ✓
- **Doesn't commit** ✗
- **Doesn't push** ✗
- Returns what *would* happen

### 2. Rollback on Failure
If any step fails:
- Revert all file changes
- Delete branch if created
- Return error details
- Keep backup file

### 3. Confirmation Steps
Before pushing:
- Review diff
- Verify tests passed
- Check commit message
- Validate PR description

---

## Questions for You

Before we proceed with the first test:

1. **GitHub Access**: Have you authorized Devin to access `toby-drinkall/mario-feature-flags-demo`?
   - If not: Go to Devin dashboard → Integrations → GitHub → Authorize

2. **Test Feature**: Should we start with "Bouncy Bounce" (31 lines, simple)?
   - It's the smallest and safest to test with

3. **Backup Location**: Should backups go in `backups/` directory?
   - Or would you prefer `.backups/` (hidden)?

4. **PR Auto-merge**: Should Devin auto-merge after tests pass?
   - Or leave for manual review? (Recommended for first few runs)

5. **Test Command**: What command should Devin run to test?
   - `npm test`?
   - Or just verify game loads?

6. **Branch Naming**: Is `remove-{feature-name}` format good?
   - Or prefer `feat/remove-{name}` or `automation/remove-{name}`?

Let me know your preferences and we'll run the first test! 🚀
