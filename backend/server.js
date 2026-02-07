const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = 8080;

const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || 'http://127.0.0.1:18789';
const GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || '';
const SESSION_KEY = process.env.OPENCLAW_SESSION_KEY || 'agent:main:main';

app.use(cors());
app.use(express.json());

// Fallback "fake Sarahi" brain (used only if Gateway call fails)
function generateFallbackReply(message) {
  const trimmed = message.trim();

  if (!trimmed) {
    return '(no message provided)';
  }

  if (/hello|hi|hey/i.test(trimmed)) {
    return 'Hey Erick 🙂 What’s up?';
  }

  if (/who are you/i.test(trimmed)) {
    return 'I’m Sarahi running in your Android chat app backend (fallback mode).';
  }

  return `You said: "${trimmed}". (Gateway unavailable, using fallback reply.)`;
}

async function sendToOpenClaw(message) {
  if (!GATEWAY_TOKEN) {
    console.warn('[openclaw] No gateway token configured, using fallback reply.');
    return generateFallbackReply(message);
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
          message,
          timeoutSeconds: 60,
        },
        sessionKey: SESSION_KEY,
      }),
    });

    if (!response.ok) {
      console.error('[openclaw] HTTP error:', response.status, await response.text());
      return generateFallbackReply(message);
    }

    const data = await response.json();
    if (!data.ok) {
      console.error('[openclaw] Tool invoke error:', data.error);
      return generateFallbackReply(message);
    }

    const result = data.result || {};

    // For sessions_send via tools/invoke, shape looks like:
    // {
    //   ok: true,
    //   result: {
    //     content: [ { type: 'text', text: '...reply text...', ... } ],
    //     details: { ... }
    //   }
    // }

    let replyText = '(no reply from Sarahi)';

    const content = Array.isArray(result.content) ? result.content : [];
    if (content.length > 0 && content[0] && typeof content[0] === 'object' && 'text' in content[0]) {
      replyText = String(content[0].text).trim();
    }

    // If the reply itself is a JSON string with a "reply" field, unwrap it
    if (replyText && replyText.startsWith('{')) {
      try {
        const inner = JSON.parse(replyText);
        if (inner && typeof inner === 'object' && typeof inner.reply === 'string') {
          replyText = inner.reply.trim();
        }
      } catch (e) {
        // not JSON, ignore
      }
    }

    // Fallbacks for other possible shapes
    if (replyText === '(no reply from Sarahi)' && typeof result.text === 'string') {
      replyText = result.text.trim();
    }

    const payloads = result.payloads || result.messages || [];
    if (replyText === '(no reply from Sarahi)' && Array.isArray(payloads) && payloads.length > 0) {
      const first = payloads[0];
      if (first && typeof first === 'object' && 'text' in first) {
        replyText = String(first.text).trim();
      }
    }

    return replyText;
  } catch (err) {
    console.error('[openclaw] Error calling Gateway:', err);
    return generateFallbackReply(message);
  }
}

app.post('/chat', async (req, res) => {
  const message = req.body?.message ?? '';

  try {
    const reply = await sendToOpenClaw(message);
    return res.json({ reply });
  } catch (err) {
    console.error('[chat] Unexpected error:', err);
    const reply = generateFallbackReply(message);
    return res.json({ reply });
  }
});

app.get('/', (_req, res) => {
  res.send('Android chat backend v2 is running (Gateway mode).');
});

app.listen(PORT, () => {
  console.log(`Chat backend v2 listening on http://0.0.0.0:${PORT}`);
  console.log(`[openclaw] Gateway URL: ${GATEWAY_URL}, sessionKey: ${SESSION_KEY}`);
});
