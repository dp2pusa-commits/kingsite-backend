const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

const APP_ID = '33AHd8gjUgryjgdaOal68';
const REDIRECT_URI = 'https://dp2pusa-commits.github.io/kingsite/callback.html';

// Exchange authorization code for tokens
app.post('/exchange', async (req, res) => {
  const { code, code_verifier } = req.body;
  if (!code || !code_verifier) {
    return res.status(400).json({ error: 'Missing code or code_verifier' });
  }
  try {
    const response = await fetch('https://auth.deriv.com/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        code_verifier,
        client_id: APP_ID,
        redirect_uri: REDIRECT_URI
      })
    });
    const data = await response.json();
    if (data.error) return res.status(400).json({ error: data.error_description || data.error });
    res.json({ access_token: data.access_token });
  } catch (err) {
    res.status(500).json({ error: 'Token exchange failed' });
  }
});

app.get('/', (req, res) => res.send('King Site Backend Running ✅'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on port', PORT));
