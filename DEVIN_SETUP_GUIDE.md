# Devin Integration Setup Guide

## Current Status ✅

Your dashboard is **already configured** with:
- ✅ Devin API key: `apk_user_ZW1haWx8NjkzNGIxYzVjYTkwY2JhNWQ3MWNkZDNlX29yZy02ODI3NzczYmQ3MTk0YzI0YTQyN2NkNGRiM2M4YmY2ZDozOGU3ZDU5NGYzNTI0MmU0OTYzNDNlOGIyNDJkY2QxZg==`
- ✅ API endpoint: `https://api.devin.ai/v1`
- ✅ Integration code in `Source/devin-api-config.js`
- ✅ Dashboard UI ready in `Source/cognition-dashboard-premium.html`

## Repository Information

**Primary Repo**: `https://github.com/umaim/Mario.git`  
**Personal Fork**: `https://github.com/toby-drinkall/mario-feature-flags-demo.git`

## Setup Steps

### 1. Give Devin Repository Access

Devin needs access to your GitHub repository to create PRs. You have two options:

#### Option A: Use Your Personal Fork (Recommended)
This gives you full control and keeps changes isolated.

1. **Update the config** to use your personal fork:
   ```javascript
   // In Source/devin-api-config.js, update line 121:
   repository: 'https://github.com/toby-drinkall/mario-feature-flags-demo.git'
   ```

2. **Grant Devin access** to your GitHub:
   - Go to Devin dashboard
   - Navigate to Settings → Integrations → GitHub
   - Authorize Devin to access your repositories
   - Select `toby-drinkall/mario-feature-flags-demo`

#### Option B: Use Original Repo (Requires Permissions)
Only if you have write access to `umaim/Mario`.

### 2. Test the Connection

Run a simple test to verify everything works:

```bash
# Open the dashboard
open Source/cognition-dashboard-premium.html

# In browser console:
DevinAPI.createSession({name: "Test connection"})
  .then(session => console.log("✓ Connected:", session))
  .catch(err => console.error("✗ Failed:", err))
```

Expected response:
```json
{
  "sessionId": "dvn_abc123...",
  "state": "active"
}
```

### 3. Verify GitHub Integration

Check if Devin can access your repo:

1. Log into Devin dashboard: https://app.devin.ai
2. Go to **Integrations** tab
3. Verify GitHub shows "Connected"
4. Check that your repository appears in the list

### 4. Configure Repository in Code

Update `Source/devin-api-config.js` line 121 with your actual repo:

```javascript
// Current (placeholder):
repository: window.location.origin

// Change to (your actual GitHub repo):
repository: 'https://github.com/toby-drinkall/mario-feature-flags-demo.git'
```

## How the Automation Works

### Removal Flow

1. **User clicks "Remove"** on a feature in dashboard
2. **Confirmation modal** shows what Devin will do
3. **User clicks "Start Automation"**
4. **Dashboard calls** `DevinAPI.removeFeatureFlag(feature)`
5. **Devin creates session** and receives instructions:
   - Feature name, file path, line numbers
   - Steps to follow (backup, remove, test, commit, PR)
6. **Devin executes**:
   - Clones your repository
   - Creates backup of feature code
   - Removes lines from `Source/settings/mods.js`
   - Runs tests to verify game still works
   - Creates branch: `remove-bouncy-bounce`
   - Commits: "Remove Bouncy Bounce feature flag"
   - Pushes to GitHub
   - Creates Pull Request
7. **Devin returns** PR number and details
8. **Dashboard shows** success with clickable PR link

### Recovery Flow

Same process but in reverse - restores the feature from backup.

## Automation Design Recommendations

### What Devin Should Do

✅ **Should**:
- Create detailed backups (JSON with metadata)
- Run full test suite before committing
- Use descriptive branch names
- Write clear commit messages
- Create PRs with proper descriptions
- Link to backup files in PR
- Verify code syntax before committing

❌ **Should Not**:
- Skip tests
- Force push
- Merge automatically
- Modify unrelated code
- Remove comments or formatting

### Safety Checks

1. **Pre-removal validation**:
   - Verify feature exists at specified lines
   - Check for dependencies
   - Run linter

2. **Post-removal validation**:
   - Run test suite
   - Verify game loads
   - Check no syntax errors
   - Ensure no broken imports

3. **Rollback capability**:
   - Keep backups for 30 days
   - Store in `backups/` directory
   - Include full context (date, user, reason)

## Testing Checklist

Before using in production:

- [ ] Test session creation
- [ ] Test task execution
- [ ] Test with small feature (15-30 lines)
- [ ] Verify PR appears in GitHub
- [ ] Check backup file is created
- [ ] Test recovery flow
- [ ] Test stop button mid-execution
- [ ] Verify error handling

## Cost Estimates

Based on Devin pricing (~$0.50-2.00 per session):

- **Small feature** (15-30 lines): ~$0.50
- **Medium feature** (50-100 lines): ~$1.00  
- **Large feature** (100+ lines): ~$2.00
- **Duration**: 30-90 seconds per removal

## Troubleshooting

### "Session creation failed"
- Check API key is correct
- Verify network connection
- Check Devin dashboard for status

### "Repository access denied"
- Ensure GitHub integration is active
- Verify repository name is correct
- Check repository permissions

### "Task timeout"
- Feature might be too complex
- Check Devin dashboard for errors
- Try smaller feature first

## Next Steps

1. ✅ API key configured
2. ⏳ Give Devin GitHub access
3. ⏳ Update repository URL in config
4. ⏳ Test connection
5. ⏳ Run first removal (start with "Bouncy Bounce")
6. ⏳ Design detailed automation workflow together

## Files to Review

- `Source/devin-api-config.js` - API integration
- `Source/cognition-dashboard-premium.html` - Dashboard UI
- `DEVIN_INTEGRATION_COMPLETE.md` - Technical details

Ready to proceed! Let's design the automation workflow next.
