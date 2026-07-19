import apiClient from "@/lib/utils/apiClient";
import { apiBaseUrl } from "@/lib/utils/config";
import {
  NotificationItem,
  NotificationPreference,
  PaginatedResponse,
  RegisterDeviceTokenDto,
  UpdateNotificationPreferenceDto,
} from "@/types/notification";

export class NotificationService {
  private static readonly baseUrl: string = `${apiBaseUrl}/api/v1/notifications`;

  static async getPreferences(): Promise<NotificationPreference> {
    const response = await apiClient.get(`${this.baseUrl}/preferences`);

    return response.data;
  }

  static async updatePreference(
    dto: UpdateNotificationPreferenceDto,
  ): Promise<NotificationPreference> {
    const { data } = await apiClient.patch(`${this.baseUrl}/preferences`, dto);
    return data;
  }

  static async registerDeviceToken(dto: RegisterDeviceTokenDto): Promise<void> {
    await apiClient.post(`${this.baseUrl}/device-tokens`, dto);
  }

  static async deleteDeviceToken(token: string): Promise<void> {
    await apiClient.delete(
      `/${this.baseUrl}/device-tokens/${encodeURIComponent(token)}`,
    );
  }

  static async getNotifications(
    params,
  ): Promise<PaginatedResponse<NotificationItem>> {
    const { data } = await apiClient.get(`${this.baseUrl}`, { params });
    return data;
  }

  static async getNotification(id: string): Promise<NotificationItem> {
    const { data } = await apiClient.get(`${this.baseUrl}/${id}`);
    return data;
  }

  static async getUnreadCount(): Promise<{ count: number }> {
    const response = await apiClient.get(
      `${NotificationService.baseUrl}/unread-count`,
    );

    return response.data;
  }

  static async markAsRead(id: string): Promise<NotificationItem> {
    const { data } = await apiClient.patch(`${this.baseUrl}/${id}/read`);
    return data;
  }

  static async markAsUnread(id: string): Promise<NotificationItem> {
    const { data } = await apiClient.patch(`${this.baseUrl}/${id}/unread`);
    return data;
  }

  static async markAllAsRead(): Promise<{ updated: number }> {
    const { data } = await apiClient.patch(`${this.baseUrl}/read-all`);
    return data;
  }

  static async deleteNotification(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }
}
