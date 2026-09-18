import {
  Bell,
  KeyRound,
  Mail,
  MessageSquare,
  Megaphone,
  Package,
  ShieldCheck,
  ShieldX,
  Sparkles,
  Star,
  TrendingDown,
  LucideIcon,
} from "lucide-react";

import {
  NotificationChannel,
  NotificationItem,
  NotificationType,
} from "@/types/notification";

export type NotificationPayload = Record<string, unknown>;

/**
 * Everything the UI needs to know about one kind of notification: how it looks,
 * what its action button says, where it links to, and which payload fields to
 * treat as an image or hide from the details list.
 *
 * To support a new notification type, add one entry to NOTIFICATION_DESCRIPTORS
 * below — nothing else in the notifications UI needs to change.
 */
export interface NotificationDescriptor {
  /** Internal id, handy for tests and debugging. */
  id: string;
  /** Enum members this descriptor owns. */
  types?: NotificationType[];
  /**
   * Fallback matcher for types the backend sends that aren't in our
   * NotificationType enum yet — checked only when no `types` entry matched.
   */
  match?: (notification: NotificationItem) => boolean;
  icon: LucideIcon;
  /** Tailwind classes for the icon tile. */
  className: string;
  /** Action button copy. Falls back to a path-derived label when omitted. */
  actionLabel?: string;
  /** Payload keys that carry this type's link, checked before the generic ones. */
  urlKeys?: string[];
  /** Builds a path from the payload when the backend sent no usable URL. */
  route?: (data: NotificationPayload) => string | null;
  /** Adjusts a URL that did come from the backend, e.g. forcing the review form. */
  refineHref?: (href: string, data: NotificationPayload) => string;
  /** Payload keys that carry this type's image, checked before the generic ones. */
  imageKeys?: string[];
  /** Extra payload keys to keep out of the details list (beyond ids/urls/images, which are always hidden). */
  hiddenKeys?: string[];
  /**
   * When set, ONLY these payload keys appear in the details list, in this
   * order — for a noisy payload (social links, unsubscribe links, etc.)
   * where showing "everything except the hidden stuff" would show too much.
   */
  visibleKeys?: string[];
  /** Friendlier label for a key than the auto-generated one, e.g. "categoryName" → "Category". */
  labels?: Record<string, string>;
  /** Builds a clickable href for a specific entry, e.g. turning a category name into a filtered listings link. */
  linkFor?: (key: string, value: string, data: NotificationPayload) => string | null;
}

/* ── Shared payload helpers ──────────────────────────────────────────────── */

export function pickString(
  data: NotificationPayload | null,
  keys: string[],
): string | null {
  if (!data) return null;
  for (const key of keys) {
    const value = data[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }
  return null;
}

const SLUG_KEYS = [
  "productSlug",
  "product_slug",
  "listingSlug",
  "listing_slug",
  "slug",
];

/** The product slug carried by the payload, if any. */
export function productSlug(data: NotificationPayload | null): string | null {
  const slug = pickString(data, SLUG_KEYS);
  return slug ? encodeURIComponent(slug) : null;
}

/**
 * Any payload key that identifies a record rather than describing it — never
 * shown in the details list. Matches "id", "productId", "product_id", etc.,
 * so a new *Id field added server-side is hidden automatically.
 */
export function isIdKey(key: string): boolean {
  return /^id$/i.test(key) || /(^|[_-])id$/i.test(key) || /Id$/.test(key);
}

const GENERIC_IMAGE_KEYS = [
  "imageUrl",
  "image_url",
  "photoUrl",
  "photo_url",
  "thumbnailUrl",
  "thumbnail_url",
  "productImageUrl",
  "product_image_url",
  "avatarUrl",
  "avatar_url",
  "coverImageUrl",
  "cover_image_url",
  "iconUrl",
  "icon_url",
  "mainImageUrl",
  "main_image_url",
];

function looksLikeImageUrl(value: string): boolean {
  return /^https?:\/\//i.test(value) || value.startsWith("/");
}

/** The image the payload points at, checking the descriptor's own keys first. */
export function pickImage(
  data: NotificationPayload | null,
  extraKeys: string[] = [],
): string | null {
  if (!data) return null;
  const raw = pickString(data, [...extraKeys, ...GENERIC_IMAGE_KEYS]);
  return raw && looksLikeImageUrl(raw) ? raw : null;
}

/** All keys this descriptor treats as an image, for excluding them from the details list. */
export function imageKeysFor(descriptor: NotificationDescriptor): string[] {
  return [...(descriptor.imageKeys ?? []), ...GENERIC_IMAGE_KEYS];
}

/* ── Review-request specifics ────────────────────────────────────────────── */

const REVIEW_URL_KEYS = ["deepLink", "deep_link", "reviewUrl", "review_url"];

/** Sends an in-app product link to the rating form. */
function toReviewPath(href: string): string {
  const [pathname, query = ""] = href.split("?");
  if (/\/review\/?$/i.test(pathname)) return href;

  const match = pathname.match(/^\/listing\/([^/]+)/i);
  if (!match) return href;

  return `/listing/${match[1]}/review${query ? `?${query}` : ""}`;
}

/**
 * The interaction service's `deepLink` is a mobile-only custom scheme
 * (`kopamarketplace://review/create?...`) with no web equivalent, so it's
 * never usable as an in-app href. The payload carries `productId` alongside
 * it, though, and `/listing/:slug/review` accepts an id in place of a slug
 * (see WriteReview.tsx), so build the web link from that instead.
 */
function reviewRoute(data: NotificationPayload): string | null {
  const productId = pickString(data, ["productId", "product_id"]);
  return productId ? `/listing/${productId}/review` : null;
}

/* ── The registry ───────────────────────────────────────────────────────── */

export const NOTIFICATION_DESCRIPTORS: NotificationDescriptor[] = [
  {
    id: "review_request",
    types: [NotificationType.REVIEW_REQUEST],
    icon: Star,
    className: "bg-warning/15 text-warning",
    actionLabel: "Rate your experience",
    urlKeys: REVIEW_URL_KEYS,
    refineHref: (href) => toReviewPath(href),
    route: reviewRoute,
    imageKeys: ["productImageUrl", "product_image_url"],
  },
  {
    id: "new_product_listing",
    types: [NotificationType.NEW_PRODUCT_LISTING],
    icon: Sparkles,
    className: "bg-primary/15 text-primary",
    actionLabel: "View product",
    imageKeys: ["mainImageUrl", "main_image_url"],
    // The rest of the payload (store name, socials, unsubscribe link, ids…)
    // is plumbing for the email/push template, not something to show here.
    visibleKeys: [
      "categoryName",
      "contactEmail",
      "priceDisplay",
      "conditionLabel",
      "whatsappUrl",
    ],
    labels: {
      categoryName: "Category",
      contactEmail: "Email",
      priceDisplay: "Price",
      conditionLabel: "Condition",
      whatsappUrl: "WhatsApp",
    },
    linkFor: (key, value) =>
      key === "categoryName"
        ? `/listings?category=${encodeURIComponent(value)}`
        : null,
  },
  {
    id: "price_drop",
    types: [NotificationType.PRICE_DROP_ALERT],
    icon: TrendingDown,
    className: "bg-warning/15 text-warning",
    actionLabel: "View product",
    route: (data) => {
      const slug = productSlug(data);
      return slug ? `/listing/${slug}` : null;
    },
  },
  {
    id: "promotion",
    types: [NotificationType.PROMOTION_ALERT],
    icon: Megaphone,
    className: "bg-accent/30 text-accent-foreground",
    actionLabel: "View product",
    route: (data) => {
      const slug = productSlug(data);
      return slug ? `/listing/${slug}` : null;
    },
  },
  {
    id: "order_confirmation",
    types: [NotificationType.ORDER_CONFIRMATION],
    icon: Package,
    className: "bg-success/15 text-success",
    actionLabel: "View order",
  },
  {
    id: "order_status",
    types: [NotificationType.ORDER_STATUS_UPDATE],
    icon: Package,
    className: "bg-blue-500/15 text-blue-500",
    actionLabel: "View order",
  },
  {
    id: "seller_approved",
    types: [NotificationType.SELLER_APPROVED],
    icon: ShieldCheck,
    className: "bg-success/15 text-success",
    actionLabel: "Go to your store",
    route: () => "/seller-dashboard/manage-listings",
  },
  {
    id: "seller_rejected",
    types: [NotificationType.SELLER_REJECTED],
    icon: ShieldX,
    className: "bg-destructive/15 text-destructive",
  },
  {
    id: "credentials",
    types: [NotificationType.OTP_VERIFICATION, NotificationType.PASSWORD_RESET],
    icon: KeyRound,
    className: "bg-primary/15 text-primary",
    // OTP codes live in the body — nothing useful to link to.
    hiddenKeys: ["otp", "code", "token"],
  },
];

/** Used when nothing in the registry matches, so a brand-new type never renders blank. */
const CHANNEL_FALLBACKS: Record<
  NotificationChannel,
  Pick<NotificationDescriptor, "id" | "icon" | "className">
> = {
  [NotificationChannel.EMAIL]: {
    id: "fallback_email",
    icon: Mail,
    className: "bg-secondary text-foreground",
  },
  [NotificationChannel.SMS]: {
    id: "fallback_sms",
    icon: MessageSquare,
    className: "bg-secondary text-foreground",
  },
  [NotificationChannel.PUSH]: {
    id: "fallback_push",
    icon: Bell,
    className: "bg-secondary text-foreground",
  },
};

/**
 * Finds the descriptor for a notification: exact type match first, then the
 * string/payload matchers, then a channel-based fallback.
 */
export function resolveNotificationDescriptor(
  notification: NotificationItem,
): NotificationDescriptor {
  const byType = NOTIFICATION_DESCRIPTORS.find((descriptor) =>
    descriptor.types?.includes(notification.type),
  );
  if (byType) return byType;

  const byMatch = NOTIFICATION_DESCRIPTORS.find((descriptor) =>
    descriptor.match?.(notification),
  );
  if (byMatch) return byMatch;

  return (
    CHANNEL_FALLBACKS[notification.channel] ??
    CHANNEL_FALLBACKS[NotificationChannel.PUSH]
  );
}