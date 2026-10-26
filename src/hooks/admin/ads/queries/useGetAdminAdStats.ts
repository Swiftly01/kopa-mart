import { useQuery } from "@tanstack/react-query";
import { AdminAdsService } from "@/services/adminAdsService";
import { adAdminKeys } from "../adAdminKeys";

// number of ads per status, for the tab badges
export default function useGetAdminAdStats() {
  return useQuery({
    queryKey: adAdminKeys.stats(),
    queryFn: AdminAdsService.getStats,
  });
}
