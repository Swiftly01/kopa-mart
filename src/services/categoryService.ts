import apiClient from "@/lib/utils/apiClient";
import { apiBaseUrl } from "@/lib/utils/config";
import { CategoryFormData } from "@/pages/admin/CategoryForm";

import {
  CategoryDetail,
  CategoryDetailResponse,
  CategoryListData,
  CategoryListResponse,
  CategoryParams,
} from "@/types/category";

export class CategoryService {
  static async storeCategory(data: CategoryFormData) {
    const response = await apiClient.post(
      `${apiBaseUrl}/api/v1/category`,
      data,
    );

    return response.data.data;
  }

  static async getCategories(
    params?: CategoryParams,
  ): Promise<CategoryListData> {
    const response = await apiClient.get<CategoryListResponse>(
      `${apiBaseUrl}/api/v1/category`,
      {
        params: {
          page: params?.page,
          limit: params?.limit,
          search: params?.search,
        },
      },
    );

    return response.data.data;
  }

  static async getCategory(id: string): Promise<CategoryDetail> {
    const response = await apiClient.get<CategoryDetailResponse>(
      `${apiBaseUrl}/api/v1/category/${id}`,
    );
    console.log(response);
    return response.data.data;
  }

  static async updateCategory(id: string, data: Partial<CategoryFormData>) {
    const response = await apiClient.patch(
      `${apiBaseUrl}/api/v1/category/${id}`,
      data,
    );
    return response.data.data;
  }

  static async deleteCategory(id: string) {
    const response = await apiClient.delete(
      `${apiBaseUrl}/api/v1/category/${id}`,
    );
    return response.data.data;
  }
}
