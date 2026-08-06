import { ConversationQueryParams } from "@/types/chat";

export const chatKeys = {
  all: ["conversations"] as const,
  lists: () => [...chatKeys.all, "list"] as const,
  list: (params?: ConversationQueryParams) =>
    [...chatKeys.lists(), params ?? {}] as const,
  details: () => [...chatKeys.all, "detail"] as const,
  detail: (id: string) => [...chatKeys.details(), id] as const,
};
