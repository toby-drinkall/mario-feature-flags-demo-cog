# Complete Workflow: Feature Flag Removal/Enable

## Your Questions Answered

### Q1: "Is there a way to see the pull request in the dashboard?"
**YES!** I just added this. The dashboard now shows:
- ✅ Clickable PR link (opens GitHub in new tab)
- ✅ "View PR" button to see code changes
- ✅ Warning that PR is not merged yet
- ✅ Instructions to merge on GitHub

### Q2: "When I relaunch the game, the feature is enabled/removed?"
**It depends on whether you merged the PR:**

| Scenario | Dashboard Shows | Game Behavior (After Relaunch) |
|----------|----------------|--------------------------------|
| After clicking "Remove" (PR created but NOT merged) | "Removed Features" tab with ⚠ warning | **Feature still exists in game** (because code hasn't changed on master) |
| After merging removal PR on GitHub | "Removed Features" tab | **Feature is gone from game** (code actually removed from master) |
| After clicking "Enable" (PR created but NOT merged) | "Enabled Features" tab with ⚠ warning | **Feature NOT enabled yet** (code hasn't changed on master) |
| After merging enable PR on GitHub | "Enabled Features" tab | **Feature is permanently enabled** (code changed on master) |

## Complete Workflow (Step-by-Step)

### Scenario 1: Removing "Bouncy Bounce"

#### Step 1: Click "Remove" in Dashboard
```
Dashboard → Feature Testing tab → "Bouncy Bounce" → Click "Remove"
```

**What happens:**
- Devin modal appears
- You click "Start Automation"
- Devin works for ~15 seconds
- Dashboard shows: "Feature Removed!" with PR #123

#### Step 2: Dashboard State After Devin Completes
```
Dashboard → Removed Features tab
```

You see:
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

**Current state:**
- ✅ Devin created PR #123
- ✅ PR has code changes ready
- ❌ PR NOT merged yet
- ❌ Feature still in master branch
- ❌ Game still has the feature

#### Step 3: Click "View PR" Button
Opens GitHub in new tab:
```
https://github.com/toby-drinkall/mario-feature-flags-demo-cog/pull/123
```

You see:
```
Remove Bouncy Bounce permanently

Files changed: 1
Source/settings/mods.js    -31 lines

[Red diff showing deleted lines]
```

**You review:**
- ✅ Correct feature removed?
- ✅ Only expected lines deleted?
- ✅ Tests passing?

#### Step 4: Merge PR on GitHub
Click green "Merge pull request" button on GitHub.

**What happens automatically:**
1. PR merges to master
2. GitHub Action triggers (`.github/workflows/deploy.yml`)
3. Code deploys to `gh-pages` branch
4. Live site updates in 1-2 minutes

#### Step 5: Relaunch Game
```
Dashboard → Click "Launch Game"
```

**Game behavior:**
- ✅ "Bouncy Bounce" is GONE from game
- ✅ Not in Modes menu
- ✅ Code actually removed from `Source/settings/mods.js`

**Dashboard still shows:**
- "Removed Features" tab still has "Bouncy Bounce"
- But now you can optionally clean up with "Restore" if you change your mind

---

### Scenario 2: Enabling "High Speed"

#### Step 1: Click "Enable" in Dashboard
```
Dashboard → Feature Testing tab → "High Speed" → Click "Enable"
```

**What happens:**
- Devin modal appears
- Devin integrates feature into core game
- Creates PR #124
- Dashboard shows: "Feature Enabled!" with PR #124

#### Step 2: Dashboard State
```
Dashboard → Enabled Features tab
```

You see:
```
┌─────────────────────────────────────────────────────────┐
│ High Speed                                              │
│ Enabled 1 min ago                                       │
│                                                         │
│ 🔗 PR #124  •  33 lines  •  ⚠ Not merged yet          │
│                                                         │
│ Merge this PR on GitHub to permanently enable this     │
│ feature in the game.                                    │
│                                                         │
│         [View PR]    [Return to Staging]               │
└─────────────────────────────────────────────────────────┘
```

**Current state:**
- ✅ Devin created PR #124
- ❌ PR NOT merged
- ❌ Feature NOT enabled in game yet
- ❌ Feature still toggleable

#### Step 3: Click "View PR" → Review → Merge

Same as removal workflow.

#### Step 4: After Merging PR

**Game behavior after relaunch:**
- ✅ "High Speed" is ALWAYS ON
- ✅ Cannot be toggled off
- ✅ Integrated into core game code

---

## Key Insights

### Dashboard vs. Actual Code State

| Dashboard Tab | Meaning |
|--------------|---------|
| **Feature Testing** | Feature exists in code and is toggleable |
| **Enabled Features** | Devin created a PR to permanently enable (not merged yet) |
| **Removed Features** | Devin created a PR to remove (not merged yet) |

### The Critical Understanding:

**Dashboard shows INTENT, not REALITY.**

Until you merge the PR:
- The code on master hasn't changed
- The game hasn't changed
- The dashboard is showing "what Devin prepared"

After you merge the PR:
- The code on master updates
- GitHub Action deploys
- The game reflects the change
- The dashboard intent becomes reality

---

## Visual Timeline

```
Time: T0
┌──────────────────────────┐
│ Feature Testing Tab      │
│ • Bouncy Bounce         │  ← Feature is toggleable
│   [Toggle] [Enable]      │
│            [Remove]      │
└──────────────────────────┘

↓ Click "Remove"

Time: T0 + 15 seconds (Devin completes)
┌──────────────────────────┐
│ Removed Features Tab     │
│ • Bouncy Bounce         │  ← Dashboard THINKS it's removed
│   PR #123               │
│   ⚠ Not merged yet      │  ← But it's NOT really removed yet!
│   [View PR] [Restore]   │
└──────────────────────────┘

Game: Still has Bouncy Bounce ← Important!
Master branch: Still has Bouncy Bounce code

↓ Go to GitHub, merge PR #123

Time: T0 + 2 minutes (after merge + deploy)
┌──────────────────────────┐
│ Removed Features Tab     │
│ • Bouncy Bounce         │  ← Still shows here
│   PR #123 (merged)      │
│   [Restore]             │
└──────────────────────────┘

Game: Bouncy Bounce is GONE ← Now it's really gone!
Master branch: Code deleted
gh-pages: Deployed
```

---

## Important Notes

### 1. **Dashboard localStorage vs. GitHub Code**

The dashboard tracks state in:
```javascript
localStorage.setItem('removed_features', JSON.stringify([...]))
localStorage.setItem('enabled_features', JSON.stringify([...]))
```

But this is **separate** from the actual code in `Source/settings/mods.js`.

**Example:**
- Dashboard localStorage: `["Bouncy Bounce"]` in removed_features
- GitHub master: `Source/settings/mods.js` still has Bouncy Bounce code (31 lines)
- Only after PR merge: `Source/settings/mods.js` code is actually deleted

### 2. **Why This Separation Exists**

This is intentional and good:
1. ✅ You can see what Devin did
2. ✅ You can review before it affects the game
3. ✅ You can restore if you change your mind before merging
4. ✅ Multiple people can review the PR
5. ✅ You maintain control

### 3. **How to Check if PR is Merged**

Currently the dashboard doesn't auto-detect merge status. To check:
- Click "View PR" button
- Look at GitHub PR page
- If merged: Shows "Merged" badge (purple)
- If not merged: Shows "Open" badge (green)

### 4. **Future Enhancement** (Optional)

We could add GitHub API integration to:
- Auto-detect when PR is merged
- Change warning from "⚠ Not merged yet" to "✓ Merged"
- Update feature state automatically
- Show "Deployed" status

Would you like me to add this?

---

## Summary

**To answer your original questions:**

✅ **"Can I see the PR in the dashboard?"**
- Yes! Click "View PR" button
- Opens GitHub in new tab
- See full code diff

✅ **"When I relaunch the game, is the feature removed/enabled?"**
- **Before merging PR:** No, feature still in game (code unchanged)
- **After merging PR:** Yes, feature removed/enabled (code changed)
- **After GitHub Action deploys:** Game reflects the change

✅ **"Is removed/enabled updated showing the changes?"**
- Dashboard shows intent immediately (when Devin completes)
- Actual game changes only after PR merge + deploy
- Dashboard doesn't auto-update merge status (could be added)

---

## Dependencies for Devin

**Add to Devin setup:**

```bash
npm install
```

That's all Devin needs!

---

## Next Steps

1. **Test the workflow:**
   - Open dashboard
   - Click "Remove" on a test feature
   - See PR link appear
   - Click "View PR"
   - Review the diff
   - Merge on GitHub
   - Wait 2 minutes
   - Relaunch game
   - Verify feature is gone

2. **Optional: Add GitHub API integration**
   - Auto-detect PR merge status
   - Update dashboard automatically
   - Show deployment status

Would you like me to implement the GitHub API integration?
