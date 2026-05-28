import apiClient from "@/lib/utils/apiClient";
import { apiBaseUrl } from "@/lib/utils/config";
import {
  RejectSellerVerificationData,
  SellerVerificationStatusEnum,
} from "@/types/adminSellerVerification";

export interface PendingVerification {
  userId: string;
  email: string;
  firstName: string;
  submittedAt: string;
  status: "pending_review";
}

export interface VerificationResponse {
  data: PendingVerification[];
  meta: {
    itemsPerPage: number;
    totalItems: number;
    currentPage: number;
    totalPages: number;
  };
  links: {
    first: string;
    last: string;
    current: string;
  };
}

export class adminSellerVerificationService {
  static async getSellers(
    page: number = 1,
    limit: number = 10,
    status: SellerVerificationStatusEnum,
  ): Promise<VerificationResponse> {
    const response = await apiClient.get<VerificationResponse>(
      `${apiBaseUrl}/api/v1/admin/sellers/verifications`,
      {
        params: {
          page,
          limit,
          verificationStatus: status,
        },
      },
    );

    return response.data;
  }

  static async approveSeller(userId: string): Promise<void> {
    await apiClient.post(
      `${apiBaseUrl}/api/v1/admin/sellers/${userId}/approve`,
    );
  }

  static async rejectSeller(data: RejectSellerVerificationData): Promise<void> {
    await apiClient.post(
      `${apiBaseUrl}/api/v1/admin/sellers/${data.userId}/reject`,
      { rejectionReason: data.stepToReject, stepToReject: data.stepToReject },
    );
  }

  static async getSellerDetails(userId: string) {
    const response = await apiClient.get(
      `${apiBaseUrl}/api/v1/admin/sellers/${userId}`,
    );
    return response.data;
  }
}
