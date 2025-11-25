import express from "express";
import { startWebSocketServer } from "./websocket";

const HTTP_PORT = 4100;
const WS_PORT = 4905;

const app = express();

// Health check endpoint
app.get("/healthz", (req, res) => {
  res.json({ ok: true });
});

// Start HTTP server
app.listen(HTTP_PORT, () => {
  console.log(`[HTTP] pb-backend listening on port ${HTTP_PORT}`);
});

// Start WebSocket server
startWebSocketServer(WS_PORT);
