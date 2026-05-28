import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminSellerVerificationService } from "@/services/adminSellerVerificationService";
import { sellerVerificationKeys } from "../sellerVerificationKeys";
 
export function useApproveSeller() {
  const queryClient = useQueryClient();
 
  return useMutation({
    mutationFn: (userId: string) =>
      adminSellerVerificationService.approveSeller(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: sellerVerificationKeys.pending(),
      });
    },
  });
}