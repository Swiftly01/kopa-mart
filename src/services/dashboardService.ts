import apiClient from "@/lib/utils/apiClient";
import { apiBaseUrl } from "@/lib/utils/config";

export class DashboardService {
  static async getDashboardOverview() {
    const response = await apiClient.get(
      `${apiBaseUrl}/api/v1/admin/dashboard/overview`,
    );
    return response.data;
  }
}
