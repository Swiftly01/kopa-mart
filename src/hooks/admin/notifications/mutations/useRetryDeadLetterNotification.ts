import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DEAD_LETTER_QUERY_KEY } from "../queries/useGetDeadLetterNotifications";
import { adminNotificationsService } from "@/services/adminNotificationsService";

export default function useRetryDeadLetterNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminNotificationsService.retryDeadLetter(id),
    onSuccess: () => {
      
      queryClient.invalidateQueries({ queryKey: DEAD_LETTER_QUERY_KEY });
    },
  });
}
