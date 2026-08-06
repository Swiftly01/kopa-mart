import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewKeys } from "../reviewKeys";
import { productKeys } from "@/hooks/products/productKeys";
import { ReviewService } from "@/services/reviewService";

interface DeleteReviewVariables {
  reviewId: string;
  sellerId: string;
  productId: string;
}

/** useDeleteReview — calls DELETE /reviews/:reviewId and refreshes rating displays. */
export default function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId }: DeleteReviewVariables) =>
      ReviewService.remove(reviewId),

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
