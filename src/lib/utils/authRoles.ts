import { User } from "@/types/auth";

export const ROLES = {
  ADMIN: "admin",
  SUPER_ADMIN: "superadmin",
} as const;

export const hasRole = (user: User | null, role: string) => user.role === role;

export const isAdmin = (user: User | null) =>
  user.role === ROLES.ADMIN || user.role === ROLES.SUPER_ADMIN;

export const isSuperAdmin = (user: User | null) =>
  user.role === ROLES.SUPER_ADMIN;
