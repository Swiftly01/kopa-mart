import { GetSavedProductsParams } from "@/types/savedProduct";

export const savedProductKeys = {
  all: ["saved-products"] as const,

  /** Status for a single product*/
  status: (productId: string) =>
    [...savedProductKeys.all, "status", productId] as const,

  /** Batch status map — used when rendering a product grid */
  batchStatus: (productIds: string[]) =>
    [...savedProductKeys.all, "batch-status", ...productIds] as const,

  /** Paginated list of saved products */
  list: (params: GetSavedProductsParams = {}) =>
    [...savedProductKeys.all, "list", params] as const,

  /** Total count badge */
  count: () => [...savedProductKeys.all, "count"] as const,
};
