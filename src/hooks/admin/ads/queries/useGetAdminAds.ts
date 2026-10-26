import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { AdminAdsService } from "@/services/adminAdsService";
import type { AdminListingParams } from "@/types/listing";
import { adAdminKeys } from "../adAdminKeys";

// the admin review queue (filter by status and title)
export default function useGetAdminAds(params: AdminListingParams) {
  return useQuery({
    queryKey: adAdminKeys.list(params),
    queryFn: () => AdminAdsService.getAds(params),
    placeholderData: keepPreviousData,
  });
}
