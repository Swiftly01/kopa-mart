import { useQuery } from "@tanstack/react-query";
import { ListingService } from "@/services/listingService";
import { listingKeys } from "../listingKeys";

// the public page of a live ad
export default function useGetPublicAd(slug: string) {
  return useQuery({
    queryKey: listingKeys.publicDetail(slug),
    queryFn: () => ListingService.getPublicBySlug(slug),
    enabled: Boolean(slug),
    retry: false,
  });
}
