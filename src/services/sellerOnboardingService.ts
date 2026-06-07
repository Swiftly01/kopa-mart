import apiClient from "@/lib/utils/apiClient";
import { apiBaseUrl } from "@/lib/utils/config";
import { InitSellerOnboardingResponse } from "@/types/sellerOnboarding";

export class SellerOnboardingService {
  static async initializeOnboarding() {
    const response = await apiClient.get<InitSellerOnboardingResponse>(
      `${apiBaseUrl}/api/v1/seller/onboarding/initialize`,
    );

    //console.log(response);
    return response.data;
  }

  static async submitId(formData: FormData) {
    const response = await apiClient.post(
      `${apiBaseUrl}/api/v1/seller/onboarding/id-verification`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    //console.log(response);
    return response.data;
  }

  static async submitSelfie(formData: FormData) {
    const response = await apiClient.post(
      `${apiBaseUrl}/api/v1/seller/onboarding/face-verification`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    //console.log(response);
    return response.data;
  }

  static async submitStoreProfile(formData: FormData) {
    const response = await apiClient.post(
      `${apiBaseUrl}/api/v1/seller/onboarding/store-profile`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    //console.log(response);
    return response.data;
  }

  static async getSellerOnboardingData(userId: string) {
    const response = await apiClient.get(
      `${apiBaseUrl}/api/v1/seller/onboarding/${userId}/progress`,
    );

   // console.log(response);
    return response.data;
  }
}
