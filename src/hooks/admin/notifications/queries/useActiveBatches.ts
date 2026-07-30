import { useQuery } from "@tanstack/react-query";
import { BatchFeature } from "@/types/adminNotification";
import { adminNotificationsService } from "@/services/adminNotificationsService";

export default function useActiveBatches(feature: BatchFeature) {
  return useQuery({
    queryKey: ["admin", "notifications", "batches", feature],
    queryFn: () => adminNotificationsService.getActiveBatches(feature),
    staleTime: 30 * 1000,
    // Batches expire on their own after an hour — poll so the "previously
    // processed" banner and countdown clear without a manual refresh.
    refetchInterval: 60 * 1000,
  });
}
