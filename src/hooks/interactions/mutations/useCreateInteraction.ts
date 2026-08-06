import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewKeys } from "@/hooks/reviews/reviewKeys";
import { InteractionService } from "@/services/interactionService";
import { CreateInteractionPayload } from "@/types/interaction";

/**
 * useCreateInteraction
 *
 * Records that a buyer contacted a seller (WhatsApp or call) about a
 * product. This is what unlocks that buyer's ability to review the
 * product — the backend's review-eligibility check looks for a matching
 * interaction row.
 *
 * This fires silently in the background alongside outbound links (wa.me /
 * tel:) so it must never block or interrupt that navigation: errors (e.g.
 * a signed-out visitor, or a seller/admin previewing their own listing)
 * are swallowed rather than surfaced to the user.
 */
export default function useCreateInteraction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateInteractionPayload) =>
      InteractionService.record(payload),

    onSuccess: (_data, variables) => {
      // Re-check eligibility so a "Write a review" CTA can appear right away.
      queryClient.invalidateQueries({
        queryKey: reviewKeys.eligibility(variables.sellerId, variables.productId),
      });
    },

    onError: () => {
      // Intentionally silent — this is a background side effect of contacting
      // the seller, not a user-facing action. Guests and non-buyers will
      // always get a 401/403 here, which is expected, not a failure to report.
    },
  });
}
