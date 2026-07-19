import { InfiniteData } from "@tanstack/react-query";
import { NotificationItem, PaginatedResponse } from "@/types/notification";

export type NotificationsCache = InfiniteData<
  PaginatedResponse<NotificationItem>
>;

/** Patches one notification across every loaded page, without refetching. */
export function patchNotificationInCache(
  cache: NotificationsCache | undefined,
  id: string,
  patch: Partial<NotificationItem>,
): NotificationsCache | undefined {
  if (!cache) return cache;
  return {
    ...cache,
    pages: cache.pages.map((page) => ({
      ...page,
      data: page.data.map((n) => (n.id === id ? { ...n, ...patch } : n)),
    })),
  };
}

/** Removes one notification from every loaded page and adjusts each page's `meta.totalItems` down by one. */
export function removeNotificationFromCache(
  cache: NotificationsCache | undefined,
  id: string,
): NotificationsCache | undefined {
  if (!cache) return cache;
  return {
    ...cache,
    pages: cache.pages.map((page) => ({
      ...page,
      data: page.data.filter((n) => n.id !== id),
      meta: { ...page.meta, totalItems: Math.max(page.meta.totalItems - 1, 0) },
    })),
  };
}

export function findNotificationInCache(
  cache: NotificationsCache | undefined,
  id: string,
): NotificationItem | undefined {
  return cache?.pages.flatMap((p) => p.data).find((n) => n.id === id);
}
