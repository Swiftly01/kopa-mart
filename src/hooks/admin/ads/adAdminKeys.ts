import type { AdminListingParams } from "@/types/listing";

export const adAdminKeys = {
  all: ["admin-ads"] as const,
  list: (params?: AdminListingParams) =>
    [...adAdminKeys.all, "list", params ?? {}] as const,
  stats: () => [...adAdminKeys.all, "stats"] as const,
  detail: (adId: string) => [...adAdminKeys.all, "detail", adId] as const,
};
