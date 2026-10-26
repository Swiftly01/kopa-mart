import { useQuery } from "@tanstack/react-query";
import { ProductService } from "@/services/productService";

// true when the signed-in seller still has products from the old flow.
// New sellers have none, so the old dashboard is hidden from them.
export default function useHasLegacyProducts(enabled = true) {
  return useQuery({
    queryKey: ["products", "has-legacy"],
    queryFn: async () => {
      const res = await ProductService.getSellerProducts({ limit: 1 });
      return (res?.meta?.totalItems ?? res?.data?.length ?? 0) > 0;
    },
    enabled,
    staleTime: 1000 * 60,
  });
}