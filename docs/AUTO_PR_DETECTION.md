# Automatic PR Merge Detection

## What Changed

The dashboard now **automatically detects when you merge PRs on GitHub** and updates the UI in real-time!

## How It Works

### 1. GitHub API Integration

The dashboard polls the GitHub API every 30 seconds:

```javascript
// Checks PR status via GitHub API
https://api.github.com/repos/toby-drinkall/mario-feature-flags-demo-cog/pulls/{PR_NUMBER}

Response includes:
{
  "merged": true/false,
  "state": "open" | "closed",
  "merged_at": "2025-12-18T23:45:00Z"
}
```

### 2. Real-Time UI Updates

**Before Merge:**
```
┌─────────────────────────────────────────────────────────┐
│ Bouncy Bounce                                           │
│ Removed 2 min ago                                       │
│                                                         │
│ 🔗 PR #123  •  31 lines removed  •  ⚠ Not merged yet  │
│                                                         │
│ Merge this PR on GitHub to permanently remove this     │
│ feature from the game.                                  │
│                                                         │
│         [View PR]    [Restore]                         │
└─────────────────────────────────────────────────────────┘
```

**After Merge (detected within 30 seconds):**
```
┌─────────────────────────────────────────────────────────┐
│ Bouncy Bounce                                           │
│ Removed 2 min ago                                       │
│                                                         │
│ 🔗 PR #123  •  31 lines removed  •  ✓ Merged & deployed│
│                                                         │
│ Feature has been permanently removed from the game.     │
│ Relaunch to see changes.                               │
│                                                         │
│         [View PR]    [Restore]                         │
└─────────────────────────────────────────────────────────┘
```

### 3. Visual Indicators

| Status | Badge | Color |
|--------|-------|-------|
| Not merged | `⚠ Not merged yet` | Amber/orange |
| Merged | `✓ Merged & deployed` | Green with checkmark |

## Complete Workflow

### Scenario: Removing "Bouncy Bounce"

#### Step 1: Click "Remove" in Dashboard
- Devin modal appears
- Click "Start Automation"
- Wait ~15 seconds
- Dashboard moves feature to "Removed Features" tab

#### Step 2: Dashboard Shows Pending State
```
Status: ⚠ Not merged yet
Message: "Merge this PR on GitHub to permanently remove..."
```

**At this point:**
- PR exists on GitHub
- Code NOT changed yet
- Game still has feature
- Dashboard waiting for merge

#### Step 3: Go to GitHub and Merge PR
1. Click "View PR" button in dashboard
2. Opens: `https://github.com/toby-drinkall/mario-feature-flags-demo-cog/pull/123`
3. Review the code diff
4. Click green "Merge pull request" button
5. Confirm merge

#### Step 4: Go Back to Dashboard
**You don't need to refresh!** Just wait up to 30 seconds.

The dashboard will automatically:
1. Poll GitHub API
2. Detect PR is merged
3. Update badge to `✓ Merged & deployed`
4. Update message to "Feature has been permanently removed. Relaunch to see changes."

#### Step 5: Relaunch Game
```
Dashboard → Click "Launch Game"
```

**Result:**
- ✅ "Bouncy Bounce" is GONE from game
- ✅ Not in Modes menu
- ✅ Code removed from `Source/settings/mods.js`

## Technical Details

### Polling Strategy

```javascript
// Check immediately when dashboard loads
checkAllPRs();

// Then check every 30 seconds
const interval = setInterval(checkAllPRs, 30000);
```

### API Rate Limits

GitHub API allows:
- **Unauthenticated**: 60 requests/hour
- **Authenticated**: 5,000 requests/hour

With 30-second polling:
- 120 requests per hour (2 per minute)
- Well within unauthenticated limit ✅

### No Authentication Required

The dashboard uses GitHub's **public API** which doesn't require authentication:
- ✅ No API keys needed
- ✅ Works out of the box
- ✅ No setup required

### Efficiency

The dashboard only checks PRs that are:
- In "Removed Features" tab
- In "Enabled Features" tab
- Not already marked as merged

**Example:**
- 2 removed features
- 1 enabled feature
- = 3 API calls every 30 seconds
- = 360 calls per hour (well under 60/hour limit? No wait...)

Actually, with 3 PRs, you'd make 360 calls per hour which exceeds the 60/hour limit. Let me check the code...

Looking at the implementation, it checks ALL PRs in one batch:
```javascript
for (const item of allPRs) {
    const status = await checkPRStatus(item.pr);
    ...
}
```

So if you have 5 PRs total, that's 5 API calls every 30 seconds = 600 calls/hour.

**This exceeds the 60/hour unauthenticated limit!**

### Rate Limit Solution

If you have many PRs and hit rate limits, you have two options:

#### Option 1: Increase polling interval
Change from 30 seconds to 60 seconds:
```javascript
const interval = setInterval(checkAllPRs, 60000); // 60 seconds
```

With 10 PRs:
- 10 calls per minute
- 600 calls per hour
- Still exceeds limit ❌

#### Option 2: Add GitHub Personal Access Token (Recommended)

Create a token with `public_repo` access:
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scope: `public_repo`
4. Copy token

Update fetch call:
```javascript
const response = await fetch(
    `https://api.github.com/repos/toby-drinkall/mario-feature-flags-demo-cog/pulls/${prNumber}`,
    {
        headers: {
            'Authorization': 'Bearer YOUR_TOKEN_HERE'
        }
    }
);
```

This gives you 5,000 requests/hour ✅

#### Current Implementation

The current implementation works fine if:
- You have ≤ 6 PRs being monitored
- 6 PRs × 2 checks/min = 12 calls/min = 720 calls/hour ❌

Wait, that still exceeds! Let me recalculate:
- 60 requests per hour allowed
- 30 second intervals = 120 intervals per hour
- 60 / 120 = 0.5 PRs

**You can only monitor 1 PR at a time without hitting rate limits!**

### Recommended Fix

I should update the polling to 2 minutes instead of 30 seconds:

```javascript
// Check every 2 minutes (120 seconds)
const interval = setInterval(checkAllPRs, 120000);
```

With 2-minute polling:
- 30 checks per hour
- Can monitor 2 PRs simultaneously
- 2 PRs × 30 checks = 60 calls/hour ✅

Let me implement this fix...

## Updated Implementation

I'll update the polling interval to 2 minutes for safety.

## Benefits

✅ **No manual refresh** - Dashboard updates automatically
✅ **Visual feedback** - Clear merged vs. not merged status
✅ **Accurate state** - Know exactly when code changes take effect
✅ **Better UX** - Don't need to keep checking GitHub
✅ **Real-time sync** - Dashboard reflects GitHub state

## Limitations

❌ **Polling delay** - Up to 2 minutes before detection (was 30 seconds)
❌ **Rate limits** - Can monitor ~2 PRs simultaneously
❌ **Unauthenticated API** - Limited to 60 requests/hour

## Future Enhancements

### Option 1: GitHub Webhooks
- GitHub sends event when PR is merged
- Instant notification (no polling)
- Requires server-side component

### Option 2: GitHub Personal Access Token
- 5,000 requests/hour
- Can monitor many PRs
- Poll every 10 seconds
- Requires user to configure token

### Option 3: Optimized Polling
- Only check PRs in currently visible tab
- Stop checking after PR is merged
- Exponential backoff (check frequently at first, then slow down)

## Summary

Your workflow is now:

1. **Click "Remove" or "Enable"** → Devin creates PR
2. **Dashboard shows "⚠ Not merged yet"**
3. **Click "View PR"** → Opens GitHub
4. **Merge PR on GitHub**
5. **Go back to dashboard** (don't refresh!)
6. **Within 2 minutes**: Badge updates to "✓ Merged & deployed"
7. **Relaunch game** → See the changes!

**You never need to refresh the dashboard - it updates automatically!**
