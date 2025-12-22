// Devin API Configuration Template
// Copy this file to 'devin-api-config.js' and fill in your credentials
// IMPORTANT: devin-api-config.js is in .gitignore and will NOT be committed

const DevinAPI = {
    // API Configuration
    config: {
        // Use proxy server to avoid CORS issues (proxy forwards to api.devin.ai)
        apiUrl: 'http://localhost:8000/api/devin',
        apiKey: 'apk_user_ZW1haWx8NjkzNGIxYzVjYTkwY2JhNWQ3MWNkZDNlX29yZy02ODI3NzczYmQ3MTk0YzI0YTQyN2NkNGRiM2M4YmY2ZDozOGU3ZDU5NGYzNTI0MmU0OTYzNDNlOGIyNDJkY2QxZg==', // Your Devin API key
        timeout: 300000, // 5 minutes max per operation
    },

    // Create a new Devin session
    async createSession(sessionConfig) {
        try {
            // Devin API expects a "prompt" field
            const requestBody = {
                prompt: sessionConfig.prompt || sessionConfig.name || 'New session'
            };

            const response = await fetch(`${this.config.apiUrl}/sessions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.apiKey}`,
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Session creation failed (${response.status}): ${errorText}`);
            }

            const data = await response.json();
            console.log('✓ Devin session created:', data.session_id);
            console.log('   Raw API response:', JSON.stringify(data, null, 2));
            console.log('   Session URL:', data.url);

            // Normalize the response
            const normalized = {
                sessionId: data.session_id,
                url: data.url,
                isNewSession: data.is_new_session
            };
            console.log('   Normalized response:', normalized);
            return normalized;
        } catch (error) {
            console.error('✗ Devin session creation failed:', error);
            throw error;
        }
    },

    // Get session status from Devin
    async getSessionStatus(sessionId) {
        try {
            const response = await fetch(`${this.config.apiUrl}/sessions/${sessionId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`,
                }
            });

            if (!response.ok) {
                throw new Error(`Status check failed: ${response.statusText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('✗ Status check failed:', error);
            throw error;
        }
    },

    // Cancel/stop a running Devin session (terminates permanently)
    async cancelSession(sessionId) {
        try {
            console.log(`🛑 Terminating Devin session: ${sessionId}`);
            const response = await fetch(`${this.config.apiUrl}/sessions/${sessionId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`,
                }
            });

            if (!response.ok) {
                throw new Error(`Cancel failed: ${response.statusText}`);
            }

            console.log('✓ Devin session terminated');
            return { method: 'terminated', success: true };
        } catch (error) {
            console.error('✗ Failed to terminate session:', error);
            throw error;
        }
    },

    // Poll session status until completion
    async pollSessionStatus(sessionId, onProgress) {
        const pollInterval = 3000; // 3 seconds
        const maxPolls = 200; // 10 minutes max
        let attempts = 0;
        const startTime = Date.now();

        console.log('🔄 Starting polling with enhanced progress tracking...');

        while (attempts < maxPolls) {
            try {
                const status = await this.getSessionStatus(sessionId);
                const elapsed = Math.floor((Date.now() - startTime) / 1000);

                console.log(`📊 Poll ${attempts + 1} (${elapsed}s elapsed):`,status.status_enum || status.status);

                // Enhanced status
                const enhancedStatus = {
                    ...status,
                    elapsed_seconds: elapsed,
                    poll_count: attempts + 1,
                };

                // Call progress callback
                if (onProgress) {
                    onProgress(enhancedStatus);
                }

                // Check if session is finished
                if (status.status_enum === 'finished' || status.status_enum === 'completed' || status.status_enum === 'blocked') {
                    console.log(`✅ Session completed after ${elapsed}s!`);
                    return enhancedStatus;
                } else if (status.status_enum === 'cancelled' || status.status_enum === 'stopped' || status.status_enum === 'terminated') {
                    console.log('🛑 Session was cancelled by user');
                    throw new Error('Session cancelled by user');
                } else if (status.status_enum === 'failed' || status.status_enum === 'error') {
                    throw new Error(`Session failed: ${status.status}`);
                }

                // Wait before next poll
                await new Promise(resolve => setTimeout(resolve, pollInterval));
                attempts++;
            } catch (error) {
                console.error('Polling error:', error);
                await new Promise(resolve => setTimeout(resolve, pollInterval));
                attempts++;
            }
        }

        throw new Error('Session timeout - Devin is still working but exceeded max polling time');
    },

    // Remove feature flag (high-level function)
    async removeFeatureFlag(feature, onProgress) {
        console.log(`🤖 Devin: Starting removal of "${feature.name}"`);

        const prompt = `
Remove the "${feature.name}" feature flag from the codebase.

CRITICAL PROGRESS TRACKING REQUIREMENT:
You MUST use your "send message to user" action after COMPLETING each step below.

Task Steps (send a message after EACH):
1. Locate feature flag in ${feature.file} (lines ${feature.lineStart}-${feature.lineEnd})
   Send: "Step 1 complete: Found feature flag"
2. Create backup
   Send: "Step 2 complete: Backup created"
3. Remove feature flag code
   Send: "Step 3 complete: Removed code"
4. Run tests
   Send: "Step 4 complete: Tests passed"
5. Create branch: remove-${feature.name.toLowerCase().replace(/\\s/g, '-')}
   Send: "Step 5 complete: Created branch"
6. Commit changes
   Send: "Step 6 complete: Committed"
7. Create Pull Request to cognition-dashboard-devin-integration
   Send: "Step 7 complete: Created PR #[number]"
8. Finalize
   Send: "Step 8 complete: All steps complete"
        `.trim();

        const session = await this.createSession({ prompt });
        console.log(`✓ Devin session created: ${session.url}`);

        // Immediately notify with session info
        if (onProgress) {
            onProgress({
                session_created: true,
                session_id: session.sessionId,
                url: session.url,
                status_enum: 'initializing',
                messages: []
            });
        }

        const sessionUrl = session.url;
        const onProgressWithUrl = onProgress ? (status) => {
            if (!status.url && sessionUrl) {
                status.url = sessionUrl;
            }
            onProgress(status);
        } : null;

        const finalStatus = await this.pollSessionStatus(session.sessionId, onProgressWithUrl);
        const structuredOutput = finalStatus.structured_output || {};

        return {
            sessionId: session.sessionId,
            url: session.url,
            prNumber: structuredOutput.pr_number || finalStatus.pull_request || 'N/A',
            backupPath: structuredOutput.backup_file_path || 'N/A',
            branch: `remove-${feature.name.toLowerCase().replace(/\\s/g, '-')}`,
            status: finalStatus.status_enum,
            messages: finalStatus.messages || []
        };
    },

    // Recover feature flag (high-level function)
    async recoverFeatureFlag(feature, removalPR, onProgress) {
        console.log(`🤖 Devin: Starting recovery of "${feature.name}"`);

        const prompt = `
Recover the "${feature.name}" feature flag that was removed in PR #${removalPR}.

CRITICAL PROGRESS TRACKING REQUIREMENT:
You MUST use your "send message to user" action after COMPLETING each step below.

Task Steps (send a message after EACH):
1. Load backup
   Send: "Step 1 complete: Found backup"
2. Analyze removal PR #${removalPR}
   Send: "Step 2 complete: Analyzed PR"
3. Restore feature code to ${feature.file}
   Send: "Step 3 complete: Restored code"
4. Run tests
   Send: "Step 4 complete: Tests passed"
5. Create branch: recover-${feature.name.toLowerCase().replace(/\\s/g, '-')}
   Send: "Step 5 complete: Created branch"
6. Commit changes
   Send: "Step 6 complete: Committed"
7. Create Pull Request to cognition-dashboard-devin-integration
   Send: "Step 7 complete: Created PR #[number]"
8. Finalize
   Send: "Step 8 complete: All steps complete"
        `.trim();

        const session = await this.createSession({ prompt });
        console.log(`✓ Devin session created: ${session.url}`);

        if (onProgress) {
            onProgress({
                session_created: true,
                session_id: session.sessionId,
                url: session.url,
                status_enum: 'initializing',
                messages: []
            });
        }

        const sessionUrl = session.url;
        const onProgressWithUrl = onProgress ? (status) => {
            if (!status.url && sessionUrl) {
                status.url = sessionUrl;
            }
            onProgress(status);
        } : null;

        const finalStatus = await this.pollSessionStatus(session.sessionId, onProgressWithUrl);
        const structuredOutput = finalStatus.structured_output || {};

        return {
            sessionId: session.sessionId,
            url: session.url,
            prNumber: structuredOutput.pr_number || finalStatus.pull_request || 'N/A',
            branch: `recover-${feature.name.toLowerCase().replace(/\\s/g, '-')}`,
            status: finalStatus.status_enum,
            messages: finalStatus.messages || []
        };
    },

    // Recover feature flag with reverse replacement (for feature flags that were replaced)
    async recoverFeatureFlagWithReplacement(feature, replacedByName, removalPR, onProgress) {
        console.log(`🤖 Devin: Recovering "${feature.name}" by reversing replacement with "${replacedByName}"`);

        const prompt = `
Recover the "${feature.name}" feature flag by REVERSING its replacement with "${replacedByName}".

CONTEXT:
- Original feature flag: ${feature.name} = ${feature.currentValue || 'unknown'} (was REMOVED)
- Replacement feature flag: ${replacedByName} (currently ACTIVE)
- Removal PR: #${removalPR}
- This is a REVERSE REPLACEMENT operation

GOAL:
Delete ${replacedByName} completely and restore ${feature.name} to return to the previous game state.
${replacedByName} should NOT appear in "Removed Feature Flags" - it should be completely gone.

IMPORTANT PHYSICS RELATIONSHIP:
This is a physics constant where LOWER value = HIGHER jump (inverse relationship).
- Original value: ${feature.name} = ${feature.currentValue || 'unknown'}
- Do NOT change the value, restore it exactly as it was

CRITICAL PROGRESS TRACKING REQUIREMENT:
You MUST use your "send message to user" action after COMPLETING each step below. This allows real-time tracking on the dashboard. Do NOT batch multiple steps - send ONE message per completed step.

Task Steps (send a message after EACH):

1. Load Backup
   - Find and load the backup of ${feature.name} = ${feature.currentValue || 'unknown'}
   - This backup was created when ${feature.name} was replaced
   Send message: "Step 1 complete: Loaded backup of ${feature.name}"

2. Identify Replacement Constant
   - Locate ${replacedByName} in ${feature.file}
   - Identify all ${feature.filesAffected.length} files that reference ${replacedByName}
   Send message: "Step 2 complete: Found ${replacedByName} in ${feature.filesAffected.length} files"

3. Remove Replacement Constant Completely
   - DELETE ${replacedByName} definition from ${feature.file}
   - DELETE all references to ${replacedByName} from the codebase
   - ${replacedByName} will be completely gone (NOT tracked in removed section)
   Send message: "Step 3 complete: Completely removed ${replacedByName} from codebase"

4. Restore Original Constant
   - ADD ${feature.name} = ${feature.currentValue || 'unknown'} back to ${feature.file}
   - Restore exact original value from backup
   Send message: "Step 4 complete: Restored ${feature.name} with original value"

5. Update All Code References
   - Update all code that used ${replacedByName} to now use ${feature.name}
   - Across all ${feature.filesAffected.length} files
   - Game returns to previous state with ${feature.name}
   Send message: "Step 5 complete: Updated ${feature.filesAffected.length} files to use ${feature.name}"

6. Run Tests
   - Lint all modified files
   - Run game to verify original behavior is restored
   Send message: "Step 6 complete: All tests passed. Original behavior restored."

7. Create Atomic PR
   - Create git branch: recover-${feature.name.toLowerCase().replace(/\s/g, '-')}-from-${replacedByName.toLowerCase().replace(/\s/g, '-')}
   - Commit all ${feature.filesAffected.length} files atomically
   - Commit message: "Recover ${feature.name} by reversing replacement with ${replacedByName}"
   - CRITICAL: Base branch MUST be "cognition-dashboard-devin-integration" NOT "experiment/enhanced-jump-physics" or any other branch
   - Use GitHub CLI command explicitly: gh pr create --base cognition-dashboard-devin-integration --head [your-branch] --title "Recover ${feature.name} feature flag"
   - PR description should include:
     * ${replacedByName} → DELETED (not tracked)
     * ${feature.name} = ${feature.currentValue || 'unknown'} → RESTORED
     * Files modified (${feature.filesAffected.length} files)
   Send message: "Step 7 complete: Created PR #[number] to cognition-dashboard-devin-integration at [url]"

8. Finalize
   Send message: "Step 8 complete: All steps complete. ${feature.name} restored, ${replacedByName} removed. Game returned to previous state."

STRUCTURED OUTPUT (fill this in your final response):
{
  "pr_number": [PR number],
  "backup_file_path": "[full path to backup used]",
  "branch_name": "recover-${feature.name.toLowerCase().replace(/\s/g, '-')}-from-${replacedByName.toLowerCase().replace(/\s/g, '-')}",
  "commit_sha": "[git commit hash]",
  "removed_constant": "${replacedByName}",
  "restored_constant": "${feature.name}",
  "restored_value": "${feature.currentValue || 'unknown'}",
  "files_modified": ${feature.filesAffected.length}
}
        `.trim();

        const session = await this.createSession({ prompt });
        console.log(`✓ Devin session created: ${session.url}`);

        if (onProgress) {
            onProgress({
                session_created: true,
                session_id: session.sessionId,
                url: session.url,
                status_enum: 'initializing',
                messages: []
            });
        }

        const sessionUrl = session.url;
        const onProgressWithUrl = onProgress ? (status) => {
            if (!status.url && sessionUrl) {
                status.url = sessionUrl;
            }
            onProgress(status);
        } : null;

        const finalStatus = await this.pollSessionStatus(session.sessionId, onProgressWithUrl);
        const structuredOutput = finalStatus.structured_output || {};

        return {
            sessionId: session.sessionId,
            url: session.url,
            prNumber: structuredOutput.pr_number || finalStatus.pull_request || 'N/A',
            branch: `recover-${feature.name.toLowerCase().replace(/\s/g, '-')}-from-${replacedByName.toLowerCase().replace(/\s/g, '-')}`,
            removedConstant: replacedByName,
            restoredConstant: feature.name,
            restoredValue: feature.currentValue || 'unknown',
            status: finalStatus.status_enum,
            messages: finalStatus.messages || []
        };
    },

    // Replace feature flag (high-level function)
    async replaceFeatureFlag(oldFlagName, newFlagName, instruction, feature, onProgress) {
        console.log(`🤖 Devin: Replacing "${oldFlagName}" with "${newFlagName}"`);

        const prompt = `
Replace the "${oldFlagName}" feature flag with "${newFlagName}" that implements: "${instruction}"

CONTEXT:
Current constant: ${oldFlagName} = ${feature.currentValue || 'unknown'}
New constant: ${newFlagName}
User instruction: ${instruction}
Files affected: ${feature.filesAffected.length} files

IMPORTANT PHYSICS RELATIONSHIP:
This is a physics constant where LOWER value = HIGHER jump (inverse relationship).
- Current value: ${oldFlagName} = ${feature.currentValue || 'unknown'}
- To make Mario jump HIGHER, use a LOWER value
- To make Mario jump LOWER, use a HIGHER value

You must CALCULATE the new value for ${newFlagName} based on the user's instruction: "${instruction}"
Use the inverse relationship to intuit what the new value should be.
Do NOT just copy the old value.

CRITICAL PROGRESS TRACKING REQUIREMENT:
You MUST use your "send message to user" action after COMPLETING each step below. This allows real-time tracking on the dashboard. Do NOT batch multiple steps - send ONE message per completed step.

Task Steps (send a message after EACH):

1. Analyze Codebase
   - Identify all ${feature.filesAffected.length} files that reference ${oldFlagName}
   - Calculate changes needed for: "${instruction}"
   Send message: "Step 1 complete: Found ${oldFlagName} in ${feature.filesAffected.length} files. Analyzed requirements."

2. Create Backups
   - Backup all ${feature.filesAffected.length} affected files BEFORE making ANY changes
   - Store complete original state of ${oldFlagName} = ${feature.currentValue || 'unknown'}
   - This backup will be used to RESTORE ${oldFlagName} if user clicks "Restore" later
   Send message: "Step 2 complete: Created backups at [backup-directory]"

3. Remove Old Constant Completely
   - REMOVE ${oldFlagName} definition from ${feature.file}
   - REMOVE all ${feature.filesAffected.length} references to ${oldFlagName} from the codebase
   - This allows ${oldFlagName} to appear in "Removed Feature Flags" after merge
   - User can later click "Restore" to recover ${oldFlagName} = ${feature.currentValue || 'unknown'}
   Send message: "Step 3 complete: Completely removed ${oldFlagName} from codebase"

4. Add New Constant
   - ADD ${newFlagName} definition to ${feature.file}
   - CALCULATE new value using the inverse relationship (lower = higher jump)
   - For instruction "${instruction}", intuit the correct calculation based on physics
   - Remember: ${oldFlagName} was ${feature.currentValue || 'unknown'}, and lower value = higher jump
   - This is a NEW constant, not a rename
   Send message: "Step 4 complete: Added ${newFlagName} with calculated value [show the value]"

5. Update All Code References
   - Update all code that previously used ${oldFlagName} to now use ${newFlagName}
   - Across all ${feature.filesAffected.length} files
   - Game now uses ${newFlagName} implementing: "${instruction}"
   Send message: "Step 5 complete: Updated ${feature.filesAffected.length} files to use ${newFlagName}"

6. Run Tests
   - Lint all modified files
   - Run game to verify changes work correctly
   - Verify: ${instruction}
   Send message: "Step 6 complete: All tests passed. Changes verified."

7. Create Atomic PR
   - Create git branch: replace-${oldFlagName.toLowerCase().replace(/\s/g, '-')}-with-${newFlagName.toLowerCase().replace(/\s/g, '-')}
   - Commit all ${feature.filesAffected.length} files atomically with message: "Replace ${oldFlagName} with ${newFlagName} (${instruction})"
   - CRITICAL: Base branch MUST be "cognition-dashboard-devin-integration" NOT "experiment/enhanced-jump-physics" or any other branch
   - Create PR with:
     * BASE BRANCH: cognition-dashboard-devin-integration (MANDATORY - this is where all PRs must go)
     * HEAD BRANCH: replace-${oldFlagName.toLowerCase().replace(/\s/g, '-')}-with-${newFlagName.toLowerCase().replace(/\s/g, '-')}
     * TITLE: "Replace ${oldFlagName} with ${newFlagName}"
   - Use GitHub CLI command explicitly: gh pr create --base cognition-dashboard-devin-integration --head [your-branch] --title "Replace ${oldFlagName} with ${newFlagName}"
   - PR description should include:
     * ${oldFlagName} = ${feature.currentValue || 'unknown'} → REMOVED (can be restored later)
     * ${newFlagName} → ADDED implementing: ${instruction}
     * Files modified (${feature.filesAffected.length} files)
   Send message: "Step 7 complete: Created PR #[number] to cognition-dashboard-devin-integration at [url]"

8. Finalize
   Send message: "Step 8 complete: All steps complete. ${oldFlagName} will move to 'Removed Feature Flags' after merge. ${newFlagName} will be active."

STRUCTURED OUTPUT (fill this in your final response):
{
  "pr_number": [PR number],
  "backup_file_path": "[full path to backup directory]",
  "branch_name": "replace-${oldFlagName.toLowerCase().replace(/\s/g, '-')}-with-${newFlagName.toLowerCase().replace(/\s/g, '-')}",
  "commit_sha": "[git commit hash]",
  "old_constant": "${oldFlagName}",
  "new_constant": "${newFlagName}",
  "old_value": "${feature.currentValue || 'unknown'}",
  "new_value": "[calculated new value]",
  "instruction": "${instruction}",
  "files_modified": ${feature.filesAffected.length}
}
        `.trim();

        const session = await this.createSession({ prompt });
        console.log(`✓ Devin session created: ${session.url}`);

        if (onProgress) {
            onProgress({
                session_created: true,
                session_id: session.sessionId,
                url: session.url,
                status_enum: 'initializing',
                messages: []
            });
        }

        const sessionUrl = session.url;
        const onProgressWithUrl = onProgress ? (status) => {
            if (!status.url && sessionUrl) {
                status.url = sessionUrl;
            }
            onProgress(status);
        } : null;

        const finalStatus = await this.pollSessionStatus(session.sessionId, onProgressWithUrl);
        const structuredOutput = finalStatus.structured_output || {};

        return {
            sessionId: session.sessionId,
            url: session.url,
            prNumber: structuredOutput.pr_number || finalStatus.pull_request || 'N/A',
            backupPath: structuredOutput.backup_file_path || 'N/A',
            branch: `replace-${oldFlagName.toLowerCase().replace(/\s/g, '-')}-with-${newFlagName.toLowerCase().replace(/\s/g, '-')}`,
            oldConstant: oldFlagName,
            newConstant: newFlagName,
            oldValue: feature.currentValue || 'unknown',
            newValue: structuredOutput.new_value || 'calculated',
            instruction: instruction,
            status: finalStatus.status_enum,
            messages: finalStatus.messages || []
        };
    },
};

// Export for use in dashboard
window.DevinAPI = DevinAPI;
