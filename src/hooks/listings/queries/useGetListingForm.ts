import { ListingService } from "@/services/listingService";
import { useQuery } from "@tanstack/react-query";
import { listingKeys } from "../listingKeys";

// the form description (fields + options) for one category
export default function useGetListingForm(categoryId: string) {
  return useQuery({
    queryKey: listingKeys.form(categoryId),
    queryFn: () => ListingService.getForm(categoryId),
    enabled: !!categoryId,
    // the form rarely changes, so do not refetch while the user is typing
    staleTime: 10 * 60 * 1000,
  });
}
