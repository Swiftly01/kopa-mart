export enum PromotionAssetType {
  PDF = 'pdf',
  VIDEO = 'video',
  LINK = 'link',
}

export interface PromotionStatus {
  promotionId: string;
  name: string;
  description: string | null;
  assetType: PromotionAssetType;
  slotLimit: number | null;
  claimedCount: number;
  slotsRemaining: number | null;
  isOpen: boolean;
}

export interface ClaimPromotionResponse {
  promotionId: string;
  promotionName: string;
  slotNumber: number;
  slotLimit: number | null;
  assetUrl: string | null;
  assetType: PromotionAssetType;
  claimedAt: string;
  message: string;
}

export interface UserClaim {
  id: string;
  slotNumber: number;
  assetUrl: string | null;
  claimedAt: string;
}