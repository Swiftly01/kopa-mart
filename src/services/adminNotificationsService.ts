import apiClient from "@/lib/utils/apiClient";
import { apiBaseUrl } from "@/lib/utils/config";
import {
  AudienceEstimateParams,
  BroadcastNotificationDto,
  BroadcastResult,
  DeadLetterNotification,
  SendNotificationDto,
  SendNotificationResult,
  TestNotificationDto,
  TestNotificationResult,
} from "@/types/adminNotification";

export class adminNotificationsService {
  private static readonly baseUrl: string = `${apiBaseUrl}/api/v1/admin/notifications`;

  static async send(dto: SendNotificationDto): Promise<SendNotificationResult> {
    const { data } = await apiClient.post(`${this.baseUrl}/send`, dto);
    return data;
  }

  static async sendBulk(
    notifications: SendNotificationDto[],
  ): Promise<{ notificationRequestId: string }[]> {
    const { data } = await apiClient.post(`${this.baseUrl}/bulk`, {
      notifications,
    });
    return data;
  }

  static async listDeadLetter(
    limit: number,
  ): Promise<DeadLetterNotification[]> {
    const { data } = await apiClient.get(`${this.baseUrl}/dead-letter`, {
      params: { limit },
    });
    return data;
  }

  static async retryDeadLetter(id: string): Promise<void> {
    await apiClient.post(`${this.baseUrl}/dead-letter/${id}/retry`);
  }

  static async test(
    dto: TestNotificationDto,
  ): Promise<TestNotificationResult[]> {
    const { data } = await apiClient.post(`${this.baseUrl}/test`, dto);
    return data;
  }

  static async broadcast(
    dto: BroadcastNotificationDto,
  ): Promise<BroadcastResult> {
    const { data } = await apiClient.post(`${this.baseUrl}/broadcast`, dto);
    return data;
  }

  static async estimateAudience(
    params: AudienceEstimateParams,
  ): Promise<number> {
    const { data } = await apiClient.get(`${this.baseUrl}/broadcast/estimate`, {
      params: {
        audience: params.audience,
        userIds: params.userIds?.join(","),
        roleFilter: params.roleFilter,
      },
    });
    return data;
  }
}
