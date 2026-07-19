import { NotificationService } from "@/services/notificationService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationKeys } from "../notificationKey";
import {
  findNotificationInCache,
  patchNotificationInCache,
  NotificationsCache,
} from "../notificationsCache";
import appToast from "@/lib/appToast";
import { handleAxiosError } from "@/lib/utils/errors/errorHandler";
import { AxiosError } from "axios";

export default function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => NotificationService.markAsRead(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({
        queryKey: notificationKeys.list(),
      });

      await queryClient.cancelQueries({
        queryKey: notificationKeys.unreadCount(),
      });

      const previous = queryClient.getQueryData<NotificationsCache>(
        notificationKeys.list(),
      );

      const wasUnread = !findNotificationInCache(previous, id)?.readAt;

      queryClient.setQueryData<NotificationsCache>(
        notificationKeys.list(),
        (old) =>
          patchNotificationInCache(old, id, {
            readAt: new Date().toISOString(),
          }),
      );

      if (wasUnread) {
        queryClient.setQueryData<{ count: number }>(
          notificationKeys.unreadCount(),
          (old) => ({
            count: Math.max((old?.count ?? 1) - 1, 0),
          }),
        );
      }

      return {
        previous,
        wasUnread,
      };
    },

    onSuccess: () => {
      appToast({
        title: "Notification marked as read successfully",
      });
    },

    onError: (err: AxiosError, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(notificationKeys.list(), context.previous);
      }

      if (context?.wasUnread) {
        queryClient.setQueryData<{ count: number }>(
          notificationKeys.unreadCount(),
          (old) => ({
            count: (old?.count ?? 0) + 1,
          }),
        );
      }
      handleAxiosError(err);
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: notificationKeys.list(),
      });

      queryClient.invalidateQueries({
        queryKey: notificationKeys.unreadCount(),
      });
    },
  });
}
