import apiClient from "@/lib/utils/apiClient";
import { apiBaseUrl } from "@/lib/utils/config";
import { User } from "@/types/user";

export class UserService {

  static async getUser(): Promise<User>{
      const response = await apiClient.get(
      `${apiBaseUrl}/api/v1/user/profile`,
    );

    //console.log(response);
    return response.data;
  }
}