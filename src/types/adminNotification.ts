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
  /** Present only when audience === "specific" — the send is tracked as a recipient batch. */
  batchId?: string;
  status?: BatchDeliveryStatus;
  expiresAt?: string;
}

export interface AudienceEstimateParams {
  audience: BroadcastAudience;
  userIds?: string[];
  roleFilter?: string;
}

// --- Recipient batch management (shared by Send Notification & Broadcast) ---

/** Mirrors the backend's MAX_BATCH_RECIPIENTS constant. */
export const MAX_BATCH_RECIPIENTS = 100;

/** Which admin workflow a recipient batch belongs to — kept separate per-admin so working through one doesn't consume/hide slots for the other. */
export enum BatchFeature {
  NOTIFICATION = "notification",
  BROADCAST = "broadcast",
}

/** Lifecycle status of a recipient batch (hand-off to the dispatch pipeline, not per-recipient delivery). */
export enum BatchDeliveryStatus {
  PENDING = "pending",
  QUEUED = "queued",
  PARTIAL_FAILURE = "partial_failure",
  FAILED = "failed",
}

/** A single row from GET /admin/notifications/recipients. */
export interface RecipientOption {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  /** True if this user is part of one of the admin's active (unexpired) batches for this feature. */
  alreadyProcessed: boolean;
}

export interface RecipientSearchParams {
  feature: BatchFeature;
  search?: string;
  page?: number;
  limit?: number;
  role?: UserRoleEnum;
}

export interface RecipientSearchMeta {
  itemsPerPage: number;
  totalItems: number;
  currentPage: number;
  totalPages: number;
  maxRecipientsPerBatch: number;
  /** Distinct users already processed across all of this admin's active batches for this feature. */
  processedUserCount: number;
}

export interface RecipientSearchResult {
  data: RecipientOption[];
  meta: RecipientSearchMeta;
  links: {
    first: string | null;
    last: string | null;
    current: string | null;
    next?: string | null;
    previous?: string | null;
  };
}

/** Matches the backend's RecipientBatch record, as returned by GET /admin/notifications/batches. */
export interface RecipientBatch {
  batchId: string;
  feature: BatchFeature;
  createdBy: string;
  userIds: string[];
  campaignId: string;
  totalQueued: number;
  status: BatchDeliveryStatus;
  sentAt: string; // ISO
  expiresAt: string; // ISO
}

/** Send one message to an admin-selected batch of up to 100 users (POST /admin/notifications/send/batch). */
export interface SendNotificationBatchDto {
  userIds: string[];
  type: NotificationType;
  title?: string;
  body: string;
  html?: string;
  data?: Record<string, unknown>;
  channels?: NotificationChannel[];
  priority?: NotificationPriority;
  scheduledFor?: string;
  batchKey?: string;
}

export interface RecipientBatchSendResult {
  batchId: string;
  campaignId: string;
  totalQueued: number;
  status: BatchDeliveryStatus;
  sentAt: string;
  expiresAt: string;
}
