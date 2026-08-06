import { useQuery } from "@tanstack/react-query";
import { reviewKeys } from "../reviewKeys";
import { ReviewService } from "@/services/reviewService";
import { ReviewQueryParams } from "@/types/review";

/**
 * useGetProductReviews
 *
 * Fetches the paginated list of published reviews for a single product.
 * Public endpoint — works for both signed-out visitors and signed-in users.
 *
 * Usage:
 *   const { data, isLoading } = useGetProductReviews(productId, { page, limit: 10 });
 */
export default function useGetProductReviews(
  productId: string,
  params?: ReviewQueryParams,
) {
  return useQuery({
    queryKey: reviewKeys.product(productId, params),
    queryFn: () => ReviewService.getForProduct(productId, params),
    enabled: !!productId,
  });
}
