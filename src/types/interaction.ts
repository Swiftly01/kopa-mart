export type InteractionType = "whatsapp" | "call";

export interface Interaction {
  id: string;
  buyerId: string;
  sellerId: string;
  productId: string;
  type: InteractionType;
  createdAt: string;
}

export interface CreateInteractionPayload {
  productId: string;
  sellerId: string;
  type: InteractionType;
}

export interface CreateInteractionResponse {
  success: boolean;
  message: string;
  data: { interaction: Interaction };
}
