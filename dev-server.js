const express = require('express');
const path = require('path');

const app = express();
const PORT = 8000;
const DEVIN_API_URL = 'https://api.devin.ai/v1';

// Parse JSON bodies
app.use(express.json());

// Disable caching for JavaScript files to ensure fresh code is always loaded
app.use((req, res, next) => {
    if (req.path.endsWith('.js')) {
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');
    }
    next();
});

// Serve static files from Source directory
app.use(express.static(path.join(__dirname, 'Source')));

// Proxy endpoint for Devin API
// Frontend calls /api/devin/* and we forward to https://api.devin.ai/v1/*
app.all('/api/devin/*', async (req, res) => {
    const apiPath = req.params[0]; // Everything after /api/devin/
    const targetUrl = `${DEVIN_API_URL}/${apiPath}`;
    
    // Get the API key from the request header
    const apiKey = req.headers['x-devin-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
    
    if (!apiKey) {
        return res.status(401).json({ error: 'API key required. Send via X-Devin-Api-Key header.' });
    }

    try {
        const fetchOptions = {
            method: req.method,
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
        };

        // Include body for POST/PUT/PATCH requests
        if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
            fetchOptions.body = JSON.stringify(req.body);
        }

        console.log(`[Proxy] ${req.method} ${targetUrl}`);
        
        const response = await fetch(targetUrl, fetchOptions);
        const data = await response.json().catch(() => ({}));
        
        // Forward the status code and response
        res.status(response.status).json(data);
    } catch (error) {
        console.error('[Proxy Error]', error.message);
        res.status(500).json({ error: 'Proxy error', message: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`\n  Mario Feature Flag Dashboard`);
    console.log(`  ============================`);
    console.log(`  Server running at http://localhost:${PORT}`);
    console.log(`  Dashboard: http://localhost:${PORT}/cognition-dashboard-premium.html`);
    console.log(`  Game: http://localhost:${PORT}/index.html`);
    console.log(`\n  Devin API proxy available at /api/devin/*`);
    console.log(`  Press Ctrl+C to stop\n`);
});
