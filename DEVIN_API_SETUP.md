# Devin API Setup Guide

## Current Configuration

Your API is configured in `Source/devin-api-config.js`:
- **API URL**: `https://api.devin.ai/v1`
- **API Key**: Configured (starts with `apk_user_...`)

## Testing the API

1. **Open the test page**: http://localhost:8000/test-devin-api.html
2. **Check Configuration** (Test 1) - Should show ✓ if config is valid
3. **Create Session** (Test 2) - This will make an actual API call

## Common Issues & Solutions

### Issue 1: CORS Error

**Symptom**: Browser console shows:
```
Access to fetch at 'https://api.devin.ai/v1/sessions' from origin 'http://localhost:8000'
has been blocked by CORS policy
```

**Why it happens**: Browsers block cross-origin requests for security. The Devin API server must explicitly allow requests from your domain.

**Solution Options**:

#### Option A: Use Devin API with CORS support (Check with Devin team)
Check if Devin API supports:
- CORS headers for `localhost` domains
- An API endpoint that allows browser-based requests

#### Option B: **Backend Proxy (Recommended)**
Create a simple Node.js server that:
1. Accepts requests from your dashboard
2. Forwards them to Devin API
3. Returns the response

This avoids CORS because requests go server-to-server, not browser-to-server.

```
Browser → Node.js Server → Devin API
  (No CORS)      (No CORS)
```

#### Option C: Browser Extension (Temporary testing only)
Install a CORS extension like "CORS Unblock" - **NOT for production!**

### Issue 2: API Authentication Error

**Symptom**: Response with 401 Unauthorized or 403 Forbidden

**Solution**:
1. Verify your API key is correct
2. Check if the API key has necessary permissions
3. Contact Devin support for API access verification

### Issue 3: Network Error

**Symptom**: "Failed to fetch" or "Network request failed"

**Solution**:
1. Check internet connection
2. Verify API URL is correct
3. Try the API endpoint in a tool like Postman or curl

## Recommended Setup: Backend Proxy

Create `server.js`:

```javascript
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({ origin: 'http://localhost:8000' }));
app.use(express.json());

const DEVIN_API_URL = 'https://api.devin.ai/v1';
const API_KEY = process.env.DEVIN_API_KEY; // Store in env variable

// Proxy endpoint
app.post('/api/devin/*', async (req, res) => {
  const path = req.params[0];
  try {
    const response = await fetch(`${DEVIN_API_URL}/${path}`, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log('Proxy running on http://localhost:3000'));
```

Then update `devin-api-config.js`:
```javascript
apiUrl: 'http://localhost:3000/api/devin'
```

## Next Steps

1. **Check the test page** - See what error you get
2. **Look at browser console** - F12 → Console tab
3. **Share the error** - Tell me what error you see and I'll help fix it

## Testing with curl (Alternative)

Test the API directly from terminal:

```bash
curl -X POST https://api.devin.ai/v1/sessions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{"name": "Test Session", "repository": "https://github.com/test"}'
```

If this works but the browser doesn't, it's definitely a CORS issue.
