import { ProductSearchParams } from "@/types/product";

export const adminProductKeys = {
  all: ["admin", "products"] as const,

  byStatusPaginated: (
    page: number,
    limit: number,
    filters?: Omit<ProductSearchParams, "page" | "limit">,
  ) =>
    [
      ...adminProductKeys.all,
      "list",
      { page, limit, ...filters },
    ] as const,

  byId: (productId: string) =>
    [...adminProductKeys.all, "detail", productId] as const,
};