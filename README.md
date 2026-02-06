# EON Android Chat App

A simple Android chat app that talks to a local backend, designed to eventually route messages through OpenClaw to the same "Sarahi" assistant you use on Slack.

## Project Layout

- `Eon/`
  - Android Studio project (Kotlin, Jetpack Compose)
  - Main pieces:
    - `app/src/main/java/com/example/eon/MainActivity.kt` – simple chat UI using Compose
    - `app/src/main/java/com/example/eon/ChatApi.kt` – Retrofit client for the backend
  - Network config:
    - Base URL: `http://10.0.2.2:8080/`
    - Endpoint: `POST /chat`
    - Request body: `{ "message": "..." }`
    - Response body: `{ "reply": "..." }`

Backend is currently developed separately as a Node/Express server on the host machine, listening on port `8080`.

## Current Backend (dev)

_This is **not** in this repo yet – it currently lives locally as `C:\Automation\android-chat-backend-v2`._

- Tech: Node.js + Express + CORS
- Port: `8080`
- Endpoints:
  - `GET /` → Health check (`"Android chat backend v2 is running."`)
  - `POST /chat` → Accepts `{ message }`, returns `{ reply }`
- Current behavior:
  - If no message: returns `"(no message provided)"`
  - If message contains `hello` / `hi` / `hey`: returns `"Hey Erick 642 Whats up?"`
  - If message contains `who are you`: returns `"Im Sarahi running in your Android chat app backend."`
  - Otherwise: echoes back e.g. `You said: "...". Im not wired to real AI yet, but the plumbing works.`

## Goal

- Replace the simple backend logic with a real AI integration.
- Desired architecture:
  - Android App → Local Backend → OpenClaw Gateway → "Sarahi" (same agent as Slack)
- Earlier attempt used the `openclaw` CLI via `child_process`; this was flaky on Windows.
- Next iteration should talk to the OpenClaw gateway over HTTP/WebSocket instead of spawning the CLI.

## How to Run (current setup)

### Backend (dev)

1. Start the Node backend (from `C:\Automation\android-chat-backend-v2`):

   ```bash
   cd C:\Automation\android-chat-backend-v2
   node server.js
   ```

2. You should see:

   ```
   Chat backend v2 listening on http://0.0.0.0:8080
   ```

### Android App

1. Open `Eon/` in Android Studio.
2. Run the app on an Android emulator.
3. Make sure the backend is running on the host at port `8080`.
4. Type messages in the app:
   - "hello" → should get a friendly greeting.
   - "who are you" → should describe Sarahi/backend.
   - Anything else → echo-style reply.

## Future Work

- Add the backend into this repo (e.g. as `/backend`).
- Implement real AI wiring via:
  - Direct OpenAI API **or**
  - OpenClaw gateway HTTP API for full parity with Slack.
- Add basic conversation context (send recent messages, not just single turns).
- Improve the UI: message bubbles, timestamps, loading states, error display.
