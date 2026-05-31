import { useInfiniteQuery } from "@tanstack/react-query";

import { ProductSearchParams } from "@/types/product";
import { ProductService } from "@/services/productService";

const useGetProductsInfinite = (params: Omit<ProductSearchParams, "page">) => {
  return useInfiniteQuery({
    queryKey: ["products-infinite", params],

    queryFn: ({ pageParam = 1 }) =>
      ProductService.getSellerProducts({
        ...params,
        page: pageParam as number,
      }), 

    initialPageParam: 1,

    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage.meta;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },

    staleTime: 1000 * 60 * 2,
  });
};

export default useGetProductsInfinite;
