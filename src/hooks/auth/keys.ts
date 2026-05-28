export const authKeys = {
  all: ["auth"] as const,
  resendEmail: () => [...authKeys.all, "resend-email"] as const,
  verifyEmail: () => [...authKeys.all, "verify-email"] as const,
  forgotPassword: () => [...authKeys.all, "forgot-password"] as const,
  resetPassword: () => [...authKeys.all, "reset-password"] as const,
  currentUser: () => [...authKeys.all, "currentUser"] as const,
  session: () => [...authKeys.all, "session"] as const,
};
