import { useQuery } from "@tanstack/react-query";
import { ChatService } from "@/services/chatService";
import { chatKeys } from "../chatKeys";

export default function useConversation(conversationId?: string) {
  return useQuery({
    queryKey: chatKeys.detail(conversationId ?? ""),
    queryFn: () => ChatService.getConversation(conversationId as string),
    enabled: !!conversationId,
    staleTime: 1000 * 30,
  });
}
