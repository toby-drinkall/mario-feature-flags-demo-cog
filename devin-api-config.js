// Devin API Configuration Template
// Copy this file to 'devin-api-config.js' and fill in your credentials
// IMPORTANT: devin-api-config.js is in .gitignore and will NOT be committed

const DevinAPI = {
    // API Configuration
    config: {
        // Use proxy server to avoid CORS issues (proxy forwards to api.devin.ai)
        apiUrl: 'http://localhost:3000/api/devin',
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

            // Try to fetch additional detail endpoints if they exist
            try {
                // Check for events/messages endpoint
                const eventsResponse = await fetch(`${this.config.apiUrl}/sessions/${sessionId}/events`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${this.config.apiKey}`,
                    }
                });

                if (eventsResponse.ok) {
                    const events = await eventsResponse.json();
                    data.events = events;
                    console.log('📝 Found events endpoint:', events);
                }
            } catch (e) {
                // Events endpoint doesn't exist, that's ok
            }

            return data;
        } catch (error) {
            console.error('✗ Status check failed:', error);
            throw error;
        }
    },

    // List all sessions
    async listSessions() {
        try {
            console.log('📋 Fetching all Devin sessions...');
            const response = await fetch(`${this.config.apiUrl}/sessions`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`,
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to list sessions: ${response.statusText}`);
            }

            const data = await response.json();
            console.log(`✓ Found ${data.length || 0} sessions`);
            return data;
        } catch (error) {
            console.error('✗ Failed to list sessions:', error);
            throw error;
        }
    },

    // Pause a running Devin session (preferred over delete)
    async pauseSession(sessionId) {
        try {
            console.log(`⏸️  Pausing Devin session: ${sessionId}`);

            // Try pause endpoint first
            const pauseResponse = await fetch(`${this.config.apiUrl}/sessions/${sessionId}/pause`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`,
                }
            });

            if (pauseResponse.ok) {
                console.log('✓ Devin session paused');
                return { method: 'paused', success: true };
            }

            // If pause endpoint doesn't exist (404), try PATCH with status
            if (pauseResponse.status === 404) {
                console.log('📝 Pause endpoint not found, trying PATCH...');
                const patchResponse = await fetch(`${this.config.apiUrl}/sessions/${sessionId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.config.apiKey}`,
                    },
                    body: JSON.stringify({ status: 'paused' })
                });

                if (patchResponse.ok) {
                    console.log('✓ Devin session paused via PATCH');
                    return { method: 'paused', success: true };
                }
            }

            // If both failed, fall back to delete (terminate)
            console.log('⚠️  Pause not supported, falling back to terminate...');
            return await this.cancelSession(sessionId);
        } catch (error) {
            console.error('✗ Failed to pause session:', error);
            // Fall back to cancel if pause fails
            console.log('⚠️  Pause failed, trying to terminate...');
            return await this.cancelSession(sessionId);
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

    // Pause/stop all active sessions
    async stopAllSessions() {
        try {
            console.log('⏸️  Pausing all active Devin sessions...');
            const sessions = await this.listSessions();

            if (!sessions || sessions.length === 0) {
                console.log('ℹ️ No active sessions found');
                return { paused: 0, terminated: 0, failed: 0, total: 0 };
            }

            let paused = 0;
            let terminated = 0;
            let failed = 0;

            for (const session of sessions) {
                const sessionId = session.session_id || session.id;
                const status = session.status_enum || session.status;

                // Only pause running/active sessions
                if (status === 'running' || status === 'active' || status === 'working') {
                    try {
                        const result = await this.pauseSession(sessionId);
                        if (result.method === 'paused') {
                            paused++;
                        } else if (result.method === 'terminated') {
                            terminated++;
                        }
                    } catch (err) {
                        console.error(`Failed to pause session ${sessionId}:`, err);
                        failed++;
                    }
                }
            }

            console.log(`✓ Paused ${paused}, terminated ${terminated}, failed ${failed}`);
            return { paused, terminated, failed, total: sessions.length };
        } catch (error) {
            console.error('✗ Failed to pause all sessions:', error);
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

                // Enhanced logging with all available fields
                console.log(`📊 Poll ${attempts + 1} (${elapsed}s elapsed):`);
                console.log(`   Status: ${status.status_enum || status.status}`);
                console.log(`   Updated: ${status.updated_at}`);
                console.log(`   URL: ${status.url || 'NOT PRESENT'}`);

                // Log any additional fields that might contain progress info
                if (status.current_action) console.log(`   Current Action: ${status.current_action}`);
                if (status.thought) console.log(`   Thought: ${status.thought}`);
                if (status.progress) console.log(`   Progress: ${status.progress}`);
                if (status.messages && status.messages.length > 0) {
                    console.log(`   Messages: ${status.messages.length} messages`);
                    // Log the last message
                    const lastMsg = status.messages[status.messages.length - 1];
                    if (lastMsg) {
                        console.log(`   Latest: "${lastMsg.message || lastMsg.content || JSON.stringify(lastMsg).substring(0, 100)}"`);
                    }
                }
                if (status.events && status.events.length > 0) {
                    console.log(`   Events: ${status.events.length} events`);
                }

                // Enhanced status with computed fields
                const enhancedStatus = {
                    ...status,
                    elapsed_seconds: elapsed,
                    poll_count: attempts + 1,
                    last_poll_time: new Date().toISOString()
                };

                // Call progress callback with enhanced status
                if (onProgress) {
                    onProgress(enhancedStatus);
                }

                // Check if session is finished
                // "blocked" means Devin finished but is waiting for user (e.g., PR created, awaiting review)
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
                // Continue polling even on error (might be temporary network issue)
                await new Promise(resolve => setTimeout(resolve, pollInterval));
                attempts++;
            }
        }

        throw new Error('Session timeout - Devin is still working but exceeded max polling time');
    },

    // Remove feature flag (high-level function)
    async removeFeatureFlag(feature, onProgress) {
        console.log(`🤖 Devin: Starting removal of "${feature.name}"`);

        // Create session with a detailed prompt
        const prompt = `
Remove the "${feature.name}" feature flag from the codebase.

CRITICAL PROGRESS TRACKING REQUIREMENT:
You MUST use your "send message to user" action after COMPLETING each step below. This allows real-time tracking on the dashboard. Do NOT batch multiple steps - send ONE message per completed step.

Task Steps (send a message after EACH):

1. **Locate Feature Flag**
   - Find the feature flag in ${feature.file} (lines ${feature.lineStart}-${feature.lineEnd})
   - Send message: "Step 1 complete: Found feature flag at [file:line]. Code spans X lines."

2. **Create Backup**
   - Create a backup file of the code before removal
   - Send message: "Step 2 complete: Backup created at [path]"

3. **Remove Feature Flag**
   - Remove the feature flag code from ${feature.file}
   - Send message: "Step 3 complete: Removed lines ${feature.lineStart}-${feature.lineEnd}"

4. **Run Tests**
   - Run the test suite to verify nothing breaks
   - Send message: "Step 4 complete: Tests [passed/failed]. [X] tests run."

5. **Create Branch**
   - Create git branch: remove-${feature.name.toLowerCase().replace(/\s/g, '-')}
   - Send message: "Step 5 complete: Created branch [branch-name]"

6. **Commit Changes**
   - Commit with message: "Remove ${feature.name} feature flag"
   - Send message: "Step 6 complete: Committed changes with SHA [commit-sha]"

7. **Create Pull Request**
   - Create PR with title: "Remove ${feature.name} feature flag"
   - Include automation note in description
   - Send message: "Step 7 complete: Created PR #[number] at [url]"

8. **Finalize**
   - Send message: "Step 8 complete: All steps complete."

STRUCTURED OUTPUT (fill this in your final response):
{
  "pr_number": [PR number],
  "backup_file_path": "[full path to backup]",
  "branch_name": "remove-${feature.name.toLowerCase().replace(/\s/g, '-')}",
  "commit_sha": "[git commit hash]"
}
        `.trim();

        const session = await this.createSession({ prompt });

        console.log(`✓ Devin session created: ${session.url}`);
        console.log(`   Session ID: ${session.sessionId}`);
        console.log('⏳ Polling Devin for real-time progress...');

        // Immediately notify with session info so UI can show "View in Devin Session" link
        if (onProgress) {
            console.log('📤 Sending immediate onProgress callback with session info...');
            onProgress({
                session_created: true,
                session_id: session.sessionId,
                url: session.url,
                status_enum: 'initializing',
                messages: []
            });
            console.log('   ✓ Callback sent');
        } else {
            console.warn('⚠️  onProgress callback not provided!');
        }

        // Store session URL for polling to include in all status updates
        const sessionUrl = session.url;

        // Poll for completion with real progress updates
        // Create a wrapper that ensures URL is always included
        const onProgressWithUrl = onProgress ? (status) => {
            // Ensure URL is always present in status updates
            if (!status.url && sessionUrl) {
                status.url = sessionUrl;
            }
            onProgress(status);
        } : null;

        const finalStatus = await this.pollSessionStatus(session.sessionId, onProgressWithUrl);

        // Extract real results from Devin's structured output
        const structuredOutput = finalStatus.structured_output || {};

        return {
            sessionId: session.sessionId,
            url: session.url,
            prNumber: structuredOutput.pr_number || finalStatus.pull_request || 'N/A',
            backupPath: structuredOutput.backup_file_path || 'N/A',
            branch: `remove-${feature.name.toLowerCase().replace(/\s/g, '-')}`,
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
You MUST use your "send message to user" action after COMPLETING each step below. This allows real-time tracking on the dashboard. Do NOT batch multiple steps - send ONE message per completed step.

Task Steps (send a message after EACH):

1. **Load Backup**
   - Find and load the backup file for this feature
   - Send message: "Step 1 complete: Found backup at [path]"

2. **Analyze Removal PR**
   - Review PR #${removalPR} to understand what was removed
   - Send message: "Step 2 complete: Analyzed PR #${removalPR}. Removed [X] lines from [file]"

3. **Restore Feature Code**
   - Restore the feature flag code to ${feature.file} at line ${feature.lineStart}
   - Send message: "Step 3 complete: Restored code to ${feature.file}:${feature.lineStart}"

4. **Run Tests**
   - Run test suite to verify functionality
   - Send message: "Step 4 complete: Tests [passed/failed]. [X] tests run."

5. **Create Branch**
   - Create git branch: recover-${feature.name.toLowerCase().replace(/\s/g, '-')}
   - Send message: "Step 5 complete: Created branch [branch-name]"

6. **Commit Changes**
   - Commit with message: "Recover ${feature.name} feature flag"
   - Send message: "Step 6 complete: Committed changes with SHA [commit-sha]"

7. **Create Pull Request**
   - Create PR with title: "Recover ${feature.name} feature flag"
   - Include note that this reverts PR #${removalPR}
   - Send message: "Step 7 complete: Created PR #[number] at [url]"

8. **Finalize**
   - Send message: "Step 8 complete: All steps complete."

STRUCTURED OUTPUT (fill this in your final response):
{
  "pr_number": [PR number],
  "branch_name": "recover-${feature.name.toLowerCase().replace(/\s/g, '-')}",
  "commit_sha": "[git commit hash]",
  "reverts_pr": ${removalPR}
}
        `.trim();

        const session = await this.createSession({ prompt });

        console.log(`✓ Devin session created: ${session.url}`);
        console.log(`   Session ID: ${session.sessionId}`);
        console.log('⏳ Polling Devin for real-time progress...');

        // Immediately notify with session info so UI can show "View in Devin Session" link
        if (onProgress) {
            console.log('📤 Sending immediate onProgress callback with session info...');
            onProgress({
                session_created: true,
                session_id: session.sessionId,
                url: session.url,
                status_enum: 'initializing',
                messages: []
            });
            console.log('   ✓ Callback sent');
        } else {
            console.warn('⚠️  onProgress callback not provided!');
        }

        // Store session URL for polling to include in all status updates
        const sessionUrl = session.url;

        // Poll for completion with real progress updates
        // Create a wrapper that ensures URL is always included
        const onProgressWithUrl = onProgress ? (status) => {
            // Ensure URL is always present in status updates
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
            branch: `recover-${feature.name.toLowerCase().replace(/\s/g, '-')}`,
            status: finalStatus.status_enum,
            messages: finalStatus.messages || []
        };
    },
};

// Export for use in dashboard
window.DevinAPI = DevinAPI;
