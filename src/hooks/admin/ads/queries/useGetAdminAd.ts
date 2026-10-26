import { useQuery } from "@tanstack/react-query";
import { AdminAdsService } from "@/services/adminAdsService";
import { adAdminKeys } from "../adAdminKeys";

export default function useGetAdminAd(adId: string) {
  return useQuery({
    queryKey: adAdminKeys.detail(adId),
    queryFn: () => AdminAdsService.getAd(adId),
    enabled: Boolean(adId),
  });
}
