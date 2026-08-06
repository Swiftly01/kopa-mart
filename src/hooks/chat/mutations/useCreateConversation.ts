import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChatService } from "@/services/chatService";
import { chatKeys } from "../chatKeys";
import { CreateConversationPayload } from "@/types/chat";
import { handleAxiosError } from "@/lib/utils/errors/errorHandler";
import { AxiosError } from "axios";

export default function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateConversationPayload) =>
      ChatService.createConversation(payload),
    onSuccess: (conversation) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.lists() });
      // Note: when this call resolves to an *existing* direct conversation,
      // the backend's lookup query (`findExistingDirectConversation`) joins
      // `participants` for filtering only and doesn't select the relation,
      // so `conversation.participants` can come back empty here even though
      // the conversation itself has participants. Invalidate rather than
      // trust this payload so the chat room always refetches the fully
      // hydrated version via `GET /conversations/:id` (which does eager-load
      // participants) instead of rendering from a partial object.
      queryClient.invalidateQueries({ queryKey: chatKeys.detail(conversation.id) });
    },
    onError: (error: AxiosError) => handleAxiosError(error),
  });
}
