import apiClient from "@/lib/utils/apiClient";
import { apiBaseUrl } from "@/lib/utils/config";
import { ClaimPromotionResponse, PromotionStatus } from "@/types/promotion";

export class PromotionService {
  static async getActivePromotion(): Promise<
    Pick<
      PromotionStatus,
      "promotionId" | "name" | "description" | "assetType" | "slotLimit"
    >
  > {
    const response = await apiClient.get(
      `${apiBaseUrl}/api/v1/promotions/active`,
    );
    // console.log(response);
    return response.data;
  }

  static async getStatus(promotionId: string): Promise<PromotionStatus> {
    const response = await apiClient.get(`${apiBaseUrl}/api/v1/promotions/${promotionId}/status`);
    return response.data;
  }

  static async claim(promotionId: string): Promise<ClaimPromotionResponse> {
    const response = await apiClient.post(`${apiBaseUrl}/api/v1/promotions/${promotionId}/claim`);
    return response.data;
  }

  static async getMyClaim(promotionId: string) {
    const res = await apiClient.get(`${apiBaseUrl}/api/v1/promotions/${promotionId}/my-claim`);
    // backend returns { claimed: false } if not claimed
    return res.data?.claimed === false ? null : res.data;
  }
}
