import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminSellerVerificationService } from "@/services/adminSellerVerificationService";
import { sellerVerificationKeys } from "../sellerVerificationKeys";
import { RejectSellerVerificationData } from "@/types/adminSellerVerification";

export function useRejectSeller() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RejectSellerVerificationData) =>
      adminSellerVerificationService.rejectSeller(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: sellerVerificationKeys.pending(),
      });
    },
  });
}
