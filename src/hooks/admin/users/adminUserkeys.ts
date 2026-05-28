export const adminUserKeys = {
  all: ["admin", "users"] as const,
  byStatusPaginated: (page: number, limit: number, role?: string) =>
    [...adminUserKeys.all, "list", { page, limit, role }] as const,
  byId: (userId: string) =>
    [...adminUserKeys.all, "detail", userId] as const,
};
