export const userKeys = {
  all: ["user"] as const,
  getUser: () => [...userKeys.all, "me"] as const,
};
