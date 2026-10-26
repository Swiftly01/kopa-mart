import { useQuery } from "@tanstack/react-query";
import { ListingService } from "@/services/listingService";
import { listingKeys } from "../listingKeys";

// one of the signed-in user's own ads, in any status
export default function useGetMyListing(listingId: string) {
  return useQuery({
    queryKey: listingKeys.myDetail(listingId),
    queryFn: () => ListingService.getMyListing(listingId),
    enabled: Boolean(listingId),
  });
}
