import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BatchFeature, SendNotificationBatchDto } from "@/types/adminNotification";
import { adminNotificationsService } from "@/services/adminNotificationsService";

export default function useSendNotificationBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: SendNotificationBatchDto) =>
      adminNotificationsService.sendBatch(dto),
    onSuccess: () => {
      // The batch we just created affects both the recipient picker's
      // "already processed" flags and the active-batches list — refresh
      // both so the UI reflects it immediately.
      queryClient.invalidateQueries({
        queryKey: ["admin", "notifications", "recipients", BatchFeature.NOTIFICATION],
      });
      queryClient.invalidateQueries({
        queryKey: ["admin", "notifications", "batches", BatchFeature.NOTIFICATION],
      });
    },
  });
}
