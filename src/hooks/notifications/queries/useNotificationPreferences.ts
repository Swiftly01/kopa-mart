import { useQuery } from "@tanstack/react-query";
import { notificationKeys } from "../notificationKey";
import { NotificationService } from "@/services/notificationService";

export default function useNotificationPreferences() {
  return useQuery({
    queryKey: notificationKeys.preferences(),
    queryFn: NotificationService.getPreferences,
    staleTime: 5 * 60 * 1000,
  });
}
