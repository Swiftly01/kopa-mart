import { useQuery } from "@tanstack/react-query";
import { promotionKeys } from "../promotion-keys";
import { PromotionService } from "@/services/promotionService";

/**
 * Checks if the current authenticated user has already claimed this promotion.
 * Returns null if not claimed, or the claim object (with slotNumber) if they have.
 *
 * @param enabled - pass false if user is not logged in to skip the request
 */
export function useMyPromotionClaim(promotionId: string, enabled = true) {
  return useQuery({
    queryKey: promotionKeys.myClaim(promotionId),
    queryFn: () => PromotionService.getMyClaim(promotionId),
    enabled,
    staleTime: Infinity, // a claim never changes once made
  });
}
