import apiClient from "@/lib/utils/apiClient";
import { apiBaseUrl } from "@/lib/utils/config";
import {
  Conversation,
  ConversationQueryParams,
  CreateConversationPayload,
  Paginated,
  UpdateConversationPayload,
} from "@/types/chat";

export class ChatService {
  static async createConversation(
    payload: CreateConversationPayload,
  ): Promise<Conversation> {
    const response = await apiClient.post(`${apiBaseUrl}/api/v1/conversations`, payload);
    return response.data;
  }

  static async getConversations(
    params: ConversationQueryParams,
  ): Promise<Paginated<Conversation>> {
    const response = await apiClient.get(`${apiBaseUrl}/api/v1/conversations`, { params });
    return response.data;
  }

  static async getConversation(id: string): Promise<Conversation> {
    const response = await apiClient.get(`${apiBaseUrl}/api/v1/conversations/${id}`);
    return response.data;
  }

  static async updateConversation(
    id: string,
    payload: UpdateConversationPayload,
  ): Promise<Conversation> {
    const response = await apiClient.patch(`${apiBaseUrl}/api/v1/conversations/${id}`, payload);
    return response.data;
  }

  static async addParticipant(
    conversationId: string,
    userId: string,
  ): Promise<void> {
    await apiClient.post(`${apiBaseUrl}/api/v1/conversations/${conversationId}/participants`, {
      userId,
    });
  }

  static async removeParticipant(
    conversationId: string,
    userId: string,
  ): Promise<void> {
    await apiClient.delete(
      `${apiBaseUrl}/api/v1/conversations/${conversationId}/participants/${userId}`,
    );
  }

  static async markConversationRead(conversationId: string): Promise<void> {
    await apiClient.patch(`${apiBaseUrl}/api/v1/conversations/${conversationId}/read`);
  }

  static async deleteConversation(conversationId: string): Promise<void> {
    await apiClient.delete(`${apiBaseUrl}/api/v1/conversations/${conversationId}`);
  }
}
