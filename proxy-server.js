#!/usr/bin/env node

/**
 * Devin API Proxy Server
 *
 * This proxy server solves CORS issues by forwarding requests from the browser
 * to the Devin API. The browser calls localhost:3000, which then calls api.devin.ai.
 *
 * Usage:
 *   node proxy-server.js
 */

const http = require('http');
const https = require('https');
const url = require('url');

// Configuration
const PORT = 3000;
const DEVIN_API_BASE = 'api.devin.ai';
const API_KEY = 'apk_user_ZW1haWx8NjkzNGIxYzVjYTkwY2JhNWQ3MWNkZDNlX29yZy02ODI3NzczYmQ3MTk0YzI0YTQyN2NkNGRiM2M4YmY2ZDozOGU3ZDU5NGYzNTI0MmU0OTYzNDNlOGIyNDJkY2QxZg==';

// CORS headers
const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400'
};

// Create server
const server = http.createServer((req, res) => {
    console.log(`\n[${new Date().toISOString()}] ${req.method} ${req.url}`);

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        res.writeHead(204, CORS_HEADERS);
        res.end();
        return;
    }

    // Parse URL
    const parsedUrl = url.parse(req.url);
    const path = parsedUrl.path.replace('/api/devin', '');

    // Collect request body
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', () => {
        // Log request
        if (body) {
            console.log('Request body:', body);
        }

        // Prepare options for Devin API request
        const options = {
            hostname: DEVIN_API_BASE,
            port: 443,
            path: `/v1${path}`,
            method: req.method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            }
        };

        // Only add Content-Length for requests with body
        if (body) {
            options.headers['Content-Length'] = Buffer.byteLength(body);
        }

        // Make request to Devin API
        const proxyReq = https.request(options, (proxyRes) => {
            console.log(`Devin API responded: ${proxyRes.statusCode}`);

            // Collect response
            let responseBody = '';
            proxyRes.on('data', chunk => {
                responseBody += chunk;
            });

            proxyRes.on('end', () => {
                // Log full response for debugging (not truncated)
                try {
                    const parsed = JSON.parse(responseBody);
                    console.log('Response (full):', JSON.stringify(parsed, null, 2));
                } catch (e) {
                    console.log('Response:', responseBody.substring(0, 500));
                }

                // Send response back with CORS headers
                const headers = {
                    ...CORS_HEADERS,
                    'Content-Type': 'application/json'
                };

                res.writeHead(proxyRes.statusCode, headers);
                res.end(responseBody);
            });
        });

        proxyReq.on('error', (error) => {
            console.error('Proxy request error:', error);
            res.writeHead(500, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message }));
        });

        // Send request body
        if (body) {
            proxyReq.write(body);
        }
        proxyReq.end();
    });
});

// Start server
server.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║  🚀 Devin API Proxy Server Running                        ║
║                                                            ║
║  Port:        http://localhost:${PORT}                        ║
║  Status:      ✓ Ready to forward requests                 ║
║  Target:      https://${DEVIN_API_BASE}                   ║
║                                                            ║
║  Dashboard:   http://localhost:8000/cognition-dashboard-premium.html
║                                                            ║
║  Press Ctrl+C to stop                                     ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
    `);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n👋 Shutting down proxy server...');
    server.close(() => {
        console.log('✓ Server closed');
        process.exit(0);
    });
});
