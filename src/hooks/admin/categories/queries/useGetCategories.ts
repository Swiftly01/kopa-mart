import { useQuery } from "@tanstack/react-query";
import { CategoryService } from "@/services/categoryService";
import { categoryKeys } from "../categoryKeys";
import { CategoryParams } from "@/types/category";
 
export default function useGetCategories(params?: CategoryParams) {
  return useQuery({
    queryKey: categoryKeys.list(params),
    queryFn: () => CategoryService.getCategories(params),
    placeholderData: (prev) => prev, 
  });
}