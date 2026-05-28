import apiClient from "@/lib/utils/apiClient";
import { apiBaseUrl } from "@/lib/utils/config";
import {
  ForgotPasswordData,
  ForgotPasswordResponse,
  LoginData,
  LoginResponse,
  ResendEmailResponse,
  ResetPasswordData,
  ResetPasswordResponse,
  SignupData,
  SignupResponse,
  VerifyEmailData,
  VerifyEmailResponse,
} from "@/types/auth";

export class AuthService {
  static async signup(data: SignupData): Promise<SignupResponse> {
    const response = await apiClient.post<SignupResponse>(
      `${apiBaseUrl}/api/v1/auth/register`,
      data,
    );
    return response.data;
  }

  static async resendEmailLink(email: string): Promise<ResendEmailResponse> {
    const response = await apiClient.post<ResendEmailResponse>(
      `${apiBaseUrl}/api/v1/auth/resend-link`,
      { email },
    );
    // console.log(response);
    return response.data;
  }

  static async verifyEmail(
    data: VerifyEmailData,
  ): Promise<VerifyEmailResponse> {
    const response = await apiClient.get<VerifyEmailResponse>(
      `${apiBaseUrl}/api/v1/auth/verify-email`,
      {
        params: {
          email: data.email,
          token: data.token,
        },
      },
    );
    // console.log(response);
    return response.data;
  }

  static async login(data: LoginData): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>(
      `${apiBaseUrl}/api/v1/auth/login`,
      data,
    );
    // console.log(response);
    return response.data;
  }

  static async forgotPassword(
    data: ForgotPasswordData,
  ): Promise<ForgotPasswordResponse> {
    const response = await apiClient.post<ForgotPasswordResponse>(
      `${apiBaseUrl}/api/v1/auth/forgot-password`,
      data,
    );
    // console.log(response);
    return response.data;
  }

  
    static async resetPassword(
      data: ResetPasswordData
    ): Promise<ResetPasswordResponse> {
      const response = await apiClient.post<ResetPasswordResponse>(
        `${apiBaseUrl}/api/v1/auth/reset-password`,
        data
      );
      // console.log(response);
      return response.data;
    }
}
