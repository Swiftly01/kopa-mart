import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChatService } from "@/services/chatService";
import { messageKeys } from "@/hooks/messages/messageKeys";
import { UnreadCountRow } from "@/types/chat";

export default function useMarkConversationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) =>
      ChatService.markConversationRead(conversationId),
    onMutate: async (conversationId: string) => {
      await queryClient.cancelQueries({ queryKey: messageKeys.unread() });
      const previous = queryClient.getQueryData<UnreadCountRow[]>(
        messageKeys.unread(),
      );

      queryClient.setQueryData<UnreadCountRow[]>(
        messageKeys.unread(),
        (rows) =>
          (rows ?? []).map((row) =>
            row.conversationId === conversationId
              ? { ...row, unreadCount: 0 }
              : row,
          ),
      );

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(messageKeys.unread(), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.unread() });
    },
  });
}
