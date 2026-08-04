import { useQuery } from "@tanstack/react-query";
import { reviewKeys } from "../reviewKeys";
import { ReviewService } from "@/services/reviewService";
import { ReviewQueryParams } from "@/types/review";

/**
 * useGetSellerReviews
 *
 * Fetches the paginated list of published reviews across every product
 * belonging to a seller. Used on the seller's "all reviews" view.
 */
export default function useGetSellerReviews(
  sellerId: string,
  params?: ReviewQueryParams,
) {
  return useQuery({
    queryKey: reviewKeys.seller(sellerId, params),
    queryFn: () => ReviewService.getForSeller(sellerId, params),
    enabled: !!sellerId,
  });
}
