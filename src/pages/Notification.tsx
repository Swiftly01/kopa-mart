import { useMemo } from "react";
import { BellOff, CheckCheck, Loader2 } from "lucide-react";
import SignInPrompt from "@/components/SignInPrompt";
import useUser from "@/hooks/users/queries/useUser";
import useNotificationsInfinite from "@/hooks/notifications/queries/useNotificationsInfinite";
import useUnreadCount from "@/hooks/notifications/queries/useUnreadCount";

import { NotificationItem } from "@/types/notification";
import appToast from "@/lib/appToast";
import useMarkNotificationRead from "@/hooks/notifications/mutation/useMarkNotificationRead";
import useMarkNotificationUnread from "@/hooks/notifications/mutation/useMarkNotificationUnread";
import useMarkAllNotificationsRead from "@/hooks/notifications/mutation/useMarkAllNotificationsRead";
import useDeleteNotification from "@/hooks/notifications/mutation/useDeleteNotification";
import { useInfiniteScrollSentinel } from "@/hooks/notifications/useInfiniteScrollSentinel";
import NotificationCardSkeleton from "@/components/ui/NotificationCardSkeleton";
import NotificationCard from "@/components/ui/NotificationCard";

const Notification = () => {
  const { data: user, isLoading: isUserLoading } = useUser();

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useNotificationsInfinite();

  const { data: unreadCountData } = useUnreadCount();
  const { mutate: markRead } = useMarkNotificationRead();
  const { mutate: markUnread } = useMarkNotificationUnread();
  const { mutate: markAllRead, isPending: isMarkingAllRead } =
    useMarkAllNotificationsRead();
  const { mutate: deleteNotification } = useDeleteNotification();

  const sentinelRef = useInfiniteScrollSentinel({
    onIntersect: fetchNextPage,
    enabled: Boolean(hasNextPage) && !isFetchingNextPage,
  });

  const notifications = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data],
  );
  const unreadCount = unreadCountData?.count ?? 0;

  if (isUserLoading) {
    return <Loader2 className="mx-auto size-12 animate-spin text-primary" />;
  }

  if (!user) return <SignInPrompt />;

  const handleOpen = (notification: NotificationItem) => {
    if (!notification.readAt) markRead(notification.id);
    
  };

  const handleToggleRead = (notification: NotificationItem) => {
    if (notification.readAt) markUnread(notification.id);
    else markRead(notification.id);
  };

  const handleDelete = (notification: NotificationItem) => {
    deleteNotification(notification.id, {
      onError: () =>
        appToast({
          title: "Couldn't delete notification",
          description: "Please try again.",
          variant: "destructive",
        }),
    });
  };

  return (
    <div className="max-w-2xl px-4 pt-4 pb-20 mx-auto space-y-4">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-xs text-muted-foreground">
              {unreadCount} unread
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllRead()}
            disabled={isMarkingAllRead}
            className="flex items-center gap-1.5 text-xs font-medium text-primary hover:opacity-80 disabled:opacity-50"
          >
            <CheckCheck className="size-3.5" />
            Mark all read
          </button>
        )}
      </div>

      {/* ── Loading (initial) ───────────────────────────────────────────── */}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <NotificationCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* ── Error ────────────────────────────────────────────────────────── */}
      {isError && !isLoading && (
        <div className="py-12 text-sm text-center text-muted-foreground">
          Couldn't load your notifications. Pull to refresh or try again
          shortly.
        </div>
      )}

   
      {!isLoading && !isError && notifications.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="flex items-center justify-center rounded-full size-14 bg-muted text-muted-foreground">
            <BellOff className="size-6" />
          </div>
          <div>
            <p className="text-sm font-medium">You're all caught up</p>
            <p className="text-xs text-muted-foreground">
              New notifications will show up here.
            </p>
          </div>
        </div>
      )}

      {/* ── Feed ─────────────────────────────────────────────────────────── */}
      {!isLoading && !isError && notifications.length > 0 && (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onOpen={handleOpen}
              onToggleRead={handleToggleRead}
              onDelete={handleDelete}
            />
          ))}

          {/* Infinite-scroll sentinel — fetchNextPage fires when this scrolls into view */}
          <div ref={sentinelRef} className="h-1" />

          {isFetchingNextPage && (
            <div className="flex justify-center py-4">
              <Loader2 className="animate-spin size-5 text-muted-foreground" />
            </div>
          )}

          {!hasNextPage && notifications.length > 0 && (
            <p className="py-4 text-xs text-center text-muted-foreground">
              You've reached the end
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Notification;
