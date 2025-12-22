#!/usr/bin/env node

/**
 * Watch and Serve - Auto-reloading dev server
 *
 * Watches Source/ directory for changes and auto-restarts dev-server.js
 * This ensures instant deployment of code changes without manual server restart
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

let serverProcess = null;
const SERVER_SCRIPT = './dev-server.js';
const WATCH_DIR = './Source';

function startServer() {
    if (serverProcess) {
        console.log('🔄 Restarting server...');
        serverProcess.kill();
    }

    serverProcess = spawn('node', [SERVER_SCRIPT], {
        stdio: 'inherit',
        cwd: __dirname
    });

    serverProcess.on('error', (err) => {
        console.error('❌ Server error:', err);
    });

    serverProcess.on('exit', (code) => {
        if (code !== null && code !== 0) {
            console.log(`⚠️  Server exited with code ${code}`);
        }
    });

    console.log('✅ Server started');
}

function watchFiles() {
    console.log(`\n👀 Watching ${WATCH_DIR} for changes...\n`);

    let debounceTimer = null;

    fs.watch(WATCH_DIR, { recursive: true }, (eventType, filename) => {
        if (filename && (filename.endsWith('.html') || filename.endsWith('.js'))) {
            console.log(`📝 ${filename} changed`);

            // Debounce - wait 500ms for multiple changes
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                startServer();
            }, 500);
        }
    });
}

// Handle shutdown
process.on('SIGINT', () => {
    console.log('\n\n👋 Shutting down...');
    if (serverProcess) {
        serverProcess.kill();
    }
    process.exit(0);
});

// Start
console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║  🔥 Watch and Serve - Auto-reloading Dev Server          ║
║                                                            ║
║  • Watches: ${WATCH_DIR}                                  ║
║  • Auto-restarts on file changes                          ║
║  • Dashboard: http://localhost:8000/cognition-dashboard-premium.html
║                                                            ║
║  Press Ctrl+C to stop                                     ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
`);

startServer();
watchFiles();
