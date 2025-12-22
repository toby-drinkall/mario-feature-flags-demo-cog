# Permanent Feature Flag Management Design

## Overview
This document defines the complete feature flag lifecycle in the Mario dashboard, supporting three permanent states:
- **Active** (runtime toggle)
- **Permanently Enabled** (flag removed, ON behavior kept)
- **Permanently Removed** (flag removed, OFF behavior deleted)

## Feature States

### 1. Active (Current State)
- Feature can be toggled on/off at runtime
- No code changes, just configuration
- Fully reversible instantly
- **UI**: Toggle switch + Enable button + Remove button

### 2. Permanently Enabled
- Flag code deleted, ON behavior kept permanently
- Simplifies codebase (no more if/else branches)
- Creates PR with code cleanup
- **UI**: "ENABLED" badge (neon green) + Recover button
- **Stats**: Counts toward "Permanently Enabled"

### 3. Permanently Removed
- Flag code deleted, OFF behavior removed entirely
- Creates PR with full deletion
- **UI**: "REMOVED" badge (red) + Recover button
- **Stats**: Counts toward "Permanently Removed"

## Devin Automation Instructions

### Enable Automation (Permanent ON)

**Goal**: Remove feature flag, keep ON behavior as the only path

**Steps Devin Should Follow**:

1. **Analyze Feature** (15s)
   - Locate flag definition in `Source/settings/mods.js`
   - Find all code references to the feature
   - Identify conditional branches (if feature enabled/disabled)
   - Map dependencies and side effects

2. **Create Backup** (5s)
   - Save full feature definition to `backups/enabled-{feature-name}-{timestamp}.json`
   - Include:
     - Original code (lines {lineStart}-{lineEnd})
     - Metadata (enabled date, PR number, lines kept)
     - Restoration instructions

3. **Simplify Code** (20s)
   - **Remove flag configuration**: Delete feature entry from `Source/settings/mods.js`
   - **Inline ON behavior**: Replace all `if (feature.enabled) { doX() } else { doY() }` with just `doX()`
   - **Delete OFF branches**: Remove alternative/fallback code paths
   - **Simplify interfaces**: Remove feature toggle UI from Mods menu
   - **Clean up dead code**: Delete unused functions, handlers, assets related to OFF state

4. **Update Tests** (10s)
   - Remove feature flag toggle tests
   - Keep behavior tests (now always ON)
   - Update snapshots if needed

5. **Validate** (15s)
   - Run linter
   - Run test suite
   - Verify game loads without errors
   - Check for unreachable code warnings

6. **Create PR** (10s)
   - Branch: `enable-{feature-name}`
   - Commit message:
     ```
     Enable {feature-name} permanently

     - Removed feature flag from settings/mods.js
     - Inlined ON behavior throughout codebase
     - Deleted OFF/fallback code paths
     - Simplified conditional logic
     - Updated tests to remove toggle behavior
     - Backup: backups/enabled-{feature-name}-{timestamp}.json

     Lines simplified: {linesRemoved}
     Tests passing: ✓

     🤖 Automated permanent enable via Devin
     ```
   - PR title: `Enable {feature-name} permanently`
   - PR description: Include checklist of what was simplified

7. **Return Results**
   ```json
   {
     "type": "enable",
     "sessionId": "dvn_...",
     "prNumber": 125,
     "prUrl": "https://github.com/.../pull/125",
     "branch": "enable-bouncy-bounce",
     "backupPath": "backups/enabled-bouncy-bounce-1234567890.json",
     "linesSimplified": 31,
     "linesRemoved": 45,
     "testsRun": 47,
     "testsPassed": 47
   }
   ```

### Remove Automation (Permanent OFF)

**Goal**: Delete feature entirely, including all ON behavior

**Steps Devin Should Follow**:

1. **Analyze Feature** (15s)
   - Same as Enable automation

2. **Create Backup** (5s)
   - Save to `backups/removed-{feature-name}-{timestamp}.json`

3. **Delete Code** (20s)
   - **Remove flag configuration**: Delete from `Source/settings/mods.js`
   - **Delete ON behavior**: Remove all feature-specific code
   - **Delete assets**: Remove images, sounds, config related to feature
   - **Clean dependencies**: Update imports, remove unused functions
   - **Remove UI**: Delete feature from Mods menu

4. **Update Tests** (10s)
   - Delete feature-specific tests entirely
   - Remove from test fixtures

5. **Validate** (15s)
   - Same as Enable automation

6. **Create PR** (10s)
   - Branch: `remove-{feature-name}`
   - Commit message:
     ```
     Remove {feature-name} permanently

     - Deleted feature flag from settings/mods.js
     - Removed all feature-specific code
     - Cleaned up dependencies and imports
     - Deleted related tests
     - Backup: backups/removed-{feature-name}-{timestamp}.json

     Lines deleted: {linesRemoved}
     Tests passing: ✓

     🤖 Automated permanent removal via Devin
     ```

7. **Return Results**
   ```json
   {
     "type": "remove",
     "sessionId": "dvn_...",
     "prNumber": 126,
     "prUrl": "https://github.com/.../pull/126",
     "branch": "remove-bouncy-bounce",
     "backupPath": "backups/removed-bouncy-bounce-1234567890.json",
     "linesDeleted": 76,
     "testsRun": 45,
     "testsPassed": 45
   }
   ```

### Recovery Automation

**Goal**: Restore feature to Active state from Enabled or Removed state

**Important**: Must preserve OTHER permanent changes (don't revert unrelated features)

**Steps Devin Should Follow**:

1. **Load Backup** (5s)
   - Read backup JSON file
   - Verify integrity and restoration instructions

2. **Analyze Current State** (15s)
   - Check current `settings/mods.js`
   - Identify what OTHER changes have been made since this feature was modified
   - Map line number shifts (other features may have been added/removed)

3. **Restore Feature Definition** (15s)
   - **Add flag back** to `settings/mods.js` at appropriate location
   - **Restore conditional branches**: Add back if/else logic
   - **Restore OFF paths**: Re-add alternative behavior code
   - **Restore UI**: Add feature back to Mods menu
   - **Preserve other changes**: Don't touch unrelated features

4. **Update Tests** (10s)
   - Restore feature toggle tests
   - Add back behavior tests for both ON and OFF states

5. **Validate** (15s)
   - Same as other automations

6. **Create PR** (10s)
   - Branch: `recover-{feature-name}`
   - Commit message:
     ```
     Recover {feature-name} to active state

     - Restored feature flag to settings/mods.js
     - Re-added conditional logic and branches
     - Restored toggle behavior in UI
     - Restored feature tests
     - Reverts: PR #{originalPR}

     Lines restored: {linesRestored}
     Tests passing: ✓

     🤖 Automated recovery via Devin
     ```

7. **Return Results**
   ```json
   {
     "type": "recover",
     "sessionId": "dvn_...",
     "prNumber": 127,
     "prUrl": "https://github.com/.../pull/127",
     "branch": "recover-bouncy-bounce",
     "originalPR": 125,
     "linesRestored": 76,
     "testsRun": 47,
     "testsPassed": 47
   }
   ```

## UI States

### Active Feature Card
```
┌────────────────────────────────────────────────────┐
│ Bouncy Bounce           MOVEMENT                   │
│ Mario landing causes him to jump                   │
│ 31 lines                                           │
│                                                     │
│              [Toggle] [Enable] [Remove]            │
└────────────────────────────────────────────────────┘
```

### Permanently Enabled Card
```
┌────────────────────────────────────────────────────┐
│ Bouncy Bounce           MOVEMENT    [ENABLED ✓]   │
│ Mario landing causes him to jump                   │
│ Enabled 5 min ago • PR #125                        │
│                                                     │
│                            [Recover]                │
└────────────────────────────────────────────────────┘
```

### Permanently Removed Card
```
┌────────────────────────────────────────────────────┐
│ Bouncy Bounce           MOVEMENT    [REMOVED ✗]   │
│ Mario landing causes him to jump                   │
│ Removed 5 min ago • PR #126                        │
│                                                     │
│                            [Recover]                │
└────────────────────────────────────────────────────┘
```

## Dashboard Tabs

1. **Active Features** (current "Feature Testing")
   - Shows all features in Active state
   - Can toggle, enable permanently, or remove permanently

2. **Permanently Enabled** (NEW)
   - Shows all features in Permanently Enabled state
   - Can recover to Active state

3. **Permanently Removed** (replaces "Removed Features")
   - Shows all features in Permanently Removed state
   - Can recover to Active state

## Stats Display

```
┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│      12        │  │       3        │  │       1        │
│ Active Features│  │Permanently     │  │Permanently     │
│                │  │Enabled         │  │Removed         │
└────────────────┘  └────────────────┘  └────────────────┘
```

## LocalStorage Schema

```javascript
{
  // Permanently enabled features
  "enabled_features": [
    {
      "name": "Bouncy Bounce",
      "enabledAt": 1234567890,
      "prNumber": 125,
      "backupPath": "backups/enabled-bouncy-bounce-1234567890.json",
      "linesSimplified": 45
    }
  ],

  // Permanently removed features
  "removed_features": [
    {
      "name": "High Speed",
      "removedAt": 1234567891,
      "prNumber": 126,
      "backupPath": "backups/removed-high-speed-1234567891.json",
      "linesDeleted": 76
    }
  ]
}
```

## Safety Checks

Before enabling/removing permanently, Devin should verify:
- ✓ Feature is not actively being used in a live experiment
- ✓ No recent incidents involving this feature
- ✓ Tests are passing in current state
- ✓ Backup creation succeeds
- ✓ No uncommitted changes in repo

## Error Handling

If automation fails:
- Rollback all file changes
- Keep backup file
- Return detailed error
- Don't create PR
- Mark feature as still "Active" in dashboard
