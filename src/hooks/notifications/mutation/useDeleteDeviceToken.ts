import { NotificationService } from "@/services/notificationService";
import { useMutation } from "@tanstack/react-query";

export default function useDeleteDeviceToken() {
  return useMutation({
    mutationFn: (token: string) => NotificationService.deleteDeviceToken(token),
  });
}
