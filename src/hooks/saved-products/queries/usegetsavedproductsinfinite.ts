import { useInfiniteQuery } from "@tanstack/react-query";
import useUser from "@/hooks/users/queries/useUser";
import { GetSavedProductsParams } from "@/types/savedProduct";
import { savedProductKeys } from "../savedProductkeys";
import { SavedProductService } from "@/services/savedProductService";
 


export function useGetSavedProductsInfinite(
  params: Omit<GetSavedProductsParams, "page"> = {},
) {
  const { data: user } = useUser();
 
  return useInfiniteQuery({
    queryKey: savedProductKeys.list(params),
 
    queryFn: ({ pageParam = 1 }) =>
      SavedProductService.getAll({ ...params, page: pageParam as number }),
 
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage.meta;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
 
    initialPageParam: 1,
 
    enabled: !!user,
    staleTime: 1000 * 60 * 2,
  });
}