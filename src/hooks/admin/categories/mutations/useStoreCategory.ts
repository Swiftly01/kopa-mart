import { CategoryFormData } from "@/pages/admin/Settings";
import { CategoryService } from "@/services/categoryService";
import { useMutation } from "@tanstack/react-query";
import React from "react";

export default function useStoreCategory() {
  return useMutation({
    mutationFn: (data: CategoryFormData) => CategoryService.storeCategory(data),
  });
}
