import { SellerOnboardingService } from "@/services/sellerOnboardingService";
import { useMutation } from "@tanstack/react-query";

export default function useSubmitIdVerification() {
  return useMutation({
    mutationFn: (formData: FormData) =>
      SellerOnboardingService.submitId(formData),
  });
}
