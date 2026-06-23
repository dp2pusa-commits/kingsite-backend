const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

const APP_ID = '33AHd8gjUgryjgdaOal68';
const TOKEN_URL = 'https://oauth.deriv.com/oauth2/token';

// Health check — visiting the backend URL directly should show this
app.get('/', (req, res) => {
  res.send('King Site Backend Running ✅');
});

// Exchanges the authorization code (+ PKCE verifier) for an access token
app.post('/exchange', async (req, res) => {
  const { code, code_verifier, redirect_uri } = req.body;

  if (!code || !code_verifier || !redirect_uri) {
    return res.status(400).json({
      error: 'Missing required field(s): code, code_verifier, redirect_uri'
    });
  }

  try {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      client_id: APP_ID,
      redirect_uri: redirect_uri,
      code_verifier: code_verifier
    });

    const derivResponse = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });

    const data = await derivResponse.json();

    if (!derivResponse.ok || data.error) {
      console.error('Deriv token exchange failed:', data);
      return res.status(400).json({
        error: data.error_description || data.error || 'Token exchange failed'
      });
    }

    // Expected Deriv response includes access_token (and possibly account info)
    return res.json({
      access_token: data.access_token,
      account: data.account_list ? data.account_list[0]?.loginid : null,
      raw: data
    });

  } catch (err) {
    console.error('Exchange error:', err);
    return res.status(500).json({ error: 'Server error during token exchange: ' + err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on port ' + PORT));
