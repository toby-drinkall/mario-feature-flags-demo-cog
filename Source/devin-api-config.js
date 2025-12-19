// Devin API Configuration
// API key is stored in localStorage for security - not committed to git
// Use DevinAPI.configure(apiKey) to set your API key

const DevinAPI = {
    // API Configuration - key loaded from localStorage
    config: {
        apiUrl: 'https://api.devin.ai/v1',
        get apiKey() {
            return localStorage.getItem('devin_api_key') || 'YOUR_API_KEY';
        },
        timeout: 300000, // 5 minutes max per operation
        repository: 'https://github.com/toby-drinkall/mario-feature-flags-demo-cog.git',
    },

    // Configure API key (stores in localStorage)
    configure(apiKey) {
        localStorage.setItem('devin_api_key', apiKey);
        console.log('Devin API key configured successfully');
    },

    // Check if API is configured
    isConfigured() {
        const key = this.config.apiKey;
        return key && key !== 'YOUR_API_KEY' && key.length > 10;
    },

    // Clear API key
    clearConfig() {
        localStorage.removeItem('devin_api_key');
        console.log('Devin API key cleared');
    },

    // Create a new Devin session
    async createSession(sessionConfig) {
        if (!this.isConfigured()) {
            throw new Error('Devin API key not configured. Use DevinAPI.configure(apiKey) to set it.');
        }

        try {
            const response = await fetch(`${this.config.apiUrl}/sessions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.apiKey}`,
                },
                body: JSON.stringify({
                    ...sessionConfig,
                    idempotent: true,
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Session creation failed: ${response.status} ${response.statusText} - ${errorText}`);
            }

            const data = await response.json();
            console.log('Devin session created:', data.session_id);
            return { sessionId: data.session_id, ...data };
        } catch (error) {
            console.error('Devin session creation failed:', error);
            throw error;
        }
    },

    // Send a message to Devin session
    async sendMessage(sessionId, message) {
        if (!this.isConfigured()) {
            throw new Error('Devin API key not configured.');
        }

        try {
            const response = await fetch(`${this.config.apiUrl}/session/${sessionId}/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.apiKey}`,
                },
                body: JSON.stringify({ message })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Message send failed: ${response.status} ${response.statusText} - ${errorText}`);
            }

            const data = await response.json();
            console.log('Message sent to Devin:', data);
            return data;
        } catch (error) {
            console.error('Failed to send message to Devin:', error);
            throw error;
        }
    },

    // Get session status
    async getSessionStatus(sessionId) {
        if (!this.isConfigured()) {
            throw new Error('Devin API key not configured.');
        }

        try {
            const response = await fetch(`${this.config.apiUrl}/session/${sessionId}`, {
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`,
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Status check failed: ${response.status} ${response.statusText} - ${errorText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Status check failed:', error);
            throw error;
        }
    },

    // Wait for session to complete or reach a checkpoint with polling
    async waitForCompletion(sessionId, onProgress, maxWaitMs = 300000) {
        const pollInterval = 3000; // 3 seconds
        const startTime = Date.now();

        while (Date.now() - startTime < maxWaitMs) {
            const status = await this.getSessionStatus(sessionId);

            // Call progress callback if provided
            if (onProgress) {
                onProgress(status);
            }

            // Check completion states
            if (status.status_enum === 'finished' || status.status_enum === 'stopped') {
                return status;
            } else if (status.status_enum === 'blocked') {
                // Session is blocked, might need user input
                console.log('Session blocked, may need input');
                return status;
            }

            // Wait before next poll
            await new Promise(resolve => setTimeout(resolve, pollInterval));
        }

        throw new Error('Session timeout - waited ' + (maxWaitMs / 1000) + ' seconds');
    },

    // Remove feature flag (high-level function)
    async removeFeatureFlag(feature, onProgress) {
        console.log(`Devin: Starting removal of "${feature.name}"`);

        // Create session with the task
        const session = await this.createSession({
            prompt: this.buildRemovalPrompt(feature),
        });

        // Send the detailed instruction
        await this.sendMessage(session.sessionId, this.buildRemovalPrompt(feature));

        // Wait for completion with progress updates
        const result = await this.waitForCompletion(
            session.sessionId,
            onProgress
        );

        return {
            sessionId: session.sessionId,
            sessionUrl: `https://app.devin.ai/sessions/${session.sessionId}`,
            status: result.status_enum,
            result: result,
        };
    },

    // Build removal prompt for Devin
    buildRemovalPrompt(feature) {
        return `
Remove the "${feature.name}" feature flag from the Mario game codebase.

IMPORTANT: This is the repository: ${this.config.repository}

## Feature Details
- Name: ${feature.name}
- Description: ${feature.description}
- File: ${feature.file}
- Category: ${feature.category}

## Instructions

1. **Clone and Setup**
   - Clone the repository: ${this.config.repository}
   - Checkout the master branch

2. **Locate the Feature**
   - Open ${feature.file}
   - Find the mod object with name: "${feature.name}"
   - The feature is defined as an object in the mods array with "name": "${feature.name}"

3. **Create Backup**
   - Create a backup file: backups/removed-${feature.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.json
   - Save the complete feature definition to this backup file
   - Include metadata: removedAt timestamp, feature name, original location

4. **Remove the Feature**
   - Delete the entire mod object for "${feature.name}" from the mods array
   - Make sure to handle the trailing comma correctly to maintain valid JavaScript
   - Do NOT remove any other features

5. **Validate**
   - Run the linter: npx grunt tslint
   - Ensure no syntax errors

6. **Git Operations**
   - Create branch: remove-${feature.name.toLowerCase().replace(/\s+/g, '-')}
   - Commit with message: "Remove ${feature.name} feature flag"
   - Push the branch
   - Create a Pull Request to master with title: "Remove ${feature.name} feature flag"

7. **Report Results**
   - Provide the PR URL when complete
   - Confirm the backup was created

Please proceed with these steps and report your progress.
        `.trim();
    },

    // Recover feature flag (high-level function)
    async recoverFeatureFlag(feature, removalPR, onProgress) {
        console.log(`Devin: Starting recovery of "${feature.name}"`);

        // Create session
        const session = await this.createSession({
            prompt: this.buildRecoveryPrompt(feature, removalPR),
        });

        // Send the detailed instruction
        await this.sendMessage(session.sessionId, this.buildRecoveryPrompt(feature, removalPR));

        // Wait for completion with progress updates
        const result = await this.waitForCompletion(
            session.sessionId,
            onProgress
        );

        return {
            sessionId: session.sessionId,
            sessionUrl: `https://app.devin.ai/sessions/${session.sessionId}`,
            status: result.status_enum,
            result: result,
        };
    },

    // Build recovery prompt for Devin
    buildRecoveryPrompt(feature, removalPR) {
        return `
Recover the "${feature.name}" feature flag that was previously removed.

IMPORTANT: This is the repository: ${this.config.repository}

## Feature Details
- Name: ${feature.name}
- Description: ${feature.description}
- File: ${feature.file}
- Original Removal PR: #${removalPR}

## Instructions

1. **Clone and Setup**
   - Clone the repository: ${this.config.repository}
   - Checkout the master branch

2. **Find the Backup**
   - Look in the backups/ directory for a file matching: removed-${feature.name.toLowerCase().replace(/\s+/g, '-')}-*.json
   - Load the backup file to get the original feature definition

3. **Restore the Feature**
   - Open ${feature.file}
   - Add the feature definition back to the mods array
   - Place it in an appropriate location (alphabetically or at the end)
   - Ensure proper comma handling for valid JavaScript

4. **Validate**
   - Run the linter: npx grunt tslint
   - Ensure no syntax errors

5. **Git Operations**
   - Create branch: recover-${feature.name.toLowerCase().replace(/\s+/g, '-')}
   - Commit with message: "Recover ${feature.name} feature flag (reverts PR #${removalPR})"
   - Push the branch
   - Create a Pull Request to master

6. **Report Results**
   - Provide the PR URL when complete

Please proceed with these steps and report your progress.
        `.trim();
    },

    // Enable feature permanently (high-level function)
    async enableFeaturePermanently(feature, onProgress) {
        console.log(`Devin: Permanently enabling "${feature.name}"`);

        // Create session
        const session = await this.createSession({
            prompt: this.buildEnablePrompt(feature),
        });

        // Send the detailed instruction
        await this.sendMessage(session.sessionId, this.buildEnablePrompt(feature));

        // Wait for completion with progress updates
        const result = await this.waitForCompletion(
            session.sessionId,
            onProgress
        );

        return {
            sessionId: session.sessionId,
            sessionUrl: `https://app.devin.ai/sessions/${session.sessionId}`,
            status: result.status_enum,
            result: result,
        };
    },

    // Build enable prompt for Devin
    buildEnablePrompt(feature) {
        return `
Permanently enable the "${feature.name}" feature in the Mario game.

IMPORTANT: This is the repository: ${this.config.repository}

## Feature Details
- Name: ${feature.name}
- Description: ${feature.description}
- File: ${feature.file}
- Category: ${feature.category}

## Goal
Make this feature always active by integrating its behavior into the core game, then remove it from the toggleable mods list.

## Instructions

1. **Clone and Setup**
   - Clone the repository: ${this.config.repository}
   - Checkout the master branch

2. **Analyze the Feature**
   - Open ${feature.file}
   - Find the mod object with name: "${feature.name}"
   - Understand what the feature does (its event handlers and behavior)

3. **Create Backup**
   - Create a backup file: backups/enabled-${feature.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.json
   - Save the complete feature definition

4. **Integrate the Feature**
   - The feature's event handlers need to be made permanent
   - For this Mario game, "permanently enabling" means the mod stays in the list but is always enabled
   - Add a property "enabled": true to the mod definition
   - This makes it default to ON

5. **Validate**
   - Run the linter: npx grunt tslint
   - Ensure no syntax errors

6. **Git Operations**
   - Create branch: enable-${feature.name.toLowerCase().replace(/\s+/g, '-')}
   - Commit with message: "Enable ${feature.name} permanently"
   - Push the branch
   - Create a Pull Request to master

7. **Report Results**
   - Provide the PR URL when complete

Please proceed with these steps and report your progress.
        `.trim();
    },
};

// Export for use in dashboard
window.DevinAPI = DevinAPI;
