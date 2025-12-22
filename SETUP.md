# Quick Setup Guide

Get the Mario Feature Flag Dashboard running in 5 minutes.

## Prerequisites

- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- **Devin API Key** (optional) - Get from [devin.ai](https://devin.ai)

## Setup Steps

### 1. Clone the Repository

```bash
git clone https://github.com/toby-drinkall/mario-feature-flags-demo-cog.git
cd mario-feature-flags-demo-cog
git checkout cognition-dashboard-devin-integration
```

### 2. Install Dependencies

```bash
npm install
```

This will install Express and other required packages.

### 3. Configure Devin API (Optional)

The dashboard works in **simulation mode** without an API key. For full Devin integration:

```bash
cp .env.example .env
```

Edit `.env` and add your Devin API key:
```
DEVIN_API_KEY=your_actual_api_key_here
```

**Note:** The `.env` file is gitignored and will never be committed to version control.

### 4. Start the Server

```bash
npm start
```

You should see:
```
Mario Feature Flag Dashboard
============================
Server running at http://localhost:8000
Dashboard: http://localhost:8000/dashboard.html
Game: http://localhost:8000/index.html
```

### 5. Open in Browser

**Dashboard:** [http://localhost:8000/dashboard.html](http://localhost:8000/dashboard.html)

**Game:** [http://localhost:8000/index.html](http://localhost:8000/index.html)

## What You'll See

### Dashboard Features
- 15 game mode feature flags (e.g., Bouncy Bounce, Dark Mode, Hard Mode)
- 4 physics constant flags (e.g., jumpmod, gravity)
- Remove, restore, and replace functionality
- Real-time Devin session progress tracking (with API key)
- GitHub PR integration and merge verification

### Without Devin API Key (Simulation Mode)
- Full UI functionality
- Simulated automation responses
- No actual Devin sessions or PRs created
- Perfect for exploring the interface

### With Devin API Key (Full Mode)
- Real Devin session creation
- Automatic code modifications
- PR creation and tracking
- Complete end-to-end automation

## Troubleshooting

### Port 8000 Already in Use
```bash
# Find and kill the process using port 8000
lsof -ti:8000 | xargs kill -9
# Or change the port in dev-server.js (line 9)
```

### Dependencies Not Installing
```bash
# Clear npm cache and try again
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Dashboard Not Loading
- Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
- Check browser console for errors
- Verify server is running on port 8000

### Game Not Loading
- Make sure you're accessing via `http://localhost:8000/index.html`
- Check that all files in `Source/References/` exist
- Look for JavaScript errors in browser console

## Architecture Overview

```
Browser (http://localhost:8000)
    ↓
dev-server.js (Express)
    ├── Serves: Source/dashboard.html, Source/index.html
    ├── Proxies: /api/devin/* → https://api.devin.ai/v1/*
    └── Git Pull: /git-pull endpoint for post-merge sync
```

## Next Steps

- Explore the dashboard UI and feature flags
- Try removing a feature flag (creates Devin session if API configured)
- Check out the [documentation](docs/) for implementation details
- Read about the [cache prevention solution](docs/DASHBOARD_GAME_SYNC_FIX.md)

## Documentation

Full documentation is available in the `docs/` directory:
- [Architecture Diagram](docs/ARCHITECTURE_DIAGRAM.md)
- [Devin Setup Guide](docs/DEVIN_SETUP_GUIDE.md)
- [Feature Flag Replacement](docs/FEATURE_FLAG_REPLACEMENT_GUIDE.md)
- [Complete Documentation Index](docs/README.md)

## Support

For issues or questions:
1. Check the [main README](README.md)
2. Review the [troubleshooting section](#troubleshooting)
3. Check the [documentation](docs/)

## Security Note

This runs entirely on your local machine (localhost:8000). No one else can access your instance unless they're physically on your computer. Your Devin API key is stored in `.env` and never committed to git.
