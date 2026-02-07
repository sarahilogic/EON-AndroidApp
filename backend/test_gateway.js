// Minimal one-off test: call OpenClaw Gateway /tools/invoke and log the result
// This does NOT run a server; it just checks the HTTP wiring.

const dotenv = require('dotenv');
dotenv.config();

const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || 'http://127.0.0.1:18789';
const GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || '';
const SESSION_KEY = process.env.OPENCLAW_SESSION_KEY || 'agent:main:main';

async function main() {
  console.log('[test] GATEWAY_URL =', GATEWAY_URL);
  console.log('[test] SESSION_KEY =', SESSION_KEY);
  console.log('[test] TOKEN present =', GATEWAY_TOKEN ? 'yes' : 'NO');

  if (!GATEWAY_TOKEN) {
    console.error('[test] No OPENCLAW_GATEWAY_TOKEN set in .env');
    process.exit(1);
  }

  try {
    const response = await fetch(`${GATEWAY_URL}/tools/invoke`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GATEWAY_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tool: 'sessions_send',
        action: 'json',
        args: {
          sessionKey: SESSION_KEY,
          message: 'Hello from test_gateway.js',
          timeoutSeconds: 30,
        },
        sessionKey: SESSION_KEY,
      }),
    });

    console.log('[test] HTTP status =', response.status);
    const text = await response.text();
    console.log('[test] Raw body =');
    console.log(text);
  } catch (err) {
    console.error('[test] Error calling Gateway:', err);
  }
}

main();
