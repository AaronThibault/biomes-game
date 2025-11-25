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
\`\`\`
