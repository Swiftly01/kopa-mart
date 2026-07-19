import { useMutation } from "@tanstack/react-query";

import { BroadcastNotificationDto } from "@/types/adminNotification";
import { adminNotificationsService } from "@/services/adminNotificationsService";

export default function useBroadcastNotification() {
  return useMutation({
    mutationFn: (dto: BroadcastNotificationDto) =>
      adminNotificationsService.broadcast(dto),
  });
}
