import { useMutation, useQueryClient } from "@tanstack/react-query";

import appToast from "@/lib/appToast";
import { PromotionService } from "@/services/promotionService";
import { promotionKeys } from "../promotion-keys";
import { AxiosError } from "axios";
import { handleAxiosError } from "@/lib/utils/errors/errorHandler";

export function useClaimPromotion(promotionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => PromotionService.claim(promotionId),

    onSuccess: (data) => {
      // Update the cached claim so the UI flips to "already claimed" immediately
      queryClient.setQueryData(promotionKeys.myClaim(promotionId), {
        id: data.promotionId,
        slotNumber: data.slotNumber,
        assetUrl: data.assetUrl,
        claimedAt: data.claimedAt,
      });

      // Refetch live status so the slot counter updates
      queryClient.invalidateQueries({
        queryKey: promotionKeys.status(promotionId),
      });

      appToast({
        title: "You claimed your spot!",
        description: data.message,
      });
    },

    onError: (error: AxiosError) => {
      handleAxiosError(error);
    },
  });
}
