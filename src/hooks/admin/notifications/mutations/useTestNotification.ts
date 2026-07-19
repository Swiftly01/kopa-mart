import { useMutation } from "@tanstack/react-query";

import { TestNotificationDto } from "@/types/adminNotification";
import { adminNotificationsService } from "@/services/adminNotificationsService";

export default function useTestNotification() {
  return useMutation({
    mutationFn: (dto: TestNotificationDto) =>
      adminNotificationsService.test(dto),
  });
}
