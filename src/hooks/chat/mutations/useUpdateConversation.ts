import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChatService } from "@/services/chatService";
import { chatKeys } from "../chatKeys";
import { UpdateConversationPayload } from "@/types/chat";
import { handleAxiosError } from "@/lib/utils/errors/errorHandler";
import { AxiosError } from "axios";

export default function useUpdateConversation(conversationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateConversationPayload) =>
      ChatService.updateConversation(conversationId, payload),
    onSuccess: (conversation) => {
      queryClient.setQueryData(chatKeys.detail(conversationId), conversation);
      queryClient.invalidateQueries({ queryKey: chatKeys.lists() });
    },
    onError: (error: AxiosError) => handleAxiosError(error),
  });
}
