import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminAdsService } from "@/services/adminAdsService";
import { listingKeys } from "@/hooks/listings/listingKeys";
import { adAdminKeys } from "../adAdminKeys";

// approve, reject and edit; each one refreshes the queue, the counts and the public lists
export default function useAdminAdActions() {
  const queryClient = useQueryClient();
  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: adAdminKeys.all }),
      queryClient.invalidateQueries({ queryKey: listingKeys.all }),
    ]);

  const approve = useMutation({
    mutationFn: AdminAdsService.approveAd,
    onSuccess: refresh,
  });
  const reject = useMutation({
    mutationFn: ({ adId, reason }: { adId: string; reason: string }) =>
      AdminAdsService.rejectAd(adId, reason),
    onSuccess: refresh,
  });
  const update = useMutation({
    mutationFn: ({
      adId,
      payload,
    }: {
      adId: string;
      payload: Record<string, unknown>;
    }) => AdminAdsService.updateAd(adId, payload),
    onSuccess: refresh,
  });

  return { approve, reject, update };
}
