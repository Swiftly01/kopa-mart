import { SellerOnboardingService } from "@/services/sellerOnboardingService";
import { useMutation } from "@tanstack/react-query";

export default function useInitSellerOnboarding() {
  const mutation = useMutation({
    mutationFn: () => SellerOnboardingService.initializeOnboarding(),
  });

  return {
    initSellerOnboarding: mutation.mutate,
    isLoading: mutation.isPending,
  };
}
