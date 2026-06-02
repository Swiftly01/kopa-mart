import apiClient from "@/lib/utils/apiClient";
import { apiBaseUrl } from "@/lib/utils/config";
import { ProductListData, ProductSearchParams } from "@/types/product";

export class AdminProductsService {
  static async getAllListing(
    params?: ProductSearchParams,
  ): Promise<ProductListData> {
    const clean = Object.fromEntries(
      Object.entries(params).filter(
        ([, v]) => v !== undefined && v !== "" && v !== null,
      ),
    );
    const response = await apiClient.get(
      `${apiBaseUrl}/api/v1/products/admin/listing`,
      {
        params: clean,
      },
    );
    return response.data;
  }

  static async deleteListing(productId: string): Promise<void> {
    await apiClient.delete(`${apiBaseUrl}/api/v1/products/admin/${productId}`);
  }
}
