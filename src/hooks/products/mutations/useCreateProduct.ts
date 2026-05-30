import { ProductService } from "@/services/productService";
import { useMutation } from "@tanstack/react-query";
import React from "react";
import { productKeys } from "../productKeys";

export default function useCreateProduct() {
  return useMutation({
    mutationKey: productKeys.list(),
    mutationFn: ProductService.createProduct,
  });
}
