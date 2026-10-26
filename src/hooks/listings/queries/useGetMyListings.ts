import { ListingService } from "@/services/listingService";
import type { MyListingsParams } from "@/types/listing";
import { useQuery } from "@tanstack/react-query";
import { listingKeys } from "../listingKeys";

export default function useGetMyListings(params?: MyListingsParams) {
  return useQuery({
    queryKey: listingKeys.mine(params),
    queryFn: () => ListingService.getMyListings(params),
  });
}
