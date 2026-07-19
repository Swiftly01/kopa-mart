export enum NotificationChannel {
  EMAIL = "email",
  SMS = "sms",
  PUSH = "push",
}

export enum DevicePlatform {
  IOS = "ios",
  ANDROID = "android",
  WEB = "web",
}

/** Mirrors the backend's NotificationType enum — extend as new event types are added server-side. */
export enum NotificationType {
  OTP_VERIFICATION = "otp_verification",
  PASSWORD_RESET = "password_reset",
  ORDER_CONFIRMATION = "order_confirmation",
  ORDER_STATUS_UPDATE = "order_status_update",
  SELLER_APPROVED = "seller_approved",
  SELLER_REJECTED = "seller_rejected",
  PRICE_DROP_ALERT = "price_drop_alert",
  PROMOTION_ALERT = "promotion_alert",
  GENERIC = "generic",
}

export interface NotificationItem {
  id: string;
  channel: NotificationChannel;
  type: NotificationType;
  title: string | null;
  body: string | null;
  data: Record<string, unknown> | null;
  readAt: string | null;
  sentAt: string | null;
  createdAt: string;
}

/** Matches backend's Paginated<T> shape exactly (see PaginationProvider). */
export interface PaginatedResponse<T> {
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


export interface NotificationPreference {
  id: string;
  channel: NotificationChannel;
  enabled: boolean;
  quietHoursStart: string | null; // "HH:mm"
  quietHoursEnd: string | null; // "HH:mm"
  timezone: string;
}

export interface UpdateNotificationPreferenceDto {
  channel: NotificationChannel;
  enabled: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  timezone?: string;
}

export interface RegisterDeviceTokenDto {
  token: string;
  platform: DevicePlatform;
}
