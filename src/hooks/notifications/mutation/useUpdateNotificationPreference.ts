import { NotificationService } from "@/services/notificationService";
import {
  NotificationPreference,
  UpdateNotificationPreferenceDto,
} from "@/types/notification";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationKeys } from "../notificationKey";
import { handleAxiosError } from "@/lib/utils/errors/errorHandler";
import { AxiosError } from "axios";
import appToast from "@/lib/appToast";

export default function useUpdateNotificationPreference() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: UpdateNotificationPreferenceDto) =>
      NotificationService.updatePreference(dto),
    onMutate: async (dto) => {
      await queryClient.cancelQueries({
        queryKey: notificationKeys.preferences(),
      });

      const previous = queryClient.getQueryData<NotificationPreference[]>(
        notificationKeys.preferences(),
      );

      queryClient.setQueryData<NotificationPreference[]>(
        notificationKeys.preferences(),
        (old) => {
          const existing = old?.find((p) => p.channel === dto.channel);
          const updated: NotificationPreference = {
            id: existing?.id ?? dto.channel,
            channel: dto.channel,
            enabled: dto.enabled,
            quietHoursStart:
              dto.quietHoursStart ?? existing?.quietHoursStart ?? null,
            quietHoursEnd: dto.quietHoursEnd ?? existing?.quietHoursEnd ?? null,
            timezone: dto.timezone ?? existing?.timezone ?? "Africa/Lagos",
          };

          if (!old) return [updated];
          const idx = old.findIndex((p) => p.channel === dto.channel);
          if (idx === -1) return [...old, updated];

          const copy = [...old];
          copy[idx] = updated;
          return copy;
        },
      );

      return { previous };
    },

    onSuccess: () => {
      appToast({
        title: "Notification",
        description: "Notification preferences updated successfully",
      });
    },
    onError: (err: AxiosError, dto, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          notificationKeys.preferences(),
          context.previous,
        );
      }

      handleAxiosError(err);
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: notificationKeys.preferences(),
      });
    },
  });
}
