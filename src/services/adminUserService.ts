import apiClient from "@/lib/utils/apiClient";
import { apiBaseUrl } from "@/lib/utils/config";
import { UserResponse } from "@/types/adminUser";
import { User, UserRoleEnum } from "@/types/user";

interface ChangeRoleResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
  };
}

export class AdminUserService {
  static async getUsers(
    page: number = 1,
    limit: number = 10,
    role?: UserRoleEnum,
  ): Promise<UserResponse> {
    const response = await apiClient.get<UserResponse>(
      `${apiBaseUrl}/api/v1/admin/users`,
      { params: { page, limit, ...(role ? { role } : {}) } },
    );
    return response.data;
  }

  static async getUserById(userId: string): Promise<User> {
    const response = await apiClient.get<{ data: { user: User } }>(
      `${apiBaseUrl}/api/v1/admin/users/${userId}`,
    );

    return response.data.data.user;
  }

  static async changeUserRole(userId: string, newRole: string): Promise<User> {
    const response = await apiClient.patch<{ data: { user: User } }>(
      `${apiBaseUrl}/api/v1/admin/users/${userId}/role`,
      { newRole },
    );

    return response.data.data.user;
  }

}
