import { io, Socket } from "socket.io-client";
import { apiBaseUrl } from "@/lib/utils/config";

/**
 * The REST API is served from `${apiBaseUrl}/api/v1`, but Socket.IO is
 * mounted at the bare origin (Nest's global prefix only applies to HTTP
 * routes). We strip a trailing `/api/v1` if present so both dev
 * (`VITE_API_BASE_URL=http://localhost:3000`) and prod configs work.
 */
function getSocketOrigin(): string {
  return apiBaseUrl.replace(/\/api\/v1\/?$/, "").replace(/\/$/, "");
}

let chatSocket: Socket | null = null;
let callSocket: Socket | null = null;

function createSocket(namespace: string, token: string): Socket {
  return io(`${getSocketOrigin()}${namespace}`, {
    auth: { token },
    transports: ["websocket", "polling"],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
  });
}

export function getChatSocket(token: string): Socket {
  if (chatSocket && chatSocket.connected) return chatSocket;
  if (chatSocket) chatSocket.disconnect();
  chatSocket = createSocket("/", token);
  return chatSocket;
}

export function getCallSocket(token: string): Socket {
  if (callSocket && callSocket.connected) return callSocket;
  if (callSocket) callSocket.disconnect();
  callSocket = createSocket("/call", token);
  return callSocket;
}

export function disconnectAllSockets(): void {
  chatSocket?.disconnect();
  callSocket?.disconnect();
  chatSocket = null;
  callSocket = null;
}
