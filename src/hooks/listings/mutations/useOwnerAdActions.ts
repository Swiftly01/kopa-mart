import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ListingService } from "@/services/listingService";
import { listingKeys } from "../listingKeys";

// everything the owner can do to an existing ad; each action refreshes the ad lists
export default function useOwnerAdActions() {
  const queryClient = useQueryClient();
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: listingKeys.all });

  const resubmit = useMutation({
    mutationFn: ListingService.publishListing,
    onSuccess: refresh,
  });
  const pause = useMutation({
    mutationFn: ListingService.deactivateListing,
    onSuccess: refresh,
  });
  const remove = useMutation({
    mutationFn: ListingService.deleteListing,
    onSuccess: refresh,
  });

  return { resubmit, pause, remove };
}
