import { ReviewQueryParams } from "@/types/review";

export const reviewKeys = {
  all: ["reviews"] as const,
  productLists: () => [...reviewKeys.all, "product"] as const,
  product: (productId: string, params?: ReviewQueryParams) =>
    [...reviewKeys.productLists(), productId, params ?? {}] as const,
  sellerLists: () => [...reviewKeys.all, "seller"] as const,
  seller: (sellerId: string, params?: ReviewQueryParams) =>
    [...reviewKeys.sellerLists(), sellerId, params ?? {}] as const,
  eligibility: (sellerId: string, productId: string) =>
    [...reviewKeys.all, "eligibility", sellerId, productId] as const,
};
