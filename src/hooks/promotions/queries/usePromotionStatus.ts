import { useQuery } from '@tanstack/react-query';
import { promotionKeys } from '../promotion-keys';
import { PromotionService } from '@/services/promotionService';


/**
 * Fetches live promotion status (slot count, remaining, isOpen).
 * Refetches every 15 seconds so the count stays fresh for all users.
 */
export function usePromotionStatus(
  promotionId: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: promotionKeys.status(promotionId),
    queryFn: () => PromotionService.getStatus(promotionId),
    enabled: options?.enabled ?? true,
    refetchInterval: 15_000,
    staleTime: 10_000,
  });
}