import { NotificationService } from "@/services/notificationService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationKeys } from "../notificationKey";
import {
  NotificationsCache,
  findNotificationInCache,
  patchNotificationInCache,
} from "../notificationsCache";
import { handleAxiosError } from "@/lib/utils/errors/errorHandler";
import { AxiosError } from "axios";
import appToast from "@/lib/appToast";

export default function useMarkNotificationUnread() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => NotificationService.markAsUnread(id),

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

      const wasRead = Boolean(findNotificationInCache(previous, id)?.readAt);

      queryClient.setQueryData<NotificationsCache>(
        notificationKeys.list(),
        (old) =>
          patchNotificationInCache(old, id, {
            readAt: null,
          }),
      );

      if (wasRead) {
        queryClient.setQueryData<{ count: number }>(
          notificationKeys.unreadCount(),
          (old) => ({
            count: (old?.count ?? 0) + 1,
          }),
        );
      }

      return {
        previous,
        wasRead,
      };
    },

    onSuccess: () => {
      appToast({
        title: "Notification marked as unread successfully",
      });
    },

    onError: (err: AxiosError, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(notificationKeys.list(), context.previous);
      }

      if (context?.wasRead) {
        queryClient.setQueryData<{ count: number }>(
          notificationKeys.unreadCount(),
          (old) => ({
            count: Math.max((old?.count ?? 1) - 1, 0),
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
