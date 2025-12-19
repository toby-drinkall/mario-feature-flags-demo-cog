# Quick Start Guide - Devin API Demo

## Try It Right Now (Simulation Mode)

No setup required! The demo works immediately in simulation mode:

1. Open `Source/cognition-dashboard-final.html` in your browser
2. Click **"Launch Game"** button
3. Wait for green "Connected to Game" badge
4. Click **"Remove"** on any feature (e.g., "Bouncy Bounce")
5. Click **"Start Devin Automation"**
6. Watch the 9-step automation process (~12 seconds)
7. See the success screen with mock PR details

**Note:** In simulation mode, no actual code changes occur. It's perfect for demos and UI testing.

---

## Enable Real API Mode

To make actual code changes via Devin API:

### Step 1: Configure Credentials
Edit `Source/devin-api-config.js`:

```javascript
config: {
    apiUrl: 'https://your-devin-api.com/v1',  // Your actual endpoint
    apiKey: 'devin_your_actual_api_key_here', // Your actual key
    timeout: 300000,
}
```

### Step 2: Test Configuration
Open `Source/test-devin-api.html` and run:
- ✓ Test 1: Configuration Check
- ✓ Test 2: Session Creation
- ✓ Test 3: Task Execution
- ✓ Test 4: Status Check
- ✓ Test 5: Full Workflow

### Step 3: Use Main Dashboard
Once tests pass, return to `cognition-dashboard-final.html`. You should now see:
- ✓ Green badge: "Real Devin API configured"
- ✓ Actual PRs will be created in your repository
- ✓ Real code changes will occur

---

## What's Included

### Main Files:
- **`Source/cognition-dashboard-final.html`** - Main dashboard interface
- **`Source/devin-api-config.js`** - API configuration (edit this)
- **`Source/test-devin-api.html`** - API testing tool
- **`Source/index.html`** - Mario game (unchanged)

### Documentation:
- **`DEVIN_INTEGRATION_COMPLETE.md`** - Complete integration summary
- **`Source/DEVIN_API_SETUP.md`** - Detailed setup instructions
- **`Source/INTEGRATION_FLOW.txt`** - Visual flow diagrams
- **`QUICK_START.md`** - This file

---

## Feature Overview

### Live Feature Toggles
- Toggle features ON/OFF in real-time
- Changes apply instantly to running game
- No code modification (runtime only)

### Feature Flag Removal
- Permanently removes feature code
- Creates git branch automatically
- Runs tests before committing
- Generates Pull Request
- Creates backup for recovery

### Feature Flag Recovery
- Restores removed features
- Uses backup from removal
- Creates new branch and PR
- Runs tests to verify

---

## Visual Indicators

### Simulation Mode
- 🟨 Yellow badge: "Running in simulation mode"
- Console: "⚠️ Devin API not configured"
- No actual code changes

### Real API Mode
- 🟩 Green badge: "Real Devin API configured"
- Console: "✓ Devin API is configured"
- Actual code changes occur

### Connection Status
- 🟩 "Connected to Game" - Dashboard can control game
- 🟨 "Waiting for Connection" - Click "Launch Game" button

---

## Common Questions

**Q: Can I use this without Devin API?**
A: Yes! It runs in simulation mode by default. Perfect for demos.

**Q: Will simulation mode change my code?**
A: No. Simulation mode only shows UI animations. No files are modified.

**Q: How do I know if real API is working?**
A: Check for green badge and use test-devin-api.html to verify.

**Q: Can I switch between modes?**
A: Yes! The system automatically detects configuration and switches.

**Q: What if the API call fails?**
A: Error messages appear in red box with details. Check console for logs.

---

## Demo Script

Perfect for showing to stakeholders:

1. **Show Live Control** (30 seconds)
   - Open dashboard
   - Launch game
   - Toggle 2-3 features ON/OFF
   - Show instant updates in game

2. **Show Feature Removal** (2 minutes)
   - Click "Remove" on "Bouncy Bounce"
   - Explain the confirmation screen
   - Start automation
   - Walk through each step as it progresses
   - Show success screen with PR details

3. **Show Recovery** (2 minutes)
   - Scroll to "Removed Features" section
   - Click "Recover" on removed feature
   - Show the 7-step recovery process
   - Verify feature is back in active list

4. **Explain Benefits** (1 minute)
   - Automated code removal (no manual editing)
   - Built-in testing (no broken code)
   - Git workflow (automatic branching, PRs)
   - Recoverable (safe to remove, easy to restore)
   - Audit trail (PR history shows all changes)

---

## Troubleshooting

### Problem: "Waiting for Connection" stays yellow
**Solution:** Click the "Launch Game" button at the top

### Problem: Toggle doesn't work
**Solution:** Make sure game is launched and connected (green badge)

### Problem: Still showing simulation mode after configuring API
**Solution:**
1. Check that BOTH `apiUrl` AND `apiKey` are changed
2. Refresh the page (Cmd+R / Ctrl+R)
3. Check browser console for errors

### Problem: Test page shows configuration issues
**Solution:**
1. Open `devin-api-config.js`
2. Verify no typos in URL/key
3. Check that there are no quotes issues
4. Save file and refresh test page

---

## Next Steps

1. ✅ **Test simulation** - Try it now (no setup needed)
2. ⚙️ **Configure API** - Add your Devin credentials
3. 🧪 **Run tests** - Verify with test-devin-api.html
4. 🚀 **Go live** - Use real API mode
5. 📊 **Refine** - Adjust timing/UI based on feedback

---

## Support

For questions or issues:
- Check `DEVIN_INTEGRATION_COMPLETE.md` for detailed info
- Review `Source/DEVIN_API_SETUP.md` for setup help
- Look at `Source/INTEGRATION_FLOW.txt` for visual diagrams
- Check browser console for debugging logs

**Ready to start?** Open `Source/cognition-dashboard-final.html` now!
