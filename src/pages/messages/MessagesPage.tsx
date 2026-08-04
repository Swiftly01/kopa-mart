import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import useConversationsInfinite from "@/hooks/chat/queries/useConversationsInfinite";
import useUnreadMessages from "@/hooks/messages/queries/useUnreadMessages";
import { useChatSocket } from "@/context/ChatSocketContext";
import { useDebounce } from "@/hooks/useDebounce";
import useUser from "@/hooks/users/queries/useUser";
import { useInfiniteScrollSentinel } from "@/hooks/notifications/useInfiniteScrollSentinel";
import { ConversationListItem } from "@/components/chat/ConversationListItem";
import { ConversationListSkeleton } from "@/components/chat/ConversationListSkeleton";
import { EmptyConversations } from "@/components/chat/EmptyConversations";
import { ConversationType } from "@/types/chat";

export default function MessagesPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const { data: currentUser } = useUser();
  const { isUserOnline } = useChatSocket();
  const { data: unreadRows } = useUnreadMessages();

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useConversationsInfinite({
    search: debouncedSearch || undefined,
    // Deliberately not passing sortOrder: the backend only applies an
    // explicit ORDER BY when sortOrder is *absent* (its own fallback sorts
    // by lastMessageAt DESC); passing a value here actually turns that
    // fallback off without a working substitute; see
    // CHAT_INTEGRATION_ANALYSIS.md.
  });

  const sentinelRef = useInfiniteScrollSentinel({
    onIntersect: () => fetchNextPage(),
    enabled: !!hasNextPage && !isFetchingNextPage,
  });

  const unreadByConversation = useMemo(() => {
    const map = new Map<string, number>();
    unreadRows?.forEach((row) => map.set(row.conversationId, row.unreadCount));
    return map;
  }, [unreadRows]);

  const conversations = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data],
  );

  return (
    <div className="flex flex-col min-h-screen">
      <div className="sticky top-0 z-10 px-4 pt-4 pb-2 border-b border-border bg-background/95 backdrop-blur-lg">
        <h1 className="mb-3 text-2xl font-bold text-foreground">Messages</h1>
        <div className="relative">
          <Search className="absolute -translate-y-1/2 left-3 top-1/2 size-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations"
            className="w-full h-11 pl-10 pr-9 text-sm rounded-full bg-muted/60 border border-transparent focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/40"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute -translate-y-1/2 right-3 top-1/2 text-muted-foreground"
              aria-label="Clear search"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 divide-y divide-border/60">
        {isLoading && <ConversationListSkeleton />}

        {isError && (
          <div className="px-6 py-16 text-center text-sm text-muted-foreground">
            Couldn't load your conversations. Pull to refresh or try again shortly.
          </div>
        )}

        {!isLoading && !isError && conversations.length === 0 && (
          <EmptyConversations searching={!!debouncedSearch} />
        )}

        {conversations.map((conversation) => {
          const isGroup = conversation.type === ConversationType.GROUP;
          const other = conversation.participants.find(
            (p) => p.userId !== currentUser?.id,
          );
          return (
            <ConversationListItem
              key={conversation.id}
              conversation={conversation}
              currentUserId={currentUser?.id}
              isOnline={!isGroup && !!other && isUserOnline(other.userId)}
              unreadCount={unreadByConversation.get(conversation.id) ?? 0}
            />
          );
        })}

        <div ref={sentinelRef} className="h-1" />
        {isFetchingNextPage && <ConversationListSkeleton rows={2} />}
      </div>
    </div>
  );
}
