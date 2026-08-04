import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewKeys } from "../reviewKeys";
import { productKeys } from "@/hooks/products/productKeys";
import { ReviewService } from "@/services/reviewService";
import { UpdateReviewPayload } from "@/types/review";

interface UpdateReviewVariables {
  reviewId: string;
  payload: UpdateReviewPayload;
  sellerId: string;
  productId: string;
}

/**
 * useUpdateReview
 *
 * Calls PATCH /reviews/:reviewId to edit a buyer's own review (allowed only
 * within the server's edit window). Same cache-busting as create — the
 * average rating may shift, so every surface showing it refetches.
 */
export default function useUpdateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId, payload }: UpdateReviewVariables) =>
      ReviewService.update(reviewId, payload),

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
