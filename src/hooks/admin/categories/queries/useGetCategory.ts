import { useQuery } from "@tanstack/react-query";
import { CategoryService } from "@/services/categoryService";
import { categoryKeys } from "../categoryKeys";

export default function useGetCategory(id: string) {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: () => CategoryService.getCategory(id),
    enabled: !!id,
  });
}
