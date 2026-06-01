import apiClient from "@/lib/utils/apiClient";
import { apiBaseUrl } from "@/lib/utils/config";
import {
  GetSavedProductsParams,
  SavedProductPayload,
  SaveStatusResponse,
} from "@/types/savedProduct";

export class SavedProductService {
  static async toggle(productId: string) {
    const response = await apiClient.post(
      `${apiBaseUrl}/api/v1/saved-products/${productId}/toggle`,
    );

    // console.log(response);
    return response.data;
  }

  /** GET /saved-products/:productId/status  →  { isSaved, savedId? } */
  static async getStatus(productId: string): Promise<SaveStatusResponse> {
    const response = await apiClient.get<SaveStatusResponse>(
      `${apiBaseUrl}/api/v1/saved-products/${productId}/status`,
    );
   // console.log(response.data);
    return response.data;
  }

  /** GET /saved-products  →  paginated saved products */
  static async getAll(params: GetSavedProductsParams = {}) {
    const response = await apiClient.get(
      `${apiBaseUrl}/api/v1/saved-products`,
      {
        params,
      },
    );
    return response.data;
  }

  /** GET /saved-products/count  →  { count: number } */
  static async getCount(): Promise<number> {
    const response = await apiClient.get<{ count: number }>(
      `${apiBaseUrl}/api/v1/saved-products/counts`,
    );
    return response.data.count;
  }
}
