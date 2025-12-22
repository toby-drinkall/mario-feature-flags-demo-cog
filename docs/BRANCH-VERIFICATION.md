# Branch Configuration Verification

## ✅ Current Status (Verified 2025-12-22)

### Your Local Branch
```bash
Current branch: cognition-dashboard-devin-integration
```

### Git Remotes
```bash
origin   → https://github.com/umaim/Mario.git (read-only)
personal → https://github.com/toby-drinkall/mario-feature-flags-demo-cog.git (your fork)
```

### Your Push Commands Should Be
```bash
# When pushing your manual changes:
git push personal cognition-dashboard-devin-integration
```

## ⚠️ The Branch Confusion Explained

You asked: "Some of my automations are working (removing game modes), but feature flag replacing is not working because it's pushing to the wrong branch."

### Why This Happened

**PR #44 (jumpmod → jumpmod_v2 replacement):**
- ❌ Merged to: `experiment/enhanced-jump-physics` (WRONG)
- ✅ Should merge to: `cognition-dashboard-devin-integration`

**Investigation:**
```bash
# What branch does the game actually use?
# Answer: cognition-dashboard-devin-integration

# Where did PR #44 merge?
curl "https://api.github.com/repos/toby-drinkall/mario-feature-flags-demo-cog/pulls/44"
# Result: base branch = "experiment/enhanced-jump-physics"

# So the code change exists... but on the wrong branch!
```

### Which Automations Work vs Broken

| Operation | Status | Why |
|-----------|--------|-----|
| Remove Game Mode | ✅ Works | Devin creates PR to cognition-dashboard-devin-integration |
| Recover Game Mode | ✅ Works | Devin creates PR to cognition-dashboard-devin-integration |
| Remove Feature Flag | ✅ Works | Uses same `removeFeatureFlag` function |
| Replace Feature Flag | ❌ BROKEN | Was creating PR to wrong branch |
| Recover Feature Flag | ✅ Works (after fix) | Now uses correct base branch |

### Root Cause

The `replaceFeatureFlag` function in `Source/devin-api-config.js` had this instruction:
```
"Create PR to base branch (use the main development branch)"
```

Devin interpreted "main development branch" as `experiment/enhanced-jump-physics` (because that branch existed and had recent activity).

### The Fix (Already Applied)

**Commit 24af71b** updated the prompt to be EXPLICIT:
```javascript
// OLD (ambiguous):
"Create PR to base branch (use the main development branch)"

// NEW (explicit, repeated 3x):
"CRITICAL: Base branch MUST be 'cognition-dashboard-devin-integration' NOT 'experiment/enhanced-jump-physics' or any other branch"
"BASE BRANCH: cognition-dashboard-devin-integration (MANDATORY - this is where all PRs must go)"
"Use GitHub CLI command explicitly: gh pr create --base cognition-dashboard-devin-integration --head [your-branch] --title 'Replace ${oldFlagName} with ${newFlagName}'"
```

## 🔍 How to Verify Devin PRs Go to Correct Branch

After Devin creates a PR, check these indicators:

### 1. In the Automation Modal
Look for this message:
```
Step 8 complete: Created PR #[number] to cognition-dashboard-devin-integration at [url]
```

The message should explicitly say "to cognition-dashboard-devin-integration".

### 2. On GitHub PR Page
Look at the top of the PR:
```
[username] wants to merge X commits into cognition-dashboard-devin-integration from [feature-branch]
```

The "into [branch]" should be `cognition-dashboard-devin-integration`.

### 3. Using GitHub API (Terminal Check)
```bash
# Check a specific PR
PR_NUMBER=44
curl -s "https://api.github.com/repos/toby-drinkall/mario-feature-flags-demo-cog/pulls/${PR_NUMBER}" | jq -r '.base.ref'

# Expected output: cognition-dashboard-devin-integration
# Wrong output: experiment/enhanced-jump-physics (or anything else)
```

### 4. In Dashboard Console
When Devin creates PR, you'll see logs like:
```
✓ Devin API result: { branch: "replace-jumpmod-with-jumpmod-v2", prNumber: 44, ... }
```

Check the PR on GitHub immediately to verify base branch.

## 🚨 If Devin Creates PR to Wrong Branch

### Immediate Actions

**Option 1: Close and Recreate (Recommended)**
```bash
# Close the wrong PR
gh pr close [PR_NUMBER] --comment "Wrong base branch, recreating"

# Create new PR to correct branch
gh pr create \
  --base cognition-dashboard-devin-integration \
  --head [feature-branch] \
  --title "[Original Title]" \
  --body "[Original Description]"
```

**Option 2: Change Base Branch on GitHub**
1. Go to PR page
2. Click "Edit" next to the title
3. Look for "base: experiment/enhanced-jump-physics"
4. Click to change base branch
5. Select "cognition-dashboard-devin-integration"
6. Confirm change

**Option 3: Manual Cherry-Pick (If Already Merged)**
```bash
# Switch to correct branch
git checkout cognition-dashboard-devin-integration
git pull personal cognition-dashboard-devin-integration

# Find the merge commit SHA from the wrong branch
MERGE_SHA="[commit-sha]"

# Cherry-pick the changes
git cherry-pick $MERGE_SHA

# Push to correct branch
git push personal cognition-dashboard-devin-integration
```

## ✅ Verification Checklist for New Automations

Before testing a Replace operation:

- [ ] Devin API configured (badge shows "Devin API Ready")
- [ ] Current branch is cognition-dashboard-devin-integration
- [ ] Latest commit 24af71b or later (has explicit base branch fix)
- [ ] Console shows no errors about API configuration
- [ ] GitHub personal access token has repo permissions

During automation:

- [ ] Automation modal shows session URL
- [ ] Each step completes with green checkmark
- [ ] Step 7 message says "Created PR #X to cognition-dashboard-devin-integration"
- [ ] Can click PR link to open GitHub

After PR created:

- [ ] GitHub PR page shows "into cognition-dashboard-devin-integration"
- [ ] PR has all expected file changes
- [ ] Tests passing (green checkmark on PR)
- [ ] Commit message follows format: "Replace [old] with [new] ([instruction])"

After merging:

- [ ] Click "Check Merge" button in dashboard
- [ ] Polls GitHub for 5 seconds
- [ ] Shows "Merge Complete!" when found
- [ ] Auto-pulls git changes (if proxy server running)
- [ ] Click "Sync" button to update dashboard state
- [ ] Feature moves to correct section

## 🔧 Emergency: All Future PRs Going to Wrong Branch

If this happens again:

### 1. Check Devin Prompt
```bash
# View the current prompt
grep -A 10 "Create PR" Source/devin-api-config.js
```

Should see:
```javascript
CRITICAL: Base branch MUST be "cognition-dashboard-devin-integration"
```

### 2. Update Prompt to Be Even More Explicit
```javascript
// Add to devin-api-config.js after line 482:
"STOP: Before creating PR, verify base branch is cognition-dashboard-devin-integration"
"If base branch is anything other than cognition-dashboard-devin-integration, ERROR and stop"
```

### 3. Test with Simulation Mode First
```javascript
// In devin-api-config.js, temporarily disable real API
window.DevinAPI.config.apiKey = 'DISABLED_FOR_TESTING';

// Click Replace button
// Modal will run in simulation mode
// Verify the flow works before re-enabling API
```

## 📊 Current State Summary

| Branch | Purpose | PR Target |
|--------|---------|-----------|
| `cognition-dashboard-devin-integration` | Main development (where you work) | All Devin PRs go here |
| `experiment/enhanced-jump-physics` | Old experiment branch | Should NOT receive PRs |
| `master` | Production (read-only) | No direct pushes |

**Your workflow:**
1. Work on `cognition-dashboard-devin-integration`
2. Devin creates PR branches from this branch
3. Devin creates PRs targeting this branch
4. You merge PRs to this branch
5. Eventually merge to `master` for production

## 🎯 Next Steps

1. ✅ Verify the explicit base branch fix is deployed (already done - commit 24af71b)
2. ✅ Test a Replace operation with a real feature flag
3. ✅ Immediately check PR on GitHub to verify correct base branch
4. ✅ If wrong, close and recreate PR
5. ✅ Document the result here

---

## 🐛 Known Issues & Workarounds

### Issue: Devin Can't Access Private Repos
**Symptom:** "Failed to fetch repo" or "Permission denied"
**Fix:** Ensure `DEVIN_API_KEY` in `.env` is valid and not expired

### Issue: PR Created But Not Visible in Dashboard
**Symptom:** Modal completes but pending section doesn't update
**Fix:** Click "Sync" button to force GitHub API poll

### Issue: Check Merge Says "Not Merged" But PR is Merged
**Symptom:** GitHub shows merged but dashboard doesn't detect it
**Fix:** Wait 5-10 seconds for GitHub API to update, then try again

### Issue: Game Doesn't Reflect Merged Changes
**Symptom:** PR merged but game behavior unchanged
**Fix:**
```bash
git pull personal cognition-dashboard-devin-integration
# Reload page (Cmd+Shift+R to clear cache)
# Click "Launch Game" to open fresh instance
```
