import { useMutation } from "@tanstack/react-query";
import { SendNotificationDto } from "@/types/adminNotification";
import { adminNotificationsService } from "@/services/adminNotificationsService";

export default function useSendNotification() {
  return useMutation({
    mutationFn: (dto: SendNotificationDto) => adminNotificationsService.send(dto),
  });
}
