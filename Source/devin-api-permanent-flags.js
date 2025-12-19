// Devin API Configuration for Permanent Feature Flag Management
// This extends devin-api-config.js with enable and recovery capabilities

const DevinPermanentFlagsAPI = {
    // Inherit base configuration
    ...window.DevinAPI,

    // Enable feature permanently (remove flag, keep ON behavior)
    async enableFeaturePermanently(feature) {
        console.log(`🤖 Devin: Permanently enabling "${feature.name}"`);

        // Create session
        const session = await this.createSession({
            name: `Enable ${feature.name} permanently`,
            repository: 'https://github.com/toby-drinkall/mario-feature-flags-demo-cog.git',
        });

        // Define the enable task
        const task = {
            instruction: `
Permanently enable the "${feature.name}" feature flag by removing the flag and keeping ONLY the ON behavior.

## Context
- Feature: ${feature.name}
- Description: ${feature.description}
- Location: ${feature.file} (lines ${feature.lineStart}-${feature.lineEnd})
- Lines of code: ${feature.lines}
- Category: ${feature.category}

## Goal
Remove the feature flag entirely and simplify the codebase by making the ON behavior permanent.

## Steps to Execute

### 1. Analyze Feature (15 seconds)
- Read ${feature.file} and locate the feature definition at lines ${feature.lineStart}-${feature.lineEnd}
- Understand the feature's behavior when enabled
- Identify any conditional logic, dependencies, or side effects
- Map all references to this feature throughout the codebase

### 2. Create Backup (5 seconds)
Create a comprehensive backup file at:
\`backups/enabled-${feature.name.toLowerCase().replace(/\\s/g, '-')}-\${Date.now()}.json\`

Include:
\`\`\`json
{
  "type": "enable",
  "featureName": "${feature.name}",
  "enabledAt": "<ISO timestamp>",
  "enabledBy": "dashboard-automation",
  "file": "${feature.file}",
  "lineStart": ${feature.lineStart},
  "lineEnd": ${feature.lineEnd},
  "originalCode": "<full feature definition>",
  "reason": "User permanently enabled via dashboard",
  "metadata": {
    "category": "${feature.category}",
    "description": "${feature.description}",
    "linesOriginal": ${feature.lines}
  }
}
\`\`\`

### 3. Simplify Code (20 seconds)
**Remove flag configuration:**
- Delete lines ${feature.lineStart}-${feature.lineEnd} from ${feature.file}
- This removes the feature flag definition from the mods array

**The feature behavior is now always active because:**
- The ModAttacher system loads mods from this file
- Removing the entry means the behavior is no longer toggleable
- The game initialization will NOT apply these event handlers
- WAIT - this is actually REMOVAL, not enabling!

**CORRECTION - For Permanent Enable:**
Since this is a mod system where mods are loaded dynamically, "permanently enabling" means:
- Keep the mod definition in ${feature.file} BUT
- Remove it from the toggle UI (remove from ModAttacher's optional mods)
- OR modify the game initialization to always apply this mod without user control

**Actually, let me reconsider the architecture:**
Looking at the Mario codebase structure, mods are:
1. Defined in ${feature.file}
2. Loaded by ModAttacher
3. Can be toggled on/off at runtime

To "permanently enable" means:
- Move the mod's behavior into the core game logic (not a toggleable mod)
- Remove the mod definition from ${feature.file}
- Integrate the event handlers directly into the game

**Concrete Actions:**
1. Extract the event handlers from the mod definition
2. Find where the game initializes (likely in settings/events.js or similar)
3. Add these handlers directly to the game's event system
4. Remove the mod entry from ${feature.file}
5. Update any UI that shows this mod as toggleable

### 4. Update Tests (10 seconds)
- Remove tests that verify the toggle behavior
- Keep tests that verify the feature's functionality (now always on)
- Update test snapshots if needed

### 5. Validate Changes (15 seconds)
- Run: \`node -c ${feature.file}\` (syntax check)
- Run: \`npm test\` (if tests exist)
- Verify no linter errors
- Ensure game can still load

### 6. Git Operations (10 seconds)
Create branch:
\`\`\`bash
git checkout -b enable-${feature.name.toLowerCase().replace(/\\s/g, '-')}
\`\`\`

Commit with message:
\`\`\`
Enable ${feature.name} permanently

- Integrated feature behavior into core game logic
- Removed toggleable mod from ${feature.file}
- Feature is now always active (no longer optional)
- Backup: backups/enabled-${feature.name.toLowerCase().replace(/\\s/g, '-')}-<timestamp>.json

Lines simplified: ${feature.lines}
Tests passing: ✓

🤖 Automated permanent enable via Devin
\`\`\`

Push branch:
\`\`\`bash
git push -u origin enable-${feature.name.toLowerCase().replace(/\\s/g, '-')}
\`\`\`

### 7. Create Pull Request
Title: \`Enable ${feature.name} permanently\`

Description:
\`\`\`markdown
## Summary
Permanently enables the "${feature.name}" feature by integrating it into core game logic.

## Changes
- **Integrated**: Feature behavior is now part of the core game (not a toggleable mod)
- **Removed**: Mod definition from ${feature.file}
- **Simplified**: No longer requires runtime toggle logic

## Details
- Feature: ${feature.name}
- Description: ${feature.description}
- Category: ${feature.category}
- Lines simplified: ${feature.lines}

## Validation
- ✅ Backup created: backups/enabled-${feature.name.toLowerCase().replace(/\\s/g, '-')}-<timestamp>.json
- ✅ Tests passing (all tests)
- ✅ Game loads successfully
- ✅ No syntax errors

## Recovery
To revert, use the dashboard's "Recover" button or restore from the backup file.

## Automation
🤖 This PR was created automatically by Devin via the feature management dashboard.

**Session ID**: \${sessionId}
**Initiated**: <timestamp>
**Duration**: <duration>
\`\`\`

### 8. Return Results
Return this JSON structure:
\`\`\`json
{
  "type": "enable",
  "sessionId": "<session-id>",
  "prNumber": <pr-number>,
  "prUrl": "<github-pr-url>",
  "branch": "enable-${feature.name.toLowerCase().replace(/\\s/g, '-')}",
  "backupPath": "backups/enabled-<feature-name>-<timestamp>.json",
  "linesSimplified": ${feature.lines},
  "testsRun": <number>,
  "testsPassed": <number>
}
\`\`\`

## Important Notes
- DO NOT just delete the mod definition - that would DISABLE it
- You must integrate the behavior into the core game
- Preserve the functionality, remove the toggle capability
- Verify the game still works after changes
- Create a comprehensive backup for recovery

## Safety Checks
- ✓ Backup created successfully
- ✓ Tests pass after changes
- ✓ Game loads without errors
- ✓ No syntax errors in modified files
            `.trim(),
            context: {
                type: 'enable',
                featureName: feature.name,
                file: feature.file,
                lineStart: feature.lineStart,
                lineEnd: feature.lineEnd,
                category: feature.category
            }
        };

        // Execute task
        const taskResult = await this.executeTask(session.sessionId, task);

        // Wait for completion
        const result = await this.waitForCompletion(
            session.sessionId,
            taskResult.taskId,
            (status) => {
                console.log('Devin progress:', status.progress);
            }
        );

        return {
            type: 'enable',
            sessionId: session.sessionId,
            prNumber: result.prNumber,
            prUrl: result.prUrl,
            backupPath: result.backupPath,
            branch: result.branch,
            linesSimplified: result.linesSimplified || feature.lines
        };
    },

    // Recover feature from permanent state back to active (toggleable)
    async recoverFeature(feature, permanentType, originalPR) {
        console.log(`🤖 Devin: Recovering "${feature.name}" from ${permanentType} state`);

        // Create session
        const session = await this.createSession({
            name: `Recover ${feature.name} to active state`,
            repository: 'https://github.com/toby-drinkall/mario-feature-flags-demo-cog.git',
        });

        // Define the recovery task
        const task = {
            instruction: `
Recover the "${feature.name}" feature from ${permanentType} state back to an active (toggleable) state.

## Context
- Feature: ${feature.name}
- Description: ${feature.description}
- Current state: ${permanentType} (via PR #${originalPR})
- Backup file: ${feature.backupPath}
- Original location: ${feature.file} (lines ${feature.lineStart}-${feature.lineEnd})

## Goal
Restore the feature as a toggleable mod while preserving OTHER permanent changes made since.

## Steps to Execute

### 1. Load Backup (5 seconds)
- Read the backup file: ${feature.backupPath}
- Verify backup integrity
- Extract original feature definition
- Note original line numbers for reference

### 2. Analyze Current State (15 seconds)
**Critical**: Other features may have been permanently enabled or removed since this feature was modified.

Tasks:
- Read current ${feature.file}
- Identify what OTHER features have been changed
- Calculate line number shifts (if any)
- Determine safe insertion point for restored feature
- Map dependencies and conflicts

**DO NOT REVERT OTHER CHANGES**
- If "High Speed" was also enabled permanently, KEEP it enabled
- If "Luigi" was removed permanently, KEEP it removed
- ONLY restore "${feature.name}"

### 3. Restore Feature Definition (15 seconds)
**Add toggleable mod back to ${feature.file}:**

If the feature was permanently enabled:
- Re-add the mod definition to the mods array
- Remove any hardcoded integration in core game
- Restore toggle capability in ModAttacher

If the feature was permanently removed:
- Re-add the complete mod definition to the mods array
- Restore all event handlers
- Restore any UI elements

**Insertion strategy:**
- Try to insert at original position if possible
- If line numbers have shifted, insert at equivalent logical position
- Maintain array structure and formatting
- Preserve trailing commas and JSON syntax

### 4. Update Tests (10 seconds)
- Restore toggle tests for this feature
- Restore behavior tests for ON and OFF states
- Update snapshots if needed
- DO NOT modify tests for other features

### 5. Validate Changes (15 seconds)
- Run syntax check on ${feature.file}
- Run full test suite
- Verify game loads correctly
- Check that OTHER permanent changes are still intact

### 6. Git Operations (10 seconds)
Create branch:
\`\`\`bash
git checkout -b recover-${feature.name.toLowerCase().replace(/\\s/g, '-')}
\`\`\`

Commit message:
\`\`\`
Recover ${feature.name} to active state

- Restored toggleable mod to ${feature.file}
- Re-enabled user control over this feature
- Reverts: PR #${originalPR}
- Backup used: ${feature.backupPath}

Lines restored: ${feature.lines}
Tests passing: ✓

🤖 Automated recovery via Devin
\`\`\`

Push branch:
\`\`\`bash
git push -u origin recover-${feature.name.toLowerCase().replace(/\\s/g, '-')}
\`\`\`

### 7. Create Pull Request
Title: \`Recover ${feature.name} to active state\`

Description:
\`\`\`markdown
## Summary
Restores "${feature.name}" from ${permanentType} state back to active (toggleable).

## Changes
- **Restored**: Mod definition to ${feature.file}
- **Re-enabled**: User toggle control in dashboard
- **Reverts**: PR #${originalPR}

## Details
- Feature: ${feature.name}
- Previous state: ${permanentType}
- Original PR: #${originalPR}
- Lines restored: ${feature.lines}

## Validation
- ✅ Other permanent changes preserved (not reverted)
- ✅ Tests passing (all tests)
- ✅ Game loads successfully
- ✅ Feature is toggleable again

## Automation
🤖 This PR was created automatically by Devin via the feature management dashboard.

**Session ID**: \${sessionId}
**Initiated**: <timestamp>
**Duration**: <duration>
\`\`\`

### 8. Return Results
Return this JSON structure:
\`\`\`json
{
  "type": "recover",
  "sessionId": "<session-id>",
  "prNumber": <pr-number>,
  "prUrl": "<github-pr-url>",
  "branch": "recover-${feature.name.toLowerCase().replace(/\\s/g, '-')}",
  "originalPR": ${originalPR},
  "linesRestored": ${feature.lines},
  "testsRun": <number>,
  "testsPassed": <number>
}
\`\`\`

## Critical Safety Rules
1. **Preserve other changes**: DO NOT revert unrelated features
2. **Verify backup integrity**: Ensure backup file is valid before using
3. **Test thoroughly**: Run full test suite, not just feature tests
4. **Check line numbers**: Account for shifts due to other changes
5. **Maintain formatting**: Keep code style consistent

## If Recovery Fails
- Return detailed error with what went wrong
- DO NOT create PR if validation fails
- DO NOT modify files if backup is invalid
- Suggest manual intervention if conflicts detected
            `.trim(),
            context: {
                type: 'recover',
                featureName: feature.name,
                permanentType: permanentType,
                originalPR: originalPR,
                backupPath: feature.backupPath,
                file: feature.file,
                lineStart: feature.lineStart,
                lineEnd: feature.lineEnd
            }
        };

        // Execute task
        const taskResult = await this.executeTask(session.sessionId, task);

        // Wait for completion
        const result = await this.waitForCompletion(
            session.sessionId,
            taskResult.taskId,
            (status) => {
                console.log('Devin progress:', status.progress);
            }
        );

        return {
            type: 'recover',
            sessionId: session.sessionId,
            prNumber: result.prNumber,
            prUrl: result.prUrl,
            branch: result.branch,
            originalPR: originalPR,
            linesRestored: result.linesRestored || feature.lines
        };
    }
};

// Export for use in dashboard
window.DevinPermanentFlagsAPI = DevinPermanentFlagsAPI;
