import apiClient from "@/lib/utils/apiClient";
import { apiBaseUrl } from "@/lib/utils/config";
import type { ApiResponse } from "@/types/category";
import type {
  ListingDetailData,
  ListingSearchParams,
  ListingFormSchema,
  ListingImage,
  ListingPage,
  MyListingsParams,
  PostableCategory,
} from "@/types/listing";

const BASE = `${apiBaseUrl}/api/v1/listings`;

// every method returns the unwrapped `data` of the { success, message, data } reply
export class ListingService {
  static async getPostableCategories(): Promise<PostableCategory[]> {
    const response = await apiClient.get<ApiResponse<PostableCategory[]>>(
      `${BASE}/categories`,
    );
    return response.data.data;
  }

  static async getForm(categoryId: string): Promise<ListingFormSchema> {
    const response = await apiClient.get<ApiResponse<ListingFormSchema>>(
      `${BASE}/categories/${categoryId}/form`,
    );
    return response.data.data;
  }

  static async createListing(
    payload: Record<string, unknown>,
  ): Promise<ListingDetailData> {
    const response = await apiClient.post<ApiResponse<ListingDetailData>>(
      BASE,
      payload,
    );
    return response.data.data;
  }

  static async updateListing(
    listingId: string,
    payload: Record<string, unknown>,
  ): Promise<ListingDetailData> {
    const response = await apiClient.patch<ApiResponse<ListingDetailData>>(
      `${BASE}/${listingId}`,
      payload,
    );
    return response.data.data;
  }

  // photos are sent as multipart; the backend keeps the order of the files
  static async uploadImages(
    listingId: string,
    files: File[],
  ): Promise<ListingImage[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));

    const response = await apiClient.post<ApiResponse<ListingImage[]>>(
      `${BASE}/${listingId}/images`,
      formData,
    );
    return response.data.data;
  }

  static async publishListing(listingId: string): Promise<ListingDetailData> {
    const response = await apiClient.post<ApiResponse<ListingDetailData>>(
      `${BASE}/${listingId}/publish`,
    );
    return response.data.data;
  }

  static async getMyListings(params?: MyListingsParams): Promise<ListingPage> {
    const response = await apiClient.get<ApiResponse<ListingPage>>(
      `${BASE}/mine`,
      { params },
    );
    return response.data.data;
  }

  // ---- public ----

  // published ads only; used by the homepage feed
  static async searchListings(params?: ListingSearchParams): Promise<ListingPage> {
    const response = await apiClient.get<ApiResponse<ListingPage>>(BASE, {
      params,
    });
    return response.data.data;
  }

  static async getPublicBySlug(slug: string): Promise<ListingDetailData> {
    const response = await apiClient.get<ApiResponse<ListingDetailData>>(
      `${BASE}/slug/${encodeURIComponent(slug)}`,
    );
    return response.data.data;
  }

  // ---- owner ----

  static async getMyListing(listingId: string): Promise<ListingDetailData> {
    const response = await apiClient.get<ApiResponse<ListingDetailData>>(
      `${BASE}/${listingId}`,
    );
    return response.data.data;
  }

  static async deactivateListing(listingId: string): Promise<ListingDetailData> {
    const response = await apiClient.post<ApiResponse<ListingDetailData>>(
      `${BASE}/${listingId}/deactivate`,
    );
    return response.data.data;
  }

  static async deleteListing(listingId: string): Promise<void> {
    await apiClient.delete(`${BASE}/${listingId}`);
  }

  static async deleteImage(
    listingId: string,
    imageId: string,
  ): Promise<ListingImage[]> {
    const response = await apiClient.delete<ApiResponse<ListingImage[]>>(
      `${BASE}/${listingId}/images/${imageId}`,
    );
    return response.data.data;
  }

  static async reorderImages(
    listingId: string,
    imageIds: string[],
  ): Promise<ListingImage[]> {
    const response = await apiClient.patch<ApiResponse<ListingImage[]>>(
      `${BASE}/${listingId}/images/order`,
      { imageIds },
    );
    return response.data.data;
  }
}
