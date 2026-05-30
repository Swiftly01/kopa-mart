import { useQuery } from "@tanstack/react-query";
import { productKeys } from "../productKeys";
import { ProductService } from "@/services/productService";
import { ProductParams } from "@/types/product";

export default function useGetSellerProducts(params?: ProductParams) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => ProductService.getSellerProducts(params),
    placeholderData: (prev) => prev,
  });
}
