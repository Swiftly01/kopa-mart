import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageService } from "@/services/messageService";
import { messageKeys } from "../messageKeys";
import { Message, Paginated, UpdateMessagePayload } from "@/types/chat";
import { handleAxiosError } from "@/lib/utils/errors/errorHandler";
import { AxiosError } from "axios";

type MessagesCache = { pages: Paginated<Message>[]; pageParams: unknown[] };

export default function useUpdateMessage(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateMessagePayload }) =>
      MessageService.updateMessage(id, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData<MessagesCache>(
        messageKeys.list(conversationId),
        (data) => {
          if (!data) return data;
          return {
            ...data,
            pages: data.pages.map((page) => ({
              ...page,
              data: page.data.map((m) => (m.id === updated.id ? updated : m)),
            })),
          };
        },
      );
    },
    onError: (error: AxiosError) => handleAxiosError(error),
  });
}
