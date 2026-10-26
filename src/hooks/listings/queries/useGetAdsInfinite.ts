import { useInfiniteQuery } from "@tanstack/react-query";
import { ListingService } from "@/services/listingService";
import type { ListingSearchParams } from "@/types/listing";
import { listingKeys } from "../listingKeys";

// published ads, page after page (homepage feed when an ad category is selected)
export default function useGetAdsInfinite(
  params: Omit<ListingSearchParams, "page">,
  enabled = true,
) {
  return useInfiniteQuery({
    queryKey: listingKeys.search(params),
    queryFn: ({ pageParam = 1 }) =>
      ListingService.searchListings({ ...params, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage.meta;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    enabled,
    staleTime: 1000 * 60,
  });
}
