import { SellerOnboardingService } from "@/services/sellerOnboardingService";
import { useQuery } from "@tanstack/react-query";
import React from "react";

export default function useGetSellerOnboardingData(userId: string | undefined) {
  return useQuery({
    queryKey: ["seller-onboarding", userId],
    queryFn: async () =>
      SellerOnboardingService.getSellerOnboardingData(userId),
    enabled: !!userId,
  });
}
