import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageService } from "@/services/messageService";
import { messageKeys } from "../messageKeys";
import { Message, Paginated } from "@/types/chat";
import { handleAxiosError } from "@/lib/utils/errors/errorHandler";
import { AxiosError } from "axios";

type MessagesCache = { pages: Paginated<Message>[]; pageParams: unknown[] };

export default function useDeleteMessage(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => MessageService.deleteMessage(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({
        queryKey: messageKeys.list(conversationId),
      });
      queryClient.setQueryData<MessagesCache>(
        messageKeys.list(conversationId),
        (data) => {
          if (!data) return data;
          return {
            ...data,
            pages: data.pages.map((page) => ({
              ...page,
              data: page.data.map((m) =>
                m.id === id
                  ? { ...m, content: null, mediaUrl: null, deletedAt: new Date().toISOString() }
                  : m,
              ),
            })),
          };
        },
      );
    },
    onError: (error: AxiosError) => handleAxiosError(error),
  });
}
