import { useMemo } from "react";
import useGetProductsInfinite from "@/hooks/products/queries/useGetProductsInfinite";
import type { Product } from "@/types/product";
import type { ListingCardData } from "@/types/listing";
import useGetAdsInfinite from "../queries/useGetAdsInfinite";

interface FeedParams {
  search?: string;
  categoryId?: string;
  categorySlug?: string;
  stateName?: string;
  lgaName?: string;
}

// one card of the homepage feed: a published ad or an older product
export type FeedItem =
  | { kind: "ad"; data: ListingCardData }
  | { kind: "product"; data: Product };

// The homepage feed: published ads first (newest first), then older products.
// Both use the same filters, so a category filter finds ads and products alike.
export default function useMarketFeed(limit: number, params: FeedParams) {
  const ads = useGetAdsInfinite({ limit, ...params });
  const products = useGetProductsInfinite({ limit, ...params });

  const items = useMemo<FeedItem[]>(
    () => [
      ...(ads.data?.pages.flatMap((page) => page.data) ?? []).map(
        (data): FeedItem => ({ kind: "ad", data }),
      ),
      ...(products.data?.pages.flatMap((page) => page.data) ?? []).map(
        (data): FeedItem => ({ kind: "product", data }),
      ),
    ],
    [ads.data, products.data],
  );

  // keep paging ads until they run out, then page products
  const fetchNextPage = () => {
    if (ads.hasNextPage) return ads.fetchNextPage();
    if (products.hasNextPage) return products.fetchNextPage();
  };

  return {
    items,
    totalCount:
      (ads.data?.pages[0]?.meta.totalItems ?? 0) +
      (products.data?.pages[0]?.meta.totalItems ?? 0),
    // show the grid as soon as either list has something, so one slow list does not block it
    isLoading: ads.isLoading && products.isLoading,
    isFetchingNextPage: ads.isFetchingNextPage || products.isFetchingNextPage,
    hasNextPage: Boolean(ads.hasNextPage || products.hasNextPage),
    fetchNextPage,
  };
}
