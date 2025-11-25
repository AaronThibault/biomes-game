import { WebSocket, WebSocketServer } from "ws";
import {
  ClientMessage,
  ServerMessage,
  serializeServerMessage,
} from "./protocol";

type ClientInfo = {
  clientId: string;
  userId?: string;
  authUserId?: string;
  isAuthenticated: boolean;
  rooms: Set<string>;
};

type VerifiedAuth = {
  userId: string;
  roles?: string[];
};

/**
 * Temporary stub for auth verification.
 * In the future, this should call the Gamebridge auth service
 * or verify a JWT using the user service's public key.
 */
function verifyAuthToken(authToken: string | undefined): VerifiedAuth | null {
  if (!authToken) {
    return null;
  }

  // Development stub behavior:
  // - Treat any non-empty token as valid
  // - Use the token itself as the userId for now
  return {
    userId: authToken,
    roles: [],
  };
}

export function startWebSocketServer(port: number) {
  const wss = new WebSocketServer({ port, path: "/pb-sync" });
  console.log(`[WS] WebSocket server started on port ${port} at /pb-sync`);

  const clients = new Map<WebSocket, ClientInfo>();
  const rooms = new Map<string, Set<WebSocket>>();
  let nextClientId = 1;

  wss.on("connection", (ws) => {
    const clientId = String(nextClientId++);
    const clientInfo: ClientInfo = {
      clientId,
      isAuthenticated: false,
      rooms: new Set(),
    };
    clients.set(ws, clientInfo);

    console.log(`[WS] Client connected: ${clientId}`);

    send(ws, {
      type: "welcome",
      payload: {
        clientId,
        userId: clientInfo.userId,
        authUserId: clientInfo.authUserId,
        isAuthenticated: clientInfo.isAuthenticated,
      },
    });

    ws.on("message", (data) => {
      const raw = data.toString();
      console.log(`[WS] [${clientId}] Raw received: ${raw}`);

      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch {
        sendError(
          ws,
          "invalid_json",
          "Message must be valid JSON with { type, payload }."
        );
        return;
      }

      if (
        !parsed ||
        typeof parsed !== "object" ||
        typeof (parsed as any).type !== "string"
      ) {
        sendError(
          ws,
          "invalid_shape",
          "Message must be an object with a string 'type' field."
        );
        return;
      }

      const msg = parsed as ClientMessage;
      handleClientMessage(wss, ws, clients, rooms, msg);
    });

    ws.on("close", () => {
      const info = clients.get(ws);
      const label =
        info && (info.authUserId || info.userId)
          ? ` (user=${info.authUserId ?? info.userId})`
          : "";
      console.log(
        `[WS] Client disconnected: ${info?.clientId ?? "unknown"}${label}`
      );

      if (info) {
        // Remove client from all rooms
        for (const roomId of info.rooms) {
          const members = rooms.get(roomId);
          if (members) {
            members.delete(ws);
            if (members.size === 0) {
              rooms.delete(roomId);
            }
          }
        }
      }

      clients.delete(ws);
    });
  });
}

function handleClientMessage(
  wss: WebSocketServer,
  ws: WebSocket,
  clients: Map<WebSocket, ClientInfo>,
  rooms: Map<string, Set<WebSocket>>,
  msg: ClientMessage
) {
  const clientInfo = clients.get(ws);
  const clientId = clientInfo?.clientId ?? "unknown";

  switch (msg.type) {
    case "ping": {
      send(ws, { type: "pong" });
      break;
    }

    case "echo": {
      if (!msg.payload || typeof msg.payload.text !== "string") {
        sendError(ws, "invalid_payload", "echo.payload.text must be a string.");
        return;
      }
      const text = msg.payload.text;
      send(ws, { type: "echo", payload: { text } });
      break;
    }

    case "identify": {
      const userId = msg.payload?.userId;
      const authToken = msg.payload?.authToken;

      if (userId !== undefined && typeof userId !== "string") {
        sendError(
          ws,
          "invalid_payload",
          "identify.payload.userId must be a string if provided."
        );
        return;
      }

      if (authToken !== undefined && typeof authToken !== "string") {
        sendError(
          ws,
          "invalid_payload",
          "identify.payload.authToken must be a string if provided."
        );
        return;
      }

      let authUserId: string | undefined;
      let isAuthenticated = false;

      if (authToken) {
        const verified = verifyAuthToken(authToken);
        if (!verified) {
          sendError(
            ws,
            "unauthorized",
            "Authentication failed. Invalid auth token."
          );
          return;
        }
        authUserId = verified.userId;
        isAuthenticated = true;
      }

      const updated: ClientInfo = {
        clientId,
        userId,
        authUserId,
        isAuthenticated,
        rooms: clientInfo?.rooms ?? new Set(),
      };
      clients.set(ws, updated);

      console.log(
        `[WS] Client identified: ${clientId}` +
          (userId ? ` (userId=${userId})` : "") +
          (authUserId ? ` (authUserId=${authUserId})` : "") +
          (isAuthenticated ? " [authenticated]" : " [unauthenticated]")
      );

      send(ws, {
        type: "welcome",
        payload: {
          clientId,
          userId,
          authUserId,
          isAuthenticated,
        },
      });
      break;
    }

    case "broadcast": {
      if (!msg.payload || typeof msg.payload.text !== "string") {
        sendError(
          ws,
          "invalid_payload",
          "broadcast.payload.text must be a string."
        );
        return;
      }

      const info = clientInfo;
      if (!info || !info.isAuthenticated) {
        sendError(
          ws,
          "unauthorized",
          "Authentication required to use broadcast."
        );
        return;
      }

      const text = msg.payload.text;
      console.log(
        `[WS] [${clientId}] broadcast: ${text} (authUserId=${
          info.authUserId ?? "unknown"
        })`
      );

      const fromClientId = clientId;

      for (const [otherWs] of clients.entries()) {
        if (otherWs.readyState === otherWs.OPEN) {
          const message: ServerMessage = {
            type: "broadcast",
            payload: {
              fromClientId,
              text,
            },
          };
          otherWs.send(serializeServerMessage(message));
        }
      }
      break;
    }

    case "joinRoom": {
      const roomIdRaw = msg.payload?.roomId;
      if (typeof roomIdRaw !== "string" || roomIdRaw.trim() === "") {
        sendError(
          ws,
          "invalid_payload",
          "joinRoom.payload.roomId must be a non-empty string."
        );
        return;
      }

      const info = clientInfo;
      if (!info || !info.isAuthenticated) {
        sendError(
          ws,
          "unauthorized",
          "Authentication required to join a room."
        );
        return;
      }

      const roomId = roomIdRaw.trim();

      if (!info.rooms.has(roomId)) {
        info.rooms.add(roomId);
      }

      let members = rooms.get(roomId);
      if (!members) {
        members = new Set<WebSocket>();
        rooms.set(roomId, members);
      }
      members.add(ws);

      console.log(
        `[WS] [${clientId}] joined room: ${roomId} (authUserId=${
          info.authUserId ?? "unknown"
        })`
      );

      send(ws, {
        type: "roomJoined",
        payload: { roomId },
      });
      break;
    }

    case "leaveRoom": {
      const roomIdRaw = msg.payload?.roomId;
      if (typeof roomIdRaw !== "string" || roomIdRaw.trim() === "") {
        sendError(
          ws,
          "invalid_payload",
          "leaveRoom.payload.roomId must be a non-empty string."
        );
        return;
      }

      const info = clientInfo;
      if (!info || !info.isAuthenticated) {
        sendError(
          ws,
          "unauthorized",
          "Authentication required to leave a room."
        );
        return;
      }

      const roomId = roomIdRaw.trim();

      info.rooms.delete(roomId);

      const members = rooms.get(roomId);
      if (members) {
        members.delete(ws);
        if (members.size === 0) {
          rooms.delete(roomId);
        }
      }

      console.log(
        `[WS] [${clientId}] left room: ${roomId} (authUserId=${
          info.authUserId ?? "unknown"
        })`
      );

      send(ws, {
        type: "roomLeft",
        payload: { roomId },
      });
      break;
    }

    case "roomBroadcast": {
      const roomIdRaw = msg.payload?.roomId;
      const text = msg.payload?.text;

      if (typeof roomIdRaw !== "string" || roomIdRaw.trim() === "") {
        sendError(
          ws,
          "invalid_payload",
          "roomBroadcast.payload.roomId must be a non-empty string."
        );
        return;
      }

      if (typeof text !== "string") {
        sendError(
          ws,
          "invalid_payload",
          "roomBroadcast.payload.text must be a string."
        );
        return;
      }

      const info = clientInfo;
      if (!info || !info.isAuthenticated) {
        sendError(
          ws,
          "unauthorized",
          "Authentication required to send roomBroadcast."
        );
        return;
      }

      const roomId = roomIdRaw.trim();

      if (!info.rooms.has(roomId)) {
        sendError(
          ws,
          "not_in_room",
          `Client is not a member of room '${roomId}'.`
        );
        return;
      }

      const members = rooms.get(roomId);
      if (!members || members.size === 0) {
        console.log(
          `[WS] [${clientId}] roomBroadcast to empty room: ${roomId} text="${text}"`
        );
      } else {
        console.log(
          `[WS] [${clientId}] roomBroadcast: ${roomId} text="${text}" (authUserId=${
            info.authUserId ?? "unknown"
          })`
        );

        for (const memberWs of members) {
          if (memberWs.readyState === memberWs.OPEN) {
            const message: ServerMessage = {
              type: "roomBroadcast",
              payload: {
                roomId,
                fromClientId: clientId,
                text,
              },
            };
            memberWs.send(serializeServerMessage(message));
          }
        }
      }

      break;
    }

    case "getRoomMembers": {
      const roomIdRaw = msg.payload?.roomId;
      if (typeof roomIdRaw !== "string" || roomIdRaw.trim() === "") {
        sendError(
          ws,
          "invalid_payload",
          "getRoomMembers.payload.roomId must be a non-empty string."
        );
        return;
      }

      const info = clientInfo;
      if (!info || !info.isAuthenticated) {
        sendError(
          ws,
          "unauthorized",
          "Authentication required to query room members."
        );
        return;
      }

      const roomId = roomIdRaw.trim();

      if (!info.rooms.has(roomId)) {
        sendError(
          ws,
          "not_in_room",
          `Client is not a member of room '${roomId}'.`
        );
        return;
      }

      const membersWs = rooms.get(roomId) ?? new Set<WebSocket>();
      const members = Array.from(membersWs)
        .map((memberWs) => clients.get(memberWs))
        .filter((m): m is ClientInfo => !!m)
        .map((m) => ({
          clientId: m.clientId,
          userId: m.userId,
          authUserId: m.authUserId,
        }));

      send(ws, {
        type: "roomMembers",
        payload: {
          roomId,
          members,
        },
      });
      break;
    }

    case "listMyRooms": {
      const info = clientInfo;
      if (!info || !info.isAuthenticated) {
        sendError(ws, "unauthorized", "Authentication required to list rooms.");
        return;
      }

      const roomsArray = Array.from(info.rooms);

      send(ws, {
        type: "myRooms",
        payload: {
          rooms: roomsArray,
        },
      });
      break;
    }

    default: {
      const _exhaustiveCheck: never = msg;
      sendError(
        ws,
        "unknown_type",
        `Unknown message type: ${(msg as any).type}`
      );
      return _exhaustiveCheck;
    }
  }
}

function send(ws: WebSocket, message: ServerMessage) {
  ws.send(serializeServerMessage(message));
}

function sendError(ws: WebSocket, code: string, message: string) {
  const errorMsg: ServerMessage = {
    type: "error",
    payload: { code, message },
  };
  ws.send(serializeServerMessage(errorMsg));
}
