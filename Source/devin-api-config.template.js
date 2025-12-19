// Devin API Configuration Template
// Copy this file to 'devin-api-config.js' and fill in your credentials
// IMPORTANT: devin-api-config.js is in .gitignore and will NOT be committed

const DevinAPI = {
    // API Configuration
    config: {
        apiUrl: 'YOUR_DEVIN_API_URL', // e.g., 'https://api.devin.ai/v1'
        apiKey: 'YOUR_API_KEY',       // Your Devin API key
        timeout: 300000, // 5 minutes max per operation
        
        // GitHub Configuration (optional - enables merge from dashboard)
        // Create a fine-grained PAT with 'Contents: Read and write' permission
        // for the mario-feature-flags-demo-cog repository
        githubToken: '', // Your GitHub Personal Access Token (leave empty to disable merge button)
        githubRepo: 'toby-drinkall/mario-feature-flags-demo-cog',
    },

    // Check if GitHub token is configured
    isGitHubConfigured() {
        return this.config.githubToken && this.config.githubToken.length > 0;
    },

    // Merge a PR via GitHub API
    async mergePR(prNumber) {
        if (!this.isGitHubConfigured()) {
            throw new Error('GitHub token not configured');
        }

        // Safety check: only allow on localhost or file: protocol
        const isLocalhost = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1' ||
                           window.location.protocol === 'file:';
        if (!isLocalhost) {
            throw new Error('Merge from dashboard is only allowed on localhost for security');
        }

        const response = await fetch(
            `https://api.github.com/repos/${this.config.githubRepo}/pulls/${prNumber}/merge`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.config.githubToken}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    merge_method: 'merge', // or 'squash' or 'rebase'
                    commit_title: `Merge PR #${prNumber}`,
                })
            }
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || `Failed to merge PR: ${response.status}`);
        }

        return await response.json();
    },

    // Check PR status with authentication (higher rate limit)
    async checkPRStatus(prNumber) {
        const headers = {
            'Accept': 'application/vnd.github.v3+json',
        };
        
        if (this.isGitHubConfigured()) {
            headers['Authorization'] = `Bearer ${this.config.githubToken}`;
        }

        const response = await fetch(
            `https://api.github.com/repos/${this.config.githubRepo}/pulls/${prNumber}`,
            { headers }
        );

        if (!response.ok) {
            throw new Error(`Failed to check PR status: ${response.status}`);
        }

        const data = await response.json();
        return {
            merged: data.merged_at !== null,
            state: data.state,
            merged_at: data.merged_at,
            mergeable: data.mergeable,
            mergeable_state: data.mergeable_state,
        };
    },

    // Create a new Devin session
    async createSession(sessionConfig) {
        try {
            const response = await fetch(`${this.config.apiUrl}/sessions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.apiKey}`,
                },
                body: JSON.stringify(sessionConfig)
            });

            if (!response.ok) {
                throw new Error(`Session creation failed: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('✓ Devin session created:', data.sessionId);
            return data;
        } catch (error) {
            console.error('✗ Devin session creation failed:', error);
            throw error;
        }
    },

    // Send a task to Devin
    async executeTask(sessionId, task) {
        try {
            const response = await fetch(`${this.config.apiUrl}/sessions/${sessionId}/tasks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.apiKey}`,
                },
                body: JSON.stringify(task)
            });

            if (!response.ok) {
                throw new Error(`Task execution failed: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('✓ Devin task executed:', data);
            return data;
        } catch (error) {
            console.error('✗ Devin task execution failed:', error);
            throw error;
        }
    },

    // Poll task status
    async getTaskStatus(sessionId, taskId) {
        try {
            const response = await fetch(`${this.config.apiUrl}/sessions/${sessionId}/tasks/${taskId}`, {
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

    // Wait for task completion with polling
    async waitForCompletion(sessionId, taskId, onProgress) {
        const pollInterval = 2000; // 2 seconds
        const maxAttempts = 150; // 5 minutes max
        let attempts = 0;

        while (attempts < maxAttempts) {
            const status = await this.getTaskStatus(sessionId, taskId);

            // Call progress callback if provided
            if (onProgress) {
                onProgress(status);
            }

            // Check completion
            if (status.state === 'completed') {
                return status;
            } else if (status.state === 'failed') {
                throw new Error(`Task failed: ${status.error}`);
            }

            // Wait before next poll
            await new Promise(resolve => setTimeout(resolve, pollInterval));
            attempts++;
        }

        throw new Error('Task timeout');
    },

    // Remove feature flag (high-level function)
    async removeFeatureFlag(feature) {
        console.log(`🤖 Devin: Starting removal of "${feature.name}"`);

        // Create session
        const session = await this.createSession({
            name: `Remove ${feature.name} feature flag`,
            repository: window.location.origin, // Or your actual repo URL
        });

        // Define the removal task
        const task = {
            instruction: `
Remove the "${feature.name}" feature flag from the codebase.

Steps:
1. Locate the feature flag in ${feature.file} (lines ${feature.lineStart}-${feature.lineEnd})
2. Create a backup of the code before removing it
3. Remove the feature flag code
4. Run the test suite to ensure nothing breaks
5. Create a new git branch: remove-${feature.name.toLowerCase().replace(/\s/g, '-')}
6. Commit the changes with message: "Remove ${feature.name} feature flag"
7. Create a Pull Request with title: "Remove ${feature.name} feature flag"
8. Include in the PR description that this was automated and a backup exists

Return the PR number and backup file path.
            `.trim(),
            context: {
                featureName: feature.name,
                file: feature.file,
                lineStart: feature.lineStart,
                lineEnd: feature.lineEnd,
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
            sessionId: session.sessionId,
            prNumber: result.prNumber,
            backupPath: result.backupPath,
            branch: result.branch,
        };
    },

    // Recover feature flag (high-level function)
    async recoverFeatureFlag(feature, removalPR) {
        console.log(`🤖 Devin: Starting recovery of "${feature.name}"`);

        // Create session
        const session = await this.createSession({
            name: `Recover ${feature.name} feature flag`,
            repository: window.location.origin,
        });

        // Define the recovery task
        const task = {
            instruction: `
Recover the "${feature.name}" feature flag that was removed in PR #${removalPR}.

Steps:
1. Load the backup file for this feature
2. Analyze the removal PR #${removalPR} to understand what was removed
3. Restore the feature flag code to ${feature.file} at line ${feature.lineStart}
4. Run the test suite to verify functionality
5. Create a new git branch: recover-${feature.name.toLowerCase().replace(/\s/g, '-')}
6. Commit the changes with message: "Recover ${feature.name} feature flag"
7. Create a Pull Request with title: "Recover ${feature.name} feature flag"
8. Include in the PR description that this reverts PR #${removalPR}

Return the PR number.
            `.trim(),
            context: {
                featureName: feature.name,
                file: feature.file,
                lineStart: feature.lineStart,
                originalPR: removalPR,
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
            sessionId: session.sessionId,
            prNumber: result.prNumber,
            branch: result.branch,
        };
    },
};

// Export for use in dashboard
window.DevinAPI = DevinAPI;
