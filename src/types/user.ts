import { SellerVerificationStatusEnum } from "./adminSellerVerification";

export type Status = "active" | "inactive" | "suspended";
type Role = "seller" | "buyer" | "admin";

export enum UserRoleEnum {
  SELLER = "seller",
  BUYER = "buyer",
  ADMIN = "admin",
  SUPER_ADMIN = "super admin",
}

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

export interface SellerOnboarding {
  id: string;
  userId: string;

  status: SellerVerificationStatusEnum;
  currentStep: number;
  stepsCompleted: number;

  isStoreProfileCompleted: boolean;
  isFaceVerificationCompleted: boolean;
  isIdVerificationCompleted: boolean;
  isAdminVerificationCompleted: boolean;

  storeProfileStatus: string;
  faceVerificationStatus: string;
  idVerificationStatus: string;

  rejectionReason: string | null;

  reviewedByAdminId: string | null;
  reviewedAt: string | null;

  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  approvedAt: string | null;
  submittedAt?: string | null;

  storeProfileData: StoreProfileData;
  faceVerificationData: FaceVerificationData;
  idVerificationData: IdVerificationData;
}

export interface StoreProfileData {
  storeName: string;
  whatsappNumber: string;
  storeLogoUrl: string | null;
  deliveryPreferences: string[];
}

export interface FaceVerificationData {
  selfieUrl: string;
  submittedAt: string;
}

export interface IdVerificationData {
  fullName: string;
  idNumber: string;
  idType: string;
  stateCode: string;
  stateCodeNumber: string;
  stateName: string;
  ppaLga: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: Role;
  isEmailVerified: boolean;

  profilePicturePublicId: string;
  profilePictureUrl: string;
  profilePictureThumbnailUrl: string;

  emailVerificationToken: string | null;
  emailVerificationTokenExpiresAt: string | null;

  passwordResetToken: string | null;
  passwordResetTokenExpiresAt: string | null;

  otpSecret: string | null;
  isOtpEnabled: boolean;

  failedLoginAttempts: number;
  lockedUntil: string | null;

  status: Status;
  isSuspended: boolean;
  suspensionReason: string | null;

  sellerOnboarding?: SellerOnboarding | null;

  lastLoginAt: string | null;

  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
