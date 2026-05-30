import { CreateProductPayload } from "@/pages/seller-dashboard/CreateListing";
import { ProductService } from "@/services/productService";
import { useMutation } from "@tanstack/react-query";
import { productKeys } from "../productKeys";

interface UpdateProductPayload {
  productId: string;
  payload: Partial<CreateProductPayload>;
}

export default function useUpdateProduct() {
  return useMutation({
    mutationKey: productKeys.list(),

    mutationFn: async ({ productId, payload }: UpdateProductPayload) => {
      return ProductService.updateProduct(productId, payload);
    },
  });
}
