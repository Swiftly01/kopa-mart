import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChatService } from "@/services/chatService";
import { chatKeys } from "../chatKeys";
import { handleAxiosError } from "@/lib/utils/errors/errorHandler";
import { AxiosError } from "axios";
import appToast from "@/lib/appToast";

export default function useDeleteConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) =>
      ChatService.deleteConversation(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.lists() });
      appToast({ title: "Conversation removed" });
    },
    onError: (error: AxiosError) => handleAxiosError(error),
  });
}
