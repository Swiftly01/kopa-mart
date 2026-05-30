import { useQuery } from "@tanstack/react-query";
import React from "react";
import { productKeys } from "../productKeys";
import { ProductService } from "@/services/productService";

export default function useGetProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => ProductService.getProductById(id),
    enabled: !!id,
  });
}
