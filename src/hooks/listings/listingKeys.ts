import type { ListingSearchParams, MyListingsParams } from "@/types/listing";

export const listingKeys = {
  all: ["listings"] as const,
  categories: () => [...listingKeys.all, "categories"] as const,
  form: (categoryId: string) =>
    [...listingKeys.all, "form", categoryId] as const,
  mine: (params?: MyListingsParams) =>
    [...listingKeys.all, "mine", params ?? {}] as const,
  myDetail: (listingId: string) =>
    [...listingKeys.all, "my-detail", listingId] as const,
  search: (params: ListingSearchParams) =>
    [...listingKeys.all, "search", params] as const,
  publicDetail: (slug: string) =>
    [...listingKeys.all, "public-detail", slug] as const,
};
