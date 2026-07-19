import { useMutation } from "@tanstack/react-query";
import { SendNotificationDto } from "@/types/adminNotification";
import { adminNotificationsService } from "@/services/adminNotificationsService";

export default function useSendBulkNotifications() {
  return useMutation({
    mutationFn: (notifications: SendNotificationDto[]) =>
      adminNotificationsService.sendBulk(notifications),
  });
}
