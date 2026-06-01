import { useMutation, useQueryClient } from "@tanstack/react-query";
import { savedProductKeys } from "../savedProductkeys";
import { SavedProductService } from "@/services/savedProductService";
import { SaveStatusResponse } from "@/types/savedProduct";

/**
 * useToggleSavedProduct
 *
 * Calls POST /saved-products/:productId/toggle.
 * Applies an optimistic update to the heart icon immediately,
 * then syncs with the server response.
 *
 * Usage:
 *   const { mutate: toggle, isPending } = useToggleSavedProduct(productId);
 *   <button onClick={() => toggle()}>…</button>
 */
export function useToggleSavedProduct(productId: string) {
  const queryClient = useQueryClient();
  const statusKey = savedProductKeys.status(productId);

  return useMutation({
    mutationFn: () => SavedProductService.toggle(productId),

    // ── Optimistic update ─────────────────────────────────────────────────────
    onMutate: async () => {
      // Cancel any in-flight refetch so it doesn't overwrite our optimistic data
      await queryClient.cancelQueries({ queryKey: statusKey });

      // Snapshot the current value so we can roll back on error
      const previous = queryClient.getQueryData<SaveStatusResponse>(statusKey);

      // Flip the heart immediately
      queryClient.setQueryData<SaveStatusResponse>(statusKey, (old) => ({
        isSaved: !old?.isSaved,
        savedId: old?.savedId,
      }));

      return { previous };
    },

    // ── Roll back on error ────────────────────────────────────────────────────
    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(statusKey, context.previous);
      }
    },

    // ── Sync server truth after settle ───────────────────────────────────────
    onSettled: () => {
      // Invalidate status so next render gets the real DB value
      queryClient.invalidateQueries({ queryKey: statusKey });
      // Also invalidate the saved list + count (badge on the Saved tab)
      queryClient.invalidateQueries({ queryKey: savedProductKeys.list() });
      queryClient.invalidateQueries({ queryKey: savedProductKeys.count() });
    },
  });
}
