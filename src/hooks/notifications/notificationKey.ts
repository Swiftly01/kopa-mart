export const notificationKeys = {
  all: ['notifications'] as const,

  lists: () => [...notificationKeys.all, 'list'] as const,

  list: (params?: Record<string, unknown>) =>
    [...notificationKeys.lists(), params] as const,

  detail: (id: string) =>
    [...notificationKeys.all, 'detail', id] as const,

  unreadCount: () =>
    [...notificationKeys.all, 'unread-count'] as const,

  preferences: () =>
    [...notificationKeys.all, 'preferences'] as const,
};