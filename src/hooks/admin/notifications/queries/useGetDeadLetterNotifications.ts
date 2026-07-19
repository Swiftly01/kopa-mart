import { adminNotificationsService } from "@/services/adminNotificationsService";
import { useQuery } from "@tanstack/react-query";


export const DEAD_LETTER_QUERY_KEY = ["admin", "notifications", "dead-letter"];

export default function useGetDeadLetterNotifications(limit: number) {
  return useQuery({
    queryKey: [...DEAD_LETTER_QUERY_KEY, limit],
    queryFn: () => adminNotificationsService.listDeadLetter(limit),
    staleTime: 30 * 1000,
  });
}
