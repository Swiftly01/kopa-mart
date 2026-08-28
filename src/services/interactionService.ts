import apiClient from "@/lib/utils/apiClient";
import { apiBaseUrl } from "@/lib/utils/config";
import {
  CreateInteractionPayload,
  CreateInteractionResponse,
} from "@/types/interaction";

export class InteractionService {
  
  static async record(
    payload: CreateInteractionPayload,
  ): Promise<CreateInteractionResponse> {
    const response = await apiClient.post(
      `${apiBaseUrl}/api/v1/interaction`,
      payload,
    );
    console.log(payload);
    return response.data;
  }
}
