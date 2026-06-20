import { useQuery } from "@tanstack/react-query";
import { promotionKeys } from "../promotion-keys";
import { PromotionService } from "@/services/promotionService";

export function useActivePromotion() {
  return useQuery({
    queryKey: [...promotionKeys.all, "active"],
    queryFn: () => PromotionService.getActivePromotion(),
    staleTime: 5 * 60 * 1000,
  });
}
