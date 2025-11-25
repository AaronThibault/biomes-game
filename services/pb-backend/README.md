# Project Believe Backend

Local-first backend for Gamebridge.

## Usage

Run via docker-compose from the repo root:
\`\`\`bash
docker-compose up --build pb-backend
\`\`\`

## WebSocket Protocol v0

All WebSocket messages use a simple JSON envelope:

\`\`\`json
{ "type": "<message-type>", "payload": { ...optional... } }
\`\`\`

### Client → Server messages

**ping**
\`\`\`json
{ "type": "ping" }
\`\`\`

**echo**
\`\`\`json
{ "type": "echo", "payload": { "text": "hello world" } }
\`\`\`

### Server → Client messages

**pong** (response to ping)
\`\`\`json
{ "type": "pong" }
\`\`\`

**echo** (response to echo)
\`\`\`json
{ "type": "echo", "payload": { "text": "hello world" } }
\`\`\`

**error** (for invalid JSON / shape / unknown type)
\`\`\`json
{
"type": "error",
"payload": {
"code": "invalid_json",
"message": "Message must be valid JSON with { type, payload }."
}
}

```

## Tick Loop and Simulation Notes

Project Believe uses a **server-authoritative tick** as the core simulation timebase.

- **Tick rate:** 20 Hz (20 ticks per second, 50 ms interval)
- **Message:** `{"type":"tick","payload":{"timestamp": <server_ms>}}`
- **Who receives ticks:** authenticated WebSocket clients only
- **Why 20 Hz:**
  - Supports responsive movement, combat, communication, and light physics
  - Keeps CPU/network usage low for Chromebooks, low-end phones, and browsers
  - Matches common industry patterns (e.g., Minecraft/Roblox-style 20 TPS)
  - Leaves headroom for future world simulation and UGC scripting

Clients SHOULD treat the `tick.timestamp` field as the **authoritative time source**
for gameplay, not their local system clock. Client-side prediction and interpolation
can be layered on top of this in future phases.
``
```
