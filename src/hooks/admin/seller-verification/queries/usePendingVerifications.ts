import { useQuery } from "@tanstack/react-query";
import { sellerVerificationKeys } from "../sellerVerificationKeys";
import { adminSellerVerificationService } from "@/services/adminSellerVerificationService";
import { SellerVerificationStatusEnum } from "@/types/adminSellerVerification";

export default function usePendingVerifications(
  page: number = 1,
  limit: number = 10,
  status: SellerVerificationStatusEnum = SellerVerificationStatusEnum.PENDING_REVIEW,
) {
  return useQuery({
    queryKey: sellerVerificationKeys.byStatusPaginated(status, page, limit),
    queryFn: () =>
      adminSellerVerificationService.getSellers(page, limit, status),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    placeholderData: (prev) => prev,
  });
}
