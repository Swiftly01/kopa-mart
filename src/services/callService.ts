import apiClient from "@/lib/utils/apiClient";
import { apiBaseUrl } from "@/lib/utils/config";
import { CallHistoryQueryParams, CallSession, Paginated } from "@/types/chat";

export class CallService {
  static async getCallHistory(
    params: CallHistoryQueryParams,
  ): Promise<Paginated<CallSession>> {
    const response = await apiClient.get(`${apiBaseUrl}/api/v1/calls`, { params });
    return response.data;
  }

  static async getCall(id: string): Promise<CallSession> {
    const response = await apiClient.get(`${apiBaseUrl}/api/v1/calls/${id}`);
    return response.data;
  }
}
