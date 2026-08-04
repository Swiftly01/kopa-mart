// ---------------------------------------------------------------------------
// Enums — mirror backend enums exactly so payloads round-trip cleanly.
// ---------------------------------------------------------------------------

export enum ConversationType {
  DIRECT = "direct",
  GROUP = "group",
}

export enum ParticipantRole {
  ADMIN = "admin",
  MEMBER = "member",
}

export enum MessageType {
  TEXT = "text",
  IMAGE = "image",
  FILE = "file",
  AUDIO = "audio",
  SYSTEM = "system",
}

export enum MessageStatus {
  SENT = "sent",
  DELIVERED = "delivered",
  READ = "read",
}

export enum ChatStatus {
  ONLINE = "online",
  OFFLINE = "offline",
}

export enum CallType {
  VIDEO = "video",
  VOICE = "voice",
}

export enum CallStatus {
  INITIATED = "initiated",
  RINGING = "ringing",
  ACTIVE = "active",
  ENDED = "ended",
  DECLINED = "declined",
  MISSED = "missed",
  CANCELLED = "cancelled",
  FAILED = "failed",
}

// ---------------------------------------------------------------------------
// Shared shapes
// ---------------------------------------------------------------------------

/** Minimal user shape returned whenever the backend eager-loads a relation user. */
export interface ChatUser {
  id: string;
  firstName: string;
  lastName: string;
  profilePictureUrl: string | null;
  profilePictureThumbnailUrl: string | null;
  chatStatus?: ChatStatus | string;
}

export interface ChatParticipant {
  id: string;
  conversationId: string;
  userId: string;
  role: ParticipantRole;
  lastReadAt: string | null;
  isMuted: boolean;
  leftAt: string | null;
  user: ChatUser;
  joinedAt: string;
}

export interface Conversation {
  id: string;
  type: ConversationType;
  name: string | null;
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
  lastMessageMediaUrl: string | null;
  lastMessageFileName: string | null;
  lastMessageType: MessageType | null;
  isActive: boolean;
  participants: ChatParticipant[];
  createdAt: string;
  updatedAt: string;
  /** Client-side derived field, populated from /messages/unread-messages. Not present in raw API payload. */
  unreadCount?: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string | null;
  type: MessageType;
  status: MessageStatus;
  mediaUrl: string | null;
  fileName: string | null;
  replyToId: string | null;
  deletedAt: string | null;
  isEdited: boolean;
  sender: ChatUser;
  createdAt: string;
  updatedAt: string;
  /** Client-only: present while a message is being sent optimistically. */
  clientState?: "pending" | "failed" | "sent";
  /** Client-only: local id used to reconcile optimistic messages with server echoes. */
  clientId?: string;
}

export interface Paginated<T> {
  data: T[];
  meta: {
    itemsPerPage: number;
    totalItems: number;
    currentPage: number;
    totalPages: number;
  };
  links: {
    first: string | null;
    last: string | null;
    current: string | null;
    next?: string | null;
    previous?: string | null;
  };
}

// ---------------------------------------------------------------------------
// Request payloads
// ---------------------------------------------------------------------------

export interface ConversationQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortOrder?: "ASC" | "DESC";
}

export interface CreateConversationPayload {
  participantIds: string[];
  type?: ConversationType;
  name?: string;
}

export interface UpdateConversationPayload {
  name?: string;
}

export interface SendMessagePayload {
  conversationId: string;
  content?: string;
  type?: MessageType;
  mediaUrl?: string;
  fileName?: string;
  replyToId?: string;
}

export interface UpdateMessagePayload {
  content: string;
}

export interface UnreadCountRow {
  conversationId: string;
  unreadCount: number;
}

// ---------------------------------------------------------------------------
// Calls
// ---------------------------------------------------------------------------

export interface RTCIceServerConfig {
  urls: string | string[];
  username?: string;
  credential?: string;
}

export interface CallSession {
  id: string;
  callerId: string;
  calleeId: string;
  conversationId: string | null;
  type: CallType;
  status: CallStatus;
  durationSeconds: number | null;
  createdAt: string;
  updatedAt: string;
  caller?: ChatUser;
  callee?: ChatUser;
}

export interface CallHistoryQueryParams {
  page?: number;
  limit?: number;
  type?: CallType;
  sortOrder?: "ASC" | "DESC";
}
