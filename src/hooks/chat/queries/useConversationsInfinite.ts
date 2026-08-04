import { useInfiniteQuery } from "@tanstack/react-query";
import { ChatService } from "@/services/chatService";
import { chatKeys } from "../chatKeys";
import { ConversationQueryParams } from "@/types/chat";
import { useAuth } from "@/context/AuthContext";

export default function useConversationsInfinite(
  params: Omit<ConversationQueryParams, "page"> = {},
) {
  const { session } = useAuth();

  return useInfiniteQuery({
    queryKey: chatKeys.list(params),
    queryFn: ({ pageParam = 1 }) =>
      ChatService.getConversations({ ...params, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage.meta;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    enabled: !!session?.token,
    staleTime: 1000 * 30,
  });
}
