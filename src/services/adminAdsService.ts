import apiClient from "@/lib/utils/apiClient";
import { apiBaseUrl } from "@/lib/utils/config";
import type { ApiResponse } from "@/types/category";
import type {
  AdminListingDetailData,
  AdminListingPage,
  AdminListingParams,
  AdminListingStats,
  ListingImage,
} from "@/types/listing";

const BASE = `${apiBaseUrl}/api/v1/admin/listings`;

// the admin review side of ads; every method returns the unwrapped `data`
export class AdminAdsService {
  static async getAds(params?: AdminListingParams): Promise<AdminListingPage> {
    const response = await apiClient.get<ApiResponse<AdminListingPage>>(BASE, {
      params,
    });
    return response.data.data;
  }

  static async getStats(): Promise<AdminListingStats> {
    const response = await apiClient.get<ApiResponse<AdminListingStats>>(
      `${BASE}/stats`,
    );
    return response.data.data;
  }

  static async getAd(adId: string): Promise<AdminListingDetailData> {
    const response = await apiClient.get<ApiResponse<AdminListingDetailData>>(
      `${BASE}/${adId}`,
    );
    return response.data.data;
  }

  static async updateAd(
    adId: string,
    payload: Record<string, unknown>,
  ): Promise<AdminListingDetailData> {
    const response = await apiClient.patch<ApiResponse<AdminListingDetailData>>(
      `${BASE}/${adId}`,
      payload,
    );
    return response.data.data;
  }

  static async approveAd(adId: string): Promise<AdminListingDetailData> {
    const response = await apiClient.post<ApiResponse<AdminListingDetailData>>(
      `${BASE}/${adId}/approve`,
    );
    return response.data.data;
  }

  static async rejectAd(
    adId: string,
    reason: string,
  ): Promise<AdminListingDetailData> {
    const response = await apiClient.post<ApiResponse<AdminListingDetailData>>(
      `${BASE}/${adId}/reject`,
      { reason },
    );
    return response.data.data;
  }

  static async deleteImage(adId: string, imageId: string): Promise<ListingImage[]> {
    const response = await apiClient.delete<ApiResponse<ListingImage[]>>(
      `${BASE}/${adId}/images/${imageId}`,
    );
    return response.data.data;
  }

  static async reorderImages(
    adId: string,
    imageIds: string[],
  ): Promise<ListingImage[]> {
    const response = await apiClient.patch<ApiResponse<ListingImage[]>>(
      `${BASE}/${adId}/images/order`,
      { imageIds },
    );
    return response.data.data;
  }
}
