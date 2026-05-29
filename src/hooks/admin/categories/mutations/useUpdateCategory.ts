import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CategoryService } from "@/services/categoryService";
import { CategoryFormData } from "@/pages/admin/Settings";
import { categoryKeys } from "../categoryKeys";
 
interface UpdatePayload {
  id: string;
  data: Partial<CategoryFormData>;
}
 
export default function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: UpdatePayload) =>
      CategoryService.updateCategory(id, data),
    onSuccess: (_res, { id }) => {
      qc.invalidateQueries({ queryKey: categoryKeys.lists() });
      qc.invalidateQueries({ queryKey: categoryKeys.detail(id) });
    },
  });
}