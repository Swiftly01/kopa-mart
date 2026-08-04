import apiClient from "@/lib/utils/apiClient";
import { apiBaseUrl } from "@/lib/utils/config";
import {
  ConversationQueryParams,
  Message,
  Paginated,
  SendMessagePayload,
  UnreadCountRow,
  UpdateMessagePayload,
} from "@/types/chat";

export class MessageService {
  static async getMessages(
    conversationId: string,
    params: ConversationQueryParams,
  ): Promise<Paginated<Message>> {
    const response = await apiClient.get(
      `${apiBaseUrl}/api/v1/conversations/${conversationId}/messages`,
      { params },
    );
    return response.data;
  }

  static async sendMessage(payload: SendMessagePayload): Promise<Message> {
    const response = await apiClient.post(`${apiBaseUrl}/api/v1/messages`, payload);
    return response.data;
  }

  static async getMessage(id: string): Promise<Message> {
    const response = await apiClient.get(`${apiBaseUrl}/api/v1/messages/${id}`);
    return response.data;
  }

  static async updateMessage(
    id: string,
    payload: UpdateMessagePayload,
  ): Promise<Message> {
    const response = await apiClient.patch(`${apiBaseUrl}/api/v1/messages/${id}`, payload);
    return response.data;
  }

  static async deleteMessage(id: string): Promise<void> {
    await apiClient.delete(`${apiBaseUrl}/api/v1/messages/${id}`);
  }

  static async getUnreadCounts(): Promise<UnreadCountRow[]> {
    const response = await apiClient.get(`${apiBaseUrl}/api/v1/messages/unread-messages`);
    return response.data;
  }
}
