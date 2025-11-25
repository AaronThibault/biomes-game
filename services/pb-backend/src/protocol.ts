// Basic message envelope types for Project Believe backend.

// Messages the client can send to the server.
export type ClientMessage =
  | { type: "ping" }
  | { type: "echo"; payload: { text: string } }
  | { type: "identify"; payload: { userId?: string; authToken?: string } }
  | { type: "broadcast"; payload: { text: string } }
  | { type: "joinRoom"; payload: { roomId: string } }
  | { type: "leaveRoom"; payload: { roomId: string } }
  | { type: "roomBroadcast"; payload: { roomId: string; text: string } }
  | { type: "getRoomMembers"; payload: { roomId: string } }
  | { type: "listMyRooms" };

// Messages the server can send back to the client.
export type ServerMessage =
  | { type: "pong" }
  | { type: "echo"; payload: { text: string } }
  | {
      type: "welcome";
      payload: {
        clientId: string;
        userId?: string;
        authUserId?: string;
        isAuthenticated: boolean;
      };
    }
  | {
      // 20 TPS server tick; see websocket.ts for details.
      type: "tick";
      payload: {
        /**
         * Server-side timestamp in milliseconds since Unix epoch.
         * Clients should treat this as the authoritative timebase
         * for movement, combat, and physics, not their local clocks.
         */
        timestamp: number;
      };
    }
  | { type: "broadcast"; payload: { fromClientId: string; text: string } }
  | { type: "roomJoined"; payload: { roomId: string } }
  | { type: "roomLeft"; payload: { roomId: string } }
  | {
      type: "roomBroadcast";
      payload: { roomId: string; fromClientId: string; text: string };
    }
  | {
      type: "roomMembers";
      payload: {
        roomId: string;
        members: Array<{
          clientId: string;
          userId?: string;
          authUserId?: string;
        }>;
      };
    }
  | {
      type: "myRooms";
      payload: {
        rooms: string[];
      };
    }
  | {
      type: "roomPresence";
      payload: {
        roomId: string;
        event: "join" | "leave";
        clientId: string;
        userId?: string;
        authUserId?: string;
      };
    }
  | { type: "error"; payload: { code: string; message: string } };

// Runtime-safe helper to stringify messages.
export function serializeServerMessage(message: ServerMessage): string {
  return JSON.stringify(message);
}
