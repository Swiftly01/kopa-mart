export type Status = "active" | "inactive" | "suspended";
type Role = "seller" | "buyer" | "admin";

export enum UserRoleEnum {
  SELLER = "seller",
  BUYER = "buyer",
  ADMIN = "admin",
  SUPER_ADMIN = "super admin"
}



export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: Role;
  isEmailVerified: boolean;

  profilePicture: string | null;

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

  lastLoginAt: string | null;

  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
