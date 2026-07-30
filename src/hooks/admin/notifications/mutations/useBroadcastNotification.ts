import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  BatchFeature,
  BroadcastAudience,
  BroadcastNotificationDto,
} from "@/types/adminNotification";
import { adminNotificationsService } from "@/services/adminNotificationsService";

export default function useBroadcastNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: BroadcastNotificationDto) =>
      adminNotificationsService.broadcast(dto),
    onSuccess: (_result, dto) => {
      // Only the "specific" audience path creates a recipient batch — no
      // point invalidating the picker/batches queries for an "all users"
      // broadcast, which isn't tracked that way.
      if (dto.audience !== BroadcastAudience.SPECIFIC) return;

      queryClient.invalidateQueries({
        queryKey: ["admin", "notifications", "recipients", BatchFeature.BROADCAST],
      });
      queryClient.invalidateQueries({
        queryKey: ["admin", "notifications", "batches", BatchFeature.BROADCAST],
      });
    },
  });
}
