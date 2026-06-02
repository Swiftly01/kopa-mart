import { useQuery } from "@tanstack/react-query";
import { ProductSearchParams } from "@/types/product";
import { adminProductKeys } from "../adminProductKey";
import { AdminProductsService } from "@/services/adminProductsService";

export default function useGetAllListing(params: ProductSearchParams = {}) {
  const { page = 1, limit = 10, ...rest } = params;

  return useQuery({
    queryKey: adminProductKeys.byStatusPaginated(page, limit, rest),
    queryFn: () => AdminProductsService.getAllListing({ page, limit, ...rest }),
    placeholderData: (prev) => prev, // keeps old data visible while fetching
    staleTime: 1000 * 30, // 30 seconds
  });
}
