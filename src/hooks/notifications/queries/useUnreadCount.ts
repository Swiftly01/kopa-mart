import { NotificationService } from "@/services/notificationService";
import { useQuery } from "@tanstack/react-query";
import { notificationKeys } from "../notificationKey";

export default function useUnreadCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: NotificationService.getUnreadCount,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
    refetchOnWindowFocus: true,
  });
}
