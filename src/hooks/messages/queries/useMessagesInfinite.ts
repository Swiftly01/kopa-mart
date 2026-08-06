import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { MessageService } from "@/services/messageService";
import { messageKeys } from "../messageKeys";
import { Message } from "@/types/chat";

/**
 * The backend returns messages newest-first, one page of `limit` at a time.
 * Page 1 = latest messages, page 2 = the ones before that, etc. — perfect for
 * an infinite-scroll-upward chat thread. This hook fetches with that
 * pagination but hands back messages in chronological (oldest → newest)
 * order, ready to render top-to-bottom.
 */
export default function useMessagesInfinite(conversationId?: string) {
  const query = useInfiniteQuery({
    queryKey: messageKeys.list(conversationId ?? ""),
    queryFn: ({ pageParam = 1 }) =>
      MessageService.getMessages(conversationId as string, {
        page: pageParam as number,
        limit: 30,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage.meta;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    enabled: !!conversationId,
    staleTime: 1000 * 30,
  });

  const messages = useMemo<Message[]>(() => {
    if (!query.data) return [];
    // Pages come back newest-first; reverse each page then reverse page
    // order so the final array is oldest → newest overall.
    return [...query.data.pages]
      .reverse()
      .flatMap((page) => [...page.data].reverse());
  }, [query.data]);

  return { ...query, messages };
}
