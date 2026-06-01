import apiClient from "@/lib/utils/apiClient";
import { apiBaseUrl } from "@/lib/utils/config";
import { UpdateProfilePayload, User } from "@/types/user";

export class UserService {
  static async getUser(): Promise<User> {
    const response = await apiClient.get(`${apiBaseUrl}/api/v1/users/profile`);

    //console.log(response);
    return response.data;
  }

  static async updateAvatar(file: File): Promise<User> {
    const formData = new FormData();
    formData.append("profilePicture", file);

    const response = await apiClient.patch(
      `${apiBaseUrl}/api/v1/users/me/avatar`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data.user;
  }

  static async updateProfile(payload: UpdateProfilePayload): Promise<User> {
    const response = await apiClient.patch(
      `${apiBaseUrl}/api/v1/users/me`,
      payload,
    );
    return response.data.user;
  }
}
