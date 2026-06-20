export const promotionKeys = {
  all: ["promotions"] as const,
  active: () => [...promotionKeys.all, "active"] as const,
  status: (id: string) => [...promotionKeys.all, id, "status"] as const,
  myClaim: (id: string) => [...promotionKeys.all, id, "my-claim"] as const,
};
