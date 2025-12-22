# Mario Feature Flag Management Dashboard

A full-stack feature flag management system for Super Mario Brothers that enables dynamic game modifications without changing code. Built with React, Tailwind CSS, and Framer Motion, integrated with Devin's API for automated feature flag operations.

## Overview

This project combines the classic FullScreenMario game with a modern feature management dashboard that allows you to:
- **Remove** feature flags and game modes
- **Restore** previously removed features from backups
- **Replace** physics constants with new values using natural language instructions

The dashboard automates the entire workflow through Devin Sessions, handling code changes, testing, PR creation, and verification.

## Features

### Game Modes (15 total)
Toggle-able features that modify gameplay:
- Bouncy Bounce - Mario continuously bounces
- Dark is the Night - Visual darkness effect
- Hard Mode - Increased difficulty
- Super Fireballs - Enhanced fireball mechanics
- Trip of Acid - Psychedelic visual effects
- And 10 more...

### Physics Constants (4 total)
Modifiable physics parameters:
- **jumpmod** - Controls Mario's jump height
- **gravity** - Affects gravity strength
- And 2 more constants...

### Dashboard Capabilities
- **Apple Glass iOS-inspired UI** - Clean, modern interface with glassmorphism design
- **Real-time Progress Tracking** - Monitor Devin session progress directly in the dashboard
- **GitHub Integration** - Automatic PR detection and merge verification
- **Dock Mode** - Compact mode for multitasking
- **Automatic Backup System** - Creates backups before any removal for easy restoration

## Project Structure

```
dev-mario/
├── Source/                          # Main source directory
│   ├── dashboard.html               # Feature management dashboard (main interface)
│   ├── index.html                   # Super Mario game interface
│   ├── index.js                     # Game initialization
│   ├── index.css                    # Game styling
│   ├── FullScreenMario.js           # Core game engine
│   ├── devin-api-config.js          # Devin API integration config
│   ├── devin-api-config.template.js # Template for API configuration
│   ├── devin-api-permanent-flags.js # Permanent feature flag definitions
│   ├── settings/                    # Game configuration files
│   │   ├── features.js              # Feature flag definitions
│   │   ├── math.js                  # Physics constants
│   │   ├── mods.js                  # Game modifications
│   │   ├── audio.js                 # Audio settings
│   │   ├── collisions.js            # Collision detection
│   │   ├── input.js                 # Input handling
│   │   └── [other settings...]      # Additional game settings
│   ├── References/                  # Game engine libraries
│   │   ├── AudioPlayr-0.2.1.js      # Audio management
│   │   ├── MapsCreatr-0.2.1.js      # Map generation
│   │   ├── ModAttachr-0.2.2.js      # Mod attachment system
│   │   └── [other libraries...]     # Additional dependencies
│   ├── Theme/                       # Visual assets
│   ├── Sounds/                      # Audio files
│   └── Fonts/                       # Font files
├── docs/                            # Technical documentation
│   ├── README.md                    # Documentation index
│   ├── DASHBOARD_GAME_SYNC_FIX.md   # Cache prevention solutions
│   ├── DASHBOARD_IMPLEMENTATION_STEPS.md # Dashboard build guide
│   ├── DEVIN_SETUP_GUIDE.md         # Devin API setup
│   ├── INTEGRATION-SETUP.md         # Linting & code quality
│   └── [other docs...]              # Additional documentation
├── backups/                         # Feature flag backups
│   ├── bouncy-bounce-removed-*.json # Backup files for removed features
│   ├── qcount-backup-*.js           # Physics constant backups
│   └── [other backups...]           # Timestamped backup files
├── Distribution/                    # Compiled/minified game files
│   └── FullScreenMario-0.10.2/      # Production-ready game build
├── Tests/                           # Game test files
├── dev-server.js                    # Development server with API proxy
├── package.json                     # Node.js dependencies
├── .env.example                     # Environment variable template
└── .gitignore                       # Git ignore rules
```

### Key Files Explained

**Dashboard Files:**
- `Source/dashboard.html` - React-based dashboard with Tailwind CSS styling and Framer Motion animations. Contains the entire feature flag management UI.
- `Source/devin-api-config.js` - Feature flag definitions and Devin API integration logic. Defines all 19 feature flags with their metadata.
- `Source/devin-api-config.template.js` - Template for setting up Devin API configuration. Copy this to create your own config.
- `Source/devin-api-permanent-flags.js` - Definitions for permanent feature flags that should not be removed.

**Game Files:**
- `Source/index.html` - Main game interface. Loads all game modules and initializes FullScreenMario.
- `Source/FullScreenMario.js` - Core game engine compiled from TypeScript. Contains all game logic.
- `Source/settings/features.js` - Game mode feature flag implementations. This is where the 15 game modes are defined.
- `Source/settings/math.js` - Physics constant definitions. Contains jumpmod, gravity, and other physics parameters.
- `Source/settings/mods.js` - Game modification system. Manages how mods are loaded and applied.

**Server Files:**
- `dev-server.js` - Express server that proxies Devin API requests, serves static files, and provides git auto-pull functionality.

**Backup Files:**
- `backups/` - Contains JSON and JS files with backed-up code from removed features. Each backup is timestamped for tracking.

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm
- Git
- Devin API access (optional - runs in simulation mode without API key)

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd dev-mario
```

2. Install dependencies:
```bash
npm install
```

3. Configure Devin API (optional):
```bash
cp .env.example .env
# Edit .env and add your DEVIN_API_KEY
```

4. Start the development server:
```bash
npm start
```

5. Open your browser:
- Dashboard: http://localhost:8000/dashboard.html
- Game: http://localhost:8000/index.html

## Usage

### Removing a Feature Flag

1. Open the dashboard at `http://localhost:8000/dashboard.html`
2. Find the feature you want to remove
3. Click the **Remove** button
4. Review the automation plan in the modal
5. Click **Start Automation** to initiate a Devin session
6. Monitor progress in the dashboard
7. Once complete, view and merge the PR on GitHub
8. Click **Check Merge** to verify and update the dashboard

### Restoring a Feature Flag

1. Find the removed feature in the "Removed Game Modes" section
2. Click the **Restore** button
3. Start the automation (same process as removal)
4. Devin will load the backup file and restore the feature
5. Review and merge the PR
6. Feature returns to active state

### Replacing a Physics Constant

1. Find a physics constant (e.g., jumpmod)
2. Click **Replace**
3. Enter the new feature flag name (e.g., jumpmod_v2)
4. Add natural language instructions (e.g., "I want Mario to jump twice as high")
5. Start the automation
6. Devin will:
   - Calculate the new value based on your instructions
   - Create backups of the old constant
   - Replace all references in the codebase
   - Run tests and create a PR
7. Review, merge, and verify

## Technical Details

### Dashboard Architecture

The dashboard is a single-page application built with:
- **React 18** - Component-based UI
- **Tailwind CSS** - Utility-first styling with custom glassmorphism effects
- **Framer Motion** - Smooth animations and transitions
- **Lucide Icons** - Modern icon set
- **Babel Standalone** - Client-side JSX compilation

### API Integration

The `dev-server.js` provides:
- **Devin API Proxy** (`/api/devin/*`) - Forwards requests to Devin's API with server-side authentication
- **Status Endpoint** (`/api/devin/_status`) - Checks API configuration
- **Git Auto-Pull** (`/git-pull`) - Automatically pulls changes after PR merges
- **Static File Serving** - Serves game and dashboard files
- **Cache Busting** - Prevents browser caching of JavaScript/HTML files

### Feature Flag System

Feature flags are defined in `Source/devin-api-config.js` with:
- **ID** - Unique identifier
- **Name** - Display name
- **Category** - "gameMode" or "physicsConstant"
- **Status** - Current state (active, removed, pending)
- **Files** - List of files containing the feature flag code
- **Description** - What the feature does

### Backup System

When a feature is removed:
1. Backup file is created in `backups/` directory
2. Filename includes feature name and timestamp
3. Backup contains original code for restoration
4. Backup metadata is stored in JSON format

### Devin Automation

Devin sessions follow this workflow:
1. **Locate** - Find all files containing the feature flag
2. **Backup** - Create restoration backup
3. **Modify** - Remove/restore/replace feature flag code
4. **Test** - Run linting and integration tests
5. **Commit** - Create git commit with changes
6. **PR** - Open pull request on GitHub
7. **Verify** - Test the changes in localhost

## Documentation

Comprehensive technical documentation is available in the [docs/](docs/) directory, including:

- **[Dashboard Implementation](docs/DASHBOARD_IMPLEMENTATION_STEPS.md)** - Complete build guide
- **[Cache Prevention Solutions](docs/DASHBOARD_GAME_SYNC_FIX.md)** - Critical: How we solved browser caching issues
- **[Devin Setup Guide](docs/DEVIN_SETUP_GUIDE.md)** - Get started with Devin API integration
- **[Feature Flag Replacement](docs/FEATURE_FLAG_REPLACEMENT_GUIDE.md)** - Natural language instruction system
- **[Architecture Diagram](docs/ARCHITECTURE_DIAGRAM.md)** - System overview and component relationships
- **[Integration Setup](docs/INTEGRATION-SETUP.md)** - Linting, testing, and code quality setup
- **[Workflow Explained](docs/WORKFLOW_EXPLAINED.md)** - End-to-end process documentation

See [docs/README.md](docs/README.md) for a complete index of all documentation.

## Development

### Project Origins

Built on top of [FullScreenMario](https://github.com/FullScreenShenanigans/FullScreenMario) by Josh Goldberg - an HTML5 remake of the original Super Mario Brothers.

### Scripts

```bash
npm start       # Start development server (default)
npm run dev     # Same as npm start
```

### Environment Variables

Create a `.env` file (see `.env.example`):
```
DEVIN_API_KEY=your_devin_api_key_here
```

Without an API key, the dashboard runs in simulation mode.

## Cache Management

The project implements aggressive cache prevention to ensure dashboard updates are immediately visible. This was one of the most critical technical challenges solved during development.

**Key Solutions Implemented:**

1. **Meta tags** in HTML files prevent browser caching
   ```html
   <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
   <meta http-equiv="Pragma" content="no-cache">
   <meta http-equiv="Expires" content="0">
   ```

2. **Server-side headers** disable caching for JS/HTML files
   ```javascript
   res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
   res.set('Pragma', 'no-cache');
   res.set('Expires', '0');
   ```

3. **Git auto-pull** endpoint (`/git-pull`) syncs changes after PR merges

4. **GitHub API polling** verifies PR status directly, bypassing all caches

5. **Client-side cache busting** with query string versioning on critical files

For complete details on the caching solution, see [docs/DASHBOARD_GAME_SYNC_FIX.md](docs/DASHBOARD_GAME_SYNC_FIX.md)

## Troubleshooting

### Dashboard Not Updating After Merge
- Click the **GitHub Sync** button to force a refresh
- Hard refresh your browser (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
- Check that the PR was actually merged on GitHub

### Devin API Not Working
- Verify your `.env` file contains a valid `DEVIN_API_KEY`
- Check the console for API errors
- Restart the dev server after updating `.env`

### Game Not Loading
- Check browser console for JavaScript errors
- Verify all files in `Source/References/` are present
- Try accessing `http://localhost:8000/index.html` directly

## License

MIT - See LICENSE file for details

Original FullScreenMario game by Josh Goldberg

## Credits

**Original Game**: [FullScreenMario](https://github.com/FullScreenShenanigans/FullScreenMario) by Josh Goldberg

**Dashboard & Feature Flag System**: Built for Cognition's Devin integration demo

**Technologies**:
- React, Tailwind CSS, Framer Motion
- Devin API
- GitHub API
- Express.js
