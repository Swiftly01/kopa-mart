import apiClient from "@/lib/utils/apiClient";
import { apiBaseUrl } from "@/lib/utils/config";
import {
  CreateReviewPayload,
  CreateReviewResponse,
  Review,
  ReviewEligibility,
  ReviewListData,
  ReviewQueryParams,
  UpdateReviewPayload,
} from "@/types/review";

export class ReviewService {
  /** GET /reviews/product/:productId  →  paginated reviews for a product */
  static async getForProduct(
    productId: string,
    params?: ReviewQueryParams,
  ): Promise<ReviewListData> {
    const response = await apiClient.get(
      `${apiBaseUrl}/api/v1/reviews/product/${productId}`,
      { params },
    );
    return response.data;
  }

  /** GET /reviews/seller/:sellerId  →  paginated reviews across a seller's products */
  static async getForSeller(
    sellerId: string,
    params?: ReviewQueryParams,
  ): Promise<ReviewListData> {
    const response = await apiClient.get(
      `${apiBaseUrl}/api/v1/reviews/seller/${sellerId}`,
      { params },
    );
    return response.data;
  }

  /** GET /reviews/eligibility?sellerId&productId  →  can the current buyer review this? */
  static async checkEligibility(
    sellerId: string,
    productId: string,
  ): Promise<ReviewEligibility> {
    const response = await apiClient.get(`${apiBaseUrl}/api/v1/reviews/eligibility`, {
      params: { sellerId, productId },
    });
    return response.data;
  }

  /** POST /reviews  →  submit a new review */
  static async create(
    payload: CreateReviewPayload,
  ): Promise<CreateReviewResponse> {
    const response = await apiClient.post(`${apiBaseUrl}/api/v1/reviews`, payload);
    return response.data;
  }

  /** PATCH /reviews/:reviewId  →  edit an existing review (within the edit window) */
  static async update(
    reviewId: string,
    payload: UpdateReviewPayload,
  ): Promise<Review> {
    const response = await apiClient.patch(
      `${apiBaseUrl}/api/v1/reviews/${reviewId}`,
      payload,
    );
    return response.data;
  }

  /** DELETE /reviews/:reviewId  →  remove a review */
  static async remove(reviewId: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(
      `${apiBaseUrl}/api/v1/reviews/${reviewId}`,
    );
    return response.data;
  }
}
