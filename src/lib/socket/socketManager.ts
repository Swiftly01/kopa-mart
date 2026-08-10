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
let chatSocketToken: string | null = null;
let callSocketToken: string | null = null;

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

// A socket only needs to be replaced when it's genuinely gone — never
// created, explicitly `.disconnect()`-ed, or its reconnection attempts
// exhausted. `.active` captures exactly that (true unless manually
// disconnected or out of retries).
//
// Critically, this is NOT the same as `.connected`. A socket reads
// `connected === false` for the entire duration of any in-flight
// reconnection attempt (a blip, a backgrounded tab waking up, etc.), and
// during that window socket.io deliberately preserves the socket's id,
// packet queue, and ack bookkeeping so it can resume seamlessly. Tearing
// it down just because it's momentarily not connected discards that
// resilience, and any ack the server sends for a request made just
// before the blip goes to a socket nobody is listening on anymore.
function isSocketReusable(socket: Socket | null): socket is Socket {
  return socket !== null && socket.active;
}

export function getChatSocket(token: string): Socket {
  if (isSocketReusable(chatSocket) && chatSocketToken === token) {
    return chatSocket;
  }
  if (chatSocket) chatSocket.disconnect();
  chatSocket = createSocket("/", token);
  chatSocketToken = token;
  return chatSocket;
}

export function getCallSocket(token: string): Socket {
  if (isSocketReusable(callSocket) && callSocketToken === token) {
    return callSocket;
  }
  if (callSocket) callSocket.disconnect();
  callSocket = createSocket("/call", token);
  callSocketToken = token;
  return callSocket;
}

export function disconnectAllSockets(): void {
  chatSocket?.disconnect();
  callSocket?.disconnect();
  chatSocket = null;
  callSocket = null;
  chatSocketToken = null;
  callSocketToken = null;
}