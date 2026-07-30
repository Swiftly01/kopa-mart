import apiClient from "@/lib/utils/apiClient";
import { apiBaseUrl } from "@/lib/utils/config";
import {
  AudienceEstimateParams,
  BatchFeature,
  BroadcastNotificationDto,
  BroadcastResult,
  DeadLetterNotification,
  RecipientBatch,
  RecipientBatchSendResult,
  RecipientSearchParams,
  RecipientSearchResult,
  SendNotificationBatchDto,
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

  /** Send one message to an admin-selected batch of up to 100 users. */
  static async sendBatch(
    dto: SendNotificationBatchDto,
  ): Promise<RecipientBatchSendResult> {
    const { data } = await apiClient.post(`${this.baseUrl}/send/batch`, dto);
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

  /** Searchable, paginated recipient picker shared by Send Notification & Broadcast. */
  static async searchRecipients(
    params: RecipientSearchParams,
  ): Promise<RecipientSearchResult> {
    
    const { data } = await apiClient.get(`${this.baseUrl}/recipients`, {
      params: {
        feature: params.feature,
        search: params.search || undefined,
        page: params.page ?? 1,
        limit: params.limit ?? 10,
        role: params.role,
      },
    });
    return data;
  }

 
  static async getActiveBatches(
    feature: BatchFeature,
  ): Promise<RecipientBatch[]> {
    const { data } = await apiClient.get(`${this.baseUrl}/batches`, {
      params: { feature },
    });
    return data;
  }
}
