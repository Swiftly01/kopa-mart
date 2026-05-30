import { ProductParams } from "@/types/product";

export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  uploadImages: () => [...productKeys.all, "images"] as const,
  list: (params?: ProductParams) =>
    [...productKeys.lists(), params ?? {}] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  bySeller: () => [...productKeys.all, "seller"] as const,
};
