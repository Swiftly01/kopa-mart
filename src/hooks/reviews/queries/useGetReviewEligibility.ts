import { useQuery } from "@tanstack/react-query";
import useUser from "@/hooks/users/queries/useUser";
import { reviewKeys } from "../reviewKeys";
import { ReviewService } from "@/services/reviewService";

/**
 * useGetReviewEligibility
 *
 * Tells the buyer review page whether the signed-in user can review this
 * product, whether they've already reviewed it (and what that review says,
 * so it can be pre-filled for editing), or why they're blocked.
 *
 * Only runs for signed-in users — guests always see the sign-in prompt.
 */
export default function useGetReviewEligibility(
  sellerId?: string,
  productId?: string,
) {
  const { data: user } = useUser();

  return useQuery({
    queryKey: reviewKeys.eligibility(sellerId ?? "", productId ?? ""),
    queryFn: () => ReviewService.checkEligibility(sellerId!, productId!),
    enabled: !!user && !!sellerId && !!productId,
  });
}
