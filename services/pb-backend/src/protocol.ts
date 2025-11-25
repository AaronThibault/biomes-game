// Basic message envelope types for Project Believe backend.

// Messages the client can send to the server.
export type ClientMessage =
  | { type: "ping" }
  | { type: "echo"; payload: { text: string } }
  | { type: "identify"; payload: { userId?: string; authToken?: string } }
  | { type: "broadcast"; payload: { text: string } }
  | { type: "joinRoom"; payload: { roomId: string } }
  | { type: "leaveRoom"; payload: { roomId: string } }
  | { type: "roomBroadcast"; payload: { roomId: string; text: string } };

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
  | { type: "broadcast"; payload: { fromClientId: string; text: string } }
  | { type: "roomJoined"; payload: { roomId: string } }
  | { type: "roomLeft"; payload: { roomId: string } }
  | {
      type: "roomBroadcast";
      payload: { roomId: string; fromClientId: string; text: string };
    }
  | { type: "error"; payload: { code: string; message: string } };

// Runtime-safe helper to stringify messages.
export function serializeServerMessage(message: ServerMessage): string {
  return JSON.stringify(message);
}
