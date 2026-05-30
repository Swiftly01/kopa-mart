import { useMutation } from "@tanstack/react-query";
import React from "react";
import { productKeys } from "../productKeys";
import { ProductService } from "@/services/productService";

interface DeleteProductImagePayload {
  productId: string;
  imageId: string;
}

export default function useDeleteProductImage() {
  return useMutation({
    mutationKey: productKeys.list(),
    mutationFn: async ({ productId, imageId }: DeleteProductImagePayload) => {
      return ProductService.deleteProductImage(productId, imageId);
    },
  });
}
