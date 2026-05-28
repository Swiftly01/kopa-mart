import { SellerOnboardingService } from "@/services/sellerOnboardingService";
import { useMutation } from "@tanstack/react-query";
import React from "react";

export default function useSubmitStoreProfile() {
  const mutation = useMutation({
    mutationFn: (formData: FormData) =>
      SellerOnboardingService.submitStoreProfile(formData),
  });

  return {
    submitProfile: mutation.mutate,
    isLoading: mutation.isPending,
  };
}
