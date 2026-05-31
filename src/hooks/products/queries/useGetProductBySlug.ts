import { useQuery } from "@tanstack/react-query";
import React from "react";
import { productKeys } from "../productKeys";
import { ProductService } from "@/services/productService";

export default function useGetProductBySlug(slug: string) {
  return useQuery({
    queryKey: productKeys.detail(slug),
    queryFn: () => ProductService.getProductBySlug(slug),
    enabled: !!slug,
  });
}
