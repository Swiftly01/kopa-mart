import { QueryClient, useMutation } from "@tanstack/react-query";
import { productKeys } from "../productKeys";
import { ProductService } from "@/services/productService";

interface DeleteProductPayload {
  productId: string;
}
const queryClient = new QueryClient();

export default function useDeleteProduct() {
  return useMutation({
    mutationKey: productKeys.list(),
    mutationFn: async ({ productId }: DeleteProductPayload) => {
      return ProductService.deleteProduct(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: productKeys.all,
      });
    },
  });
}
