import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewKeys } from "../reviewKeys";
import { productKeys } from "@/hooks/products/productKeys";
import { ReviewService } from "@/services/reviewService";
import { CreateReviewPayload } from "@/types/review";

/**
 * useCreateReview
 *
 * Calls POST /reviews. The backend recalculates the product's (and seller's)
 * average rating + review count synchronously before responding, so on
 * success we just invalidate every place a rating/review count is displayed
 * — the product detail page, product cards/grids, and the reviews lists —
 * so they all refetch and show the new numbers immediately.
 */
export default function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateReviewPayload) => ReviewService.create(payload),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      queryClient.invalidateQueries({ queryKey: ["products-infinite"] });
      queryClient.invalidateQueries({
        queryKey: reviewKeys.product(variables.productId),
      });
      queryClient.invalidateQueries({
        queryKey: reviewKeys.seller(variables.sellerId),
      });
      queryClient.invalidateQueries({
        queryKey: reviewKeys.eligibility(variables.sellerId, variables.productId),
      });
    },
  });
}
