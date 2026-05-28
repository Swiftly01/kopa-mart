import { useQuery } from "@tanstack/react-query";
import { sellerVerificationKeys } from "../sellerVerificationKeys";
import { adminSellerVerificationService } from "@/services/adminSellerVerificationService";
 
export default function useSellerVerificationDetails(userId: string) {
  return useQuery({
    queryKey: sellerVerificationKeys.getDetail(userId),
    queryFn: () => adminSellerVerificationService.getSellerDetails(userId),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    enabled: !!userId, 
  });
}
