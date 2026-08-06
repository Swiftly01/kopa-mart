import { CallHistoryQueryParams } from "@/types/chat";

export const callKeys = {
  all: ["calls"] as const,
  history: (params?: CallHistoryQueryParams) =>
    [...callKeys.all, "history", params ?? {}] as const,
  detail: (id: string) => [...callKeys.all, "detail", id] as const,
};
