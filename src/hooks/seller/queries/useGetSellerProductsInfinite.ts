import { useInfiniteQuery } from "@tanstack/react-query";
import { ProductParams } from "@/types/product";
import { ProductService } from "@/services/productService";

const useGetSellerProductsInfinite = (
  params: Omit<ProductParams, "page"> & { sellerId: string },
) => {
  return useInfiniteQuery({
    queryKey: ["seller-products-infinite", params],

    queryFn: ({ pageParam = 1 }) =>
      ProductService.publicSellerProducts({
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

export default useGetSellerProductsInfinite;