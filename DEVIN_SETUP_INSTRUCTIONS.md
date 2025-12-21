# Devin Setup Instructions for Feature Flag Automation

## Overview
This project uses Devin to automate feature flag removal from the Mario game. Devin will:
1. Analyze the codebase
2. Remove feature flag code
3. Create a backup
4. Run tests
5. Create a Pull Request for your review

## Repository Access

**Repository URL:**
```
https://github.com/toby-drinkall/mario-feature-flags-demo-cog.git
```

**Connection Method:** GitHub App (recommended)
- Go to Devin → Connections → GitHub Connections
- Click "Add repos"
- Select: `toby-drinkall/mario-feature-flags-demo-cog`

## Installation Commands

**Section: "Use the VS Code terminal to install any tools or dependencies Devin needs"**

Add this command:
```bash
npm install
```

This installs development dependencies (Grunt, TypeScript, testing tools) that Devin might need for building or testing.

## Dependency Maintenance

**Section: "Maintain dependencies"**

Add this command:
```bash
npm install
```

This ensures dependencies stay up-to-date if package.json changes.

## Secrets Configuration

**Section: "Configure secrets"**

❌ **Not needed** - Skip this section.

Why: The Devin API credentials are in `Source/devin-api-config.js` which is git-ignored and stays local to your machine.

## What Devin Will Do

### For Feature Flag REMOVAL:

1. **Create Devin Session** (~1s)
   - Session ID generated

2. **Analyze Codebase** (~2s)
   - Reads `Source/settings/mods.js`
   - Finds the feature at specific line numbers

3. **Create Backup** (~1s)
   - Saves to: `backups/removed-<feature-name>-<timestamp>.json`
   - Contains full original code for recovery

4. **Remove Feature** (~3s)
   - Deletes the feature definition from `Source/settings/mods.js`
   - Example: Removes lines 5-35 for "Bouncy Bounce"

5. **Run Tests** (~5s)
   - Runs: `npm test` (if available)
   - Validates syntax with: `node -c Source/settings/mods.js`

6. **Git Operations** (~2s)
   - Creates branch: `remove-<feature-name>`
   - Commits with descriptive message
   - Pushes to GitHub

7. **Create Pull Request** (~2s)
   - Opens PR on GitHub
   - Title: "Remove [Feature Name] permanently"
   - Includes:
     - Summary of changes
     - File diff (-X lines)
     - Link to backup file
     - Test results

8. **Returns to Dashboard**
   - Shows PR number
   - Moves feature to "Removed Features" tab
   - Shows "Restore" button

### Important Notes:

✅ **Devin creates a PR - does NOT merge automatically**
✅ **You review the PR on GitHub first**
✅ **You decide when to merge**
✅ **Backup is always created before removal**
✅ **Recovery is possible via "Restore" button**

## Workflow Visualization

```
Dashboard (Click "Remove")
         ↓
   Devin Session Starts
         ↓
   Analyzes Codebase
         ↓
   Creates Backup
         ↓
   Removes Feature Code
         ↓
   Runs Tests
         ↓
   Creates Git Branch
         ↓
   Creates Pull Request ← STOPS HERE
         ↓
   [YOU REVIEW PR ON GITHUB]
         ↓
   [YOU CLICK "MERGE" IF APPROVED]
         ↓
   Feature Actually Removed from Master
         ↓
   GitHub Action Deploys Updated Code
```

## Task Requirements Fulfilled

✅ **Lightweight dashboard** - `cognition-dashboard-premium.html`
✅ **List of existing feature flags** - Shows all 16 features
✅ **Trigger session to remove flag** - "Remove" button starts Devin
✅ **Create a PR** - Devin creates PR automatically

## GitHub Pages Deployment (Optional)

After you merge a PR, the GitHub Action (`.github/workflows/deploy.yml`) will:
1. Automatically deploy to `gh-pages` branch
2. Update your live dashboard
3. Takes 1-2 minutes

**Live URL (after enabling GitHub Pages):**
```
https://toby-drinkall.github.io/mario-feature-flags-demo-cog/cognition-dashboard-premium.html
```

## Testing the Integration

1. **Open Dashboard:**
   ```bash
   open Source/cognition-dashboard-premium.html
   ```

2. **Launch Game:**
   - Click "Launch Game" button
   - Wait for "Game Connected" status

3. **Remove a Feature:**
   - Click "Remove" on any feature
   - Devin modal appears
   - Click "Start Automation"
   - Watch progress (9 steps)
   - Get PR number when complete

4. **Review on GitHub:**
   - Go to: `https://github.com/toby-drinkall/mario-feature-flags-demo-cog/pulls`
   - Click the PR Devin created
   - Review the diff
   - Merge if approved

5. **Verify Removal:**
   - Refresh dashboard
   - Feature should be in "Removed Features" tab
   - Backup file created in `backups/` folder

## Recovery

To restore a removed feature:
1. Click "Restore" button in "Removed Features" tab
2. Devin creates recovery PR
3. Review and merge
4. Feature returns to "Feature Testing" tab

## Questions?

- **"Does Devin change my code directly?"** - No, it creates a PR first
- **"Can I undo a removal?"** - Yes, use the "Restore" button
- **"Where are backups stored?"** - In `backups/` folder (git-ignored)
- **"Do I need to configure Devin API?"** - Only in `Source/devin-api-config.js` (already done)
