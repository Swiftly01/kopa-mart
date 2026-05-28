export interface RejectSellerVerificationData {
  userId: string;
  rejectionReason: string;
  stepToReject: number;
}


export enum SellerVerificationStatusEnum {
  NOT_STARTED = 'not_stated',
  IN_PROGRESS = 'in_progress',
  PENDING_REVIEW = 'pending_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}