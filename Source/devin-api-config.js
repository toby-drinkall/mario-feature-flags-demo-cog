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
};

// Export for use in dashboard
window.DevinAPI = DevinAPI;
