import { NotificationService } from "@/services/notificationService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationKeys } from "../notificationKey";
import { NotificationsCache } from "../notificationsCache";
import { AxiosError } from "axios";
import { handleAxiosError } from "@/lib/utils/errors/errorHandler";
import appToast from "@/lib/appToast";

export default function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => NotificationService.markAllAsRead(),

    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: notificationKeys.list(),
      });

      await queryClient.cancelQueries({
        queryKey: notificationKeys.unreadCount(),
      });

      const previous = queryClient.getQueryData<NotificationsCache>(
        notificationKeys.list(),
      );

      const previousCount = queryClient.getQueryData<{ count: number }>(
        notificationKeys.unreadCount(),
      );

      const now = new Date().toISOString();

      queryClient.setQueryData<NotificationsCache>(
        notificationKeys.list(),
        (old) =>
          old && {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((notification) => ({
                ...notification,
                readAt: notification.readAt ?? now,
              })),
            })),
          },
      );

      queryClient.setQueryData(notificationKeys.unreadCount(), { count: 0 });

      return {
        previous,
        previousCount,
      };
    },

    onSuccess: () => {
      appToast({
        title: "Notification",
        description: "All notification marked as read successfully"
      });
    },

    onError: (err: AxiosError, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(notificationKeys.list(), context.previous);
      }

      if (context?.previousCount) {
        queryClient.setQueryData(
          notificationKeys.unreadCount(),
          context.previousCount,
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
