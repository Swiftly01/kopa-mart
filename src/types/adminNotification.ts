import { NotificationChannel, NotificationType } from "@/types/notification";
import { UserRoleEnum } from "./user";

export enum NotificationPriority {
  CRITICAL = 1,
  HIGH = 2,
  NORMAL = 3,
  LOW = 4,
}

export enum NotificationStatus {
  PENDING = "pending",
  QUEUED = "queued",
  PROCESSING = "processing",
  SENT = "sent",
  FAILED = "failed",
  DEAD_LETTER = "dead_letter",
  SKIPPED = "skipped",
}

/** Matches the Notification entity as returned by GET /admin/notifications/dead-letter. */
export interface DeadLetterNotification {
  id: string;
  userId: string;
  channel: NotificationChannel;
  type: NotificationType;
  status: NotificationStatus;
  priority: NotificationPriority;
  title: string | null;
  body: string | null;
  data: Record<string, unknown> | null;
  idempotencyKey: string;
  providerMessageId: string | null;
  providerName: string | null;
  attempts: number;
  lastError: string | null;
  scheduledFor: string | null;
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SendNotificationDto {
  userId: string;
  type: NotificationType;
  title?: string;
  body: string;
  /** Optional rich HTML for the EMAIL channel — takes priority over any template. */
  html?: string;
  data?: Record<string, unknown>;
  channels?: NotificationChannel[];
  priority?: NotificationPriority;
  scheduledFor?: string;
  idempotencyKey?: string;
}

export interface QueuedSendResult {
  mode: "queued";
  notificationRequestId: string;
}

export interface SyncChannelOutcome {
  channel: NotificationChannel;
  status: "sent" | "failed" | "skipped";
  error?: string;
}

export interface SyncSendResult {
  mode: "sync-fallback";
  notificationRequestId: string;
  channels: SyncChannelOutcome[];
}

export type SendNotificationResult = QueuedSendResult | SyncSendResult;

export interface TestNotificationDto {
  email?: string;
  phoneNumber?: string;
  pushToken?: string;
  message?: string;
}

export interface TestNotificationResult {
  channel: NotificationChannel;
  to: string; // redacted server-side
  success: boolean;
  providerName?: string;
  providerMessageId?: string;
  error?: string;
  durationMs: number;
}

// --- Broadcast (send to all users / a filtered segment / an explicit list) ---

export enum BroadcastAudience {
  ALL = "all",
  SPECIFIC = "specific",
}

export interface BroadcastNotificationDto {
  audience: BroadcastAudience;
  userIds?: string[];
  roleFilter?: UserRoleEnum;
  type: NotificationType;
  title?: string;
  body: string;
  /** Rich HTML version of `body`, from the composer — sent as the email's HTML content. */
  bodyHtml?: string;
  data?: Record<string, unknown>;
  channels: NotificationChannel[];
  priority?: NotificationPriority;
  scheduledFor?: string;
  broadcastKey?: string;
}

export interface BroadcastResult {
  totalQueued: number;
  campaignId: string;
}

export interface AudienceEstimateParams {
  audience: BroadcastAudience;
  userIds?: string[];
  roleFilter?: string;
}
