import { NotificationItem } from "@/types/notification";
import {
  NotificationPayload,
  imageKeysFor,
  isIdKey,
  pickImage,
  pickString,
  productSlug,
  resolveNotificationDescriptor,
} from "@/lib/utils/notificationRegistry";

export interface NotificationLink {
  /** Internal router path ("/listing/abc/review") or an absolute external URL. */
  href: string;
  isExternal: boolean;
  /** Button copy, e.g. "Rate your experience". */
  label: string;
}

export interface NotificationDetailEntry {
  key: string;
  label: string;
  value: string;
  /** When set, the value renders as a link (in-app path or mailto:/http(s) URL). */
  href?: string;
}

/** Link keys any notification may use, checked after the type's own keys. */
const GENERIC_URL_KEYS = [
  "url",
  "link",
  "actionUrl",
  "action_url",
  "deepLink",
  "deep_link",
  "targetUrl",
  "target_url",
  "productUrl",
  "product_url",
  "clickAction",
  "click_action",
];

/** Payload keys that are plumbing, on top of ids and images — never shown in the details list. */
const BASE_HIDDEN_KEYS = [
  ...GENERIC_URL_KEYS,
  "reviewUrl",
  "review_url",
  "campaignId",
  "campaign_id",
  "batchId",
  "batch_id",
  "idempotencyKey",
  "idempotency_key",
];

/**
 * Maps a backend-shaped path onto the route this app actually serves.
 * The API talks about /products/:slug; the router serves /listing/:slug.
 */
function rewriteToAppPath(path: string): string {
  return path
    .replace(
      /^\/(?:api\/v\d+\/)?(?:products?|listings?)\/([^/?#]+)\/(?:review|reviews|rate|rating)\/?$/i,
      "/listing/$1/review",
    )
    .replace(
      /^\/(?:api\/v\d+\/)?(?:products?|listings?)\/([^/?#]+)\/?$/i,
      "/listing/$1",
    )
    .replace(/^\/listings\/([^/?#]+)/i, "/listing/$1");
}

/**
 * Turns an absolute URL that points at our own origin into a router path so it
 * opens in-app instead of doing a full page reload. Anything else is left as-is.
 */
function normalizeHref(raw: string): { href: string; isExternal: boolean } | null {
  const value = raw.trim();
  if (!value) return null;

  if (value.startsWith("/")) {
    return { href: rewriteToAppPath(value), isExternal: false };
  }

  if (/^https?:\/\//i.test(value)) {
    try {
      const url = new URL(value);
      if (
        typeof window !== "undefined" &&
        url.origin === window.location.origin
      ) {
        return {
          href: `${rewriteToAppPath(url.pathname)}${url.search}${url.hash}`,
          isExternal: false,
        };
      }
      return { href: url.toString(), isExternal: true };
    } catch {
      return null;
    }
  }

  return null;
}

/** Used only when the descriptor doesn't supply its own actionLabel. */
function labelForPath(href: string): string {
  if (/\/review\/?(\?|$)/i.test(href)) return "Rate your experience";
  if (href.startsWith("/listing/")) return "View product";
  if (href.startsWith("/messages")) return "Open chat";
  if (href.startsWith("/seller/")) return "View seller";
  if (href.startsWith("/profile")) return "Go to profile";
  return "Open link";
}

/**
 * Resolves the link a notification points at, if any. Prefers a URL from the
 * payload (the type's own keys first), then falls back to the route the
 * descriptor builds from the payload.
 */
export function getNotificationLink(
  notification: NotificationItem,
): NotificationLink | null {
  const data = notification.data as NotificationPayload | null;
  if (!data) return null;

  const descriptor = resolveNotificationDescriptor(notification);
  const urlKeys = [...(descriptor.urlKeys ?? []), ...GENERIC_URL_KEYS];

  for (const key of urlKeys) {
    const raw = pickString(data, [key]);
    if (!raw) continue;

    const normalized = normalizeHref(raw);
    if (!normalized) continue;

    const href =
      !normalized.isExternal && descriptor.refineHref
        ? descriptor.refineHref(normalized.href, data)
        : normalized.href;

    return {
      href,
      isExternal: normalized.isExternal,
      label: descriptor.actionLabel ?? labelForPath(href),
    };
  }

  const routed = descriptor.route?.(data);
  if (routed) {
    return {
      href: routed,
      isExternal: false,
      label: descriptor.actionLabel ?? labelForPath(routed),
    };
  }

  // Last resort: a bare product slug on the payload still gets you to the listing.
  const slug = productSlug(data);
  if (slug) {
    const href = `/listing/${slug}`;
    return {
      href,
      isExternal: false,
      label: descriptor.actionLabel ?? labelForPath(href),
    };
  }

  return null;
}

/** The image to show for a notification, if the payload carries one. */
export function getNotificationImage(notification: NotificationItem): string | null {
  const data = notification.data as NotificationPayload | null;
  const descriptor = resolveNotificationDescriptor(notification);
  return pickImage(data, descriptor.imageKeys);
}

function humanizeKey(key: string): string {
  return key
    .replace(/[_-]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/^./, (c) => c.toUpperCase());
}

/** Heuristic href for a value the descriptor didn't explicitly map: URLs and emails link themselves. */
function defaultHrefFor(key: string, value: string): string | null {
  if (/^https?:\/\//i.test(value)) return value;
  if (/email/i.test(key) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return `mailto:${value}`;
  }
  return null;
}

function toEntry(
  key: string,
  value: unknown,
  descriptor: ReturnType<typeof resolveNotificationDescriptor>,
  data: NotificationPayload,
): NotificationDetailEntry | null {
  let text: string | null = null;
  if (typeof value === "string" || typeof value === "number") {
    text = String(value).trim();
  } else if (typeof value === "boolean") {
    text = value ? "Yes" : "No";
  }
  if (!text) return null;

  const href = descriptor.linkFor?.(key, text, data) ?? defaultHrefFor(key, text);

  return {
    key,
    label: descriptor.labels?.[key] ?? humanizeKey(key),
    value: text,
    ...(href ? { href } : {}),
  };
}

/**
 * Flattens the payload into readable key/value rows for the details modal.
 *
 * When the descriptor sets `visibleKeys`, only those keys are shown, in that
 * order — for payloads with a lot of plumbing fields (social links, tracking
 * ids, unsubscribe links) that shouldn't all surface in the UI. Otherwise
 * everything is shown except ids, images, and whatever the descriptor hides.
 */
export function getNotificationDetailEntries(
  notification: NotificationItem,
): NotificationDetailEntry[] {
  const data = notification.data as NotificationPayload | null;
  if (!data) return [];

  const descriptor = resolveNotificationDescriptor(notification);

  if (descriptor.visibleKeys) {
    return descriptor.visibleKeys
      .map((key) => toEntry(key, data[key], descriptor, data))
      .filter((entry): entry is NotificationDetailEntry => entry !== null);
  }

  const hidden = new Set([
    ...BASE_HIDDEN_KEYS,
    ...(descriptor.urlKeys ?? []),
    ...imageKeysFor(descriptor),
    ...(descriptor.hiddenKeys ?? []),
  ]);

  return Object.entries(data)
    .filter(([key]) => !hidden.has(key) && !isIdKey(key))
    .map(([key, value]) => toEntry(key, value, descriptor, data))
    .filter((entry): entry is NotificationDetailEntry => entry !== null);
}