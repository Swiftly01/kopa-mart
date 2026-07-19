import { NotificationService } from "@/services/notificationService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationKeys } from "../notificationKey";
import {
  NotificationsCache,
  findNotificationInCache,
  removeNotificationFromCache,
} from "../notificationsCache";
import appToast from "@/lib/appToast";
import { AxiosError } from "axios";
import { handleAxiosError } from "@/lib/utils/errors/errorHandler";

export default function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => NotificationService.deleteNotification(id),

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
        (old) => removeNotificationFromCache(old, id),
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
        title: "Notification deleted successfully",
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
