import { useQuery } from "@tanstack/react-query";
import useUser from "@/hooks/users/queries/useUser";
import { savedProductKeys } from "../savedProductkeys";
import { SavedProductService } from "@/services/savedProductService";
 
/**
 * useGetSaveStatus
 *
 * Fetches whether the current user has saved a specific product.
 * Only runs when the user is logged in (no wasted requests for guests).
 *
 * Usage:
 *   const { isSaved, isLoading } = useGetSaveStatus(productId);
 */
export function useGetSaveStatus(productId: string) {
  const { data: user } = useUser();
 
  const query = useQuery({
    queryKey: savedProductKeys.status(productId),
    queryFn: () => SavedProductService.getStatus(productId),
    // Only fetch when the user is authenticated
    enabled: !!user && !!productId,
    // Heart icon state is stable — no need to refetch on every window focus
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
 
  return {
    isSaved: query.data?.isSaved ?? false,
    savedId: query.data?.savedId,
    isLoading: query.isLoading,
  };
}
