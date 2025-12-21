# 🚀 Start Dashboard with Devin Integration

## Quick Start

You need **2 terminals running simultaneously**:

### Terminal 1: File Server (Port 8000)
```bash
cd /Users/tobydrinkall/dev-mario
python3 -m http.server 8000
```
This serves your dashboard HTML files.

### Terminal 2: Proxy Server (Port 3000)
```bash
cd /Users/tobydrinkall/dev-mario
node proxy-server.js
```
This forwards API requests to Devin and solves CORS.

## ✅ Current Status

- ✅ **Proxy Server**: Running on http://localhost:3000
- ✅ **File Server**: Running on http://localhost:8000
- ✅ **API Config**: Updated to use proxy
- ✅ **CORS**: Solved with proxy

## 🎮 Test the Dashboard

1. **Open Dashboard**: http://localhost:8000/cognition-dashboard-premium.html

2. **Launch Game**: Click the "Launch Game" button

3. **Test Devin Integration**:
   - Pick any feature (e.g., "Bouncy Bounce")
   - Click the **"Remove"** button
   - Watch the automation modal
   - It should show "Real Devin API configured" (green badge)
   - Click "Start Automation"

4. **What Should Happen**:
   - Modal shows progress with spinning loader
   - Steps animate one by one
   - A **real Devin session** is created!
   - You get a session URL like: `https://app.devin.ai/sessions/...`
   - Success screen shows PR number

5. **Check Devin Session**:
   - Open browser console (F12)
   - Look for: `✓ Devin session created: devin-...`
   - Click the session URL to see Devin working

## 🐛 Troubleshooting

### "Devin API not configured" (yellow badge)
- Make sure proxy server is running in Terminal 2
- Check that it says "Ready to forward requests"

### "Failed to fetch" error
- Verify proxy is on port 3000: `lsof -i :3000`
- Restart proxy: Stop with Ctrl+C, then `node proxy-server.js`

### Dashboard not loading
- Check file server is on port 8000: `lsof -i :8000`
- Restart: Stop with Ctrl+C, then `python3 -m http.server 8000`

## 📊 What's Happening Behind the Scenes

```
Browser (localhost:8000)
    ↓ (calls)
Proxy Server (localhost:3000)
    ↓ (forwards to)
Devin API (api.devin.ai)
    ↓ (creates)
Devin Session (app.devin.ai/sessions/...)
```

## 🎯 Expected Output in Terminal 2 (Proxy)

When you click "Remove", you should see:
```
[2025-12-19T...] POST /api/devin/sessions
Request body: {"prompt":"Remove Bouncy Bounce feature flag..."}
Devin API responded: 200
Response: {"session_id":"devin-...","url":"https://app.devin.ai/sessions/..."}
```

## 🔗 Session URL

After creating a session, you'll get a URL like:
`https://app.devin.ai/sessions/dd881e913df74f3a8f348b08dcde0e62`

**Visit this URL** to see Devin working on your task in real-time!

## 🛑 Stop Services

When done testing:
- Terminal 1: Press **Ctrl+C** to stop file server
- Terminal 2: Press **Ctrl+C** to stop proxy server

## 📝 Next Steps

Once you verify it works:
1. Try removing different features
2. Test the "Recover" functionality
3. Check the Devin session URLs to see progress
4. Share the dashboard with your team!
