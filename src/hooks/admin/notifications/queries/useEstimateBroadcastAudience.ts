import { useQuery } from "@tanstack/react-query";
import { AudienceEstimateParams } from "@/types/adminNotification";
import { adminNotificationsService } from "@/services/adminNotificationsService";

export default function useEstimateBroadcastAudience(
  params: AudienceEstimateParams,
  enabled = true,
) {
  return useQuery({
    queryKey: ["admin", "notifications", "broadcast-estimate", params],
    queryFn: () => adminNotificationsService.estimateAudience(params),
    enabled,
    staleTime: 30 * 1000,
  });
}
