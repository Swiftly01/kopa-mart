import { useQuery } from "@tanstack/react-query";
import { RecipientSearchParams } from "@/types/adminNotification";
import { adminNotificationsService } from "@/services/adminNotificationsService";

export default function useSearchRecipients(params: RecipientSearchParams) {
  return useQuery({
    queryKey: [
      "admin",
      "notifications",
      "recipients",
      params.feature,
      params.search ?? "",
      params.page ?? 1,
      params.limit ?? 10,
      params.role ?? null,
    ],
    queryFn: () => adminNotificationsService.searchRecipients(params),
    staleTime: 30 * 1000,
    placeholderData: (prev) => prev,
  });
}
