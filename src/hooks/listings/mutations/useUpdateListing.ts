import { ListingService } from "@/services/listingService";
import { useMutation } from "@tanstack/react-query";

interface UpdateListingVariables {
  listingId: string;
  payload: Record<string, unknown>;
}

export default function useUpdateListing() {
  return useMutation({
    mutationFn: ({ listingId, payload }: UpdateListingVariables) =>
      ListingService.updateListing(listingId, payload),
  });
}
