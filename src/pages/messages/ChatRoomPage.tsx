import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useConversation from "@/hooks/chat/queries/useConversation";
import useMessagesInfinite from "@/hooks/messages/queries/useMessagesInfinite";
import useSendMessage from "@/hooks/messages/mutations/useSendMessage";
import useUpdateMessage from "@/hooks/messages/mutations/useUpdateMessage";
import useDeleteMessage from "@/hooks/messages/mutations/useDeleteMessage";
import useMarkConversationRead from "@/hooks/chat/mutations/useMarkConversationRead";
import useDeleteConversation from "@/hooks/chat/mutations/useDeleteConversation";
import { useChatSocket } from "@/context/ChatSocketContext";
import { useCall } from "@/context/CallContext";
import useUser from "@/hooks/users/queries/useUser";
import { useInfiniteScrollSentinel } from "@/hooks/notifications/useInfiniteScrollSentinel";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { DateSeparator } from "@/components/chat/DateSeparator";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { MessageSkeleton } from "@/components/chat/MessageSkeleton";
import { EmptyChat } from "@/components/chat/EmptyChat";
import { MessageInput } from "@/components/chat/MessageInput";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { isSameDay } from "@/components/chat/chatDateUtils";
import { CallType, ConversationType, Message } from "@/types/chat";
import appToast from "@/lib/appToast";
import SignInPrompt from "@/components/SignInPrompt";

export default function ChatRoomPage() {
  const { conversationId = "" } = useParams();
  const navigate = useNavigate();
  const { data: currentUser } = useUser();
  const {
    joinConversation,
    leaveConversation,
    isUserOnline,
    typingUsersByConversation,
    markRead,
  } = useChatSocket();
  const { startCall, isBusy } = useCall();

  const { data: conversation, isLoading: loadingConversation } =
    useConversation(conversationId);
  const {
    messages,
    isLoading: loadingMessages,
    isError: messagesError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMessagesInfinite(conversationId);

  const sendMessage = useSendMessage();
  const updateMessage = useUpdateMessage(conversationId);
  const deleteMessage = useDeleteMessage(conversationId);
  const markConversationRead = useMarkConversationRead();
  const deleteConversation = useDeleteConversation();

  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const shouldStickToBottom = useRef(true);

  const topSentinelRef = useInfiniteScrollSentinel({
    onIntersect: () => fetchNextPage(),
    enabled: !!hasNextPage && !isFetchingNextPage,
    rootMargin: "300px",
  });

  useEffect(() => {
    if (!conversationId) return;
    joinConversation(conversationId);
    markRead(conversationId);
    markConversationRead.mutate(conversationId);
    return () => leaveConversation(conversationId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  // Auto-scroll to the newest message when the thread first loads or grows,
  // but only if the user was already near the bottom (so scrolling up to
  // read history doesn't get yanked back down by an incoming message).
  useEffect(() => {
    if (shouldStickToBottom.current) {
      bottomRef.current?.scrollIntoView({ block: "end" });
    }
  }, [messages.length]);

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    shouldStickToBottom.current = distanceFromBottom < 120;
  };

  const messagesById = useMemo(() => {
    const map = new Map<string, Message>();
    messages.forEach((m) => map.set(m.id, m));
    return map;
  }, [messages]);

  const otherParticipant = conversation?.participants?.find(
    (p) => p.userId !== currentUser?.id,
  )?.user;

  const typingUsers = (typingUsersByConversation[conversationId] ?? []).filter(
    (u) => u.userId !== currentUser?.id,
  );

  const handleRetry = (message: Message) => {
    sendMessage.mutate({
      clientId: message.clientId ?? message.id,
      conversationId,
      content: message.content ?? undefined,
      type: message.type,
      mediaUrl: message.mediaUrl ?? undefined,
      fileName: message.fileName ?? undefined,
      replyToId: message.replyToId ?? undefined,
    });
  };

  const handleDeleteConversation = () => {
    setConfirmDelete(false);
    deleteConversation.mutate(conversationId, {
      onSuccess: () => navigate("/messages"),
    });
  };

  if (!currentUser) return <SignInPrompt />;

  if (loadingConversation) {
    return (
      <div className="flex flex-col h-[100dvh]">
        <div className="h-[57px] border-b border-border" />
        <MessageSkeleton />
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex flex-col items-center justify-center h-[100dvh] gap-3 px-6 text-center">
        <p className="font-medium text-foreground">Conversation not found</p>
        <button
          onClick={() => navigate("/messages")}
          className="text-sm text-primary"
        >
          Back to messages
        </button>
      </div>
    );
  }

  const isGroup = conversation.type === ConversationType.GROUP;
  const threadTitle = isGroup
    ? conversation.name || "Group chat"
    : otherParticipant
      ? `${otherParticipant.firstName} ${otherParticipant.lastName}`.trim()
      : "Conversation";

  return (
    <div className="flex flex-col h-[100dvh] bg-background">
      <ChatHeader
        conversation={conversation}
        currentUserId={currentUser?.id}
        isOnline={
          !isGroup && !!otherParticipant && isUserOnline(otherParticipant.id)
        }
        typingLabel={
          typingUsers.length > 0
            ? `${typingUsers[0].userName} is typing…`
            : undefined
        }
        callDisabled={isBusy}
        onStartCall={(type) => {
          if (isGroup) {
            appToast({
              title: "Group calling isn't supported",
              description: "Calls currently only work between two people.",
            });
            return;
          }
          if (!otherParticipant) return;
          void startCall(
            otherParticipant.id,
            `${otherParticipant.firstName} ${otherParticipant.lastName}`.trim(),
            type === "video" ? CallType.VIDEO : CallType.VOICE,
            conversationId,
          );
        }}
        onDelete={() => setConfirmDelete(true)}
      />

      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 overflow-y-auto"
      >
        <div ref={topSentinelRef} />
        {isFetchingNextPage && <MessageSkeleton />}

        {loadingMessages && <MessageSkeleton />}

        {messagesError && (
          <p className="px-6 py-8 text-sm text-center text-muted-foreground">
            Couldn't load messages. Try reopening the conversation.
          </p>
        )}

        {!loadingMessages && messages.length === 0 && (
          <EmptyChat
            name={threadTitle}
            avatarUrl={
              otherParticipant?.profilePictureThumbnailUrl ||
              otherParticipant?.profilePictureUrl ||
              undefined
            }
          />
        )}

        <div className="pb-2">
          {messages.map((message, index) => {
            const prev = messages[index - 1];
            const next = messages[index + 1];
            const isOwn = message.senderId === currentUser?.id;

            const showDateSeparator =
              !prev || !isSameDay(prev.createdAt, message.createdAt);
            const isFirstInGroup =
              !prev ||
              prev.senderId !== message.senderId ||
              !isSameDay(prev.createdAt, message.createdAt);
            const isLastInGroup =
              !next ||
              next.senderId !== message.senderId ||
              !isSameDay(next.createdAt, message.createdAt);

            return (
              <div key={message.id}>
                {showDateSeparator && <DateSeparator iso={message.createdAt} />}
                <MessageBubble
                  message={message}
                  isOwn={isOwn}
                  showAvatar={isLastInGroup}
                  showSenderName={isGroup}
                  isFirstInGroup={isFirstInGroup}
                  isLastInGroup={isLastInGroup}
                  repliedMessage={
                    message.replyToId
                      ? messagesById.get(message.replyToId)
                      : undefined
                  }
                  onReply={setReplyTo}
                  onEdit={(m) =>
                    updateMessage.mutate({
                      id: m.id,
                      payload: { content: m.content ?? "" },
                    })
                  }
                  onDelete={(m) => deleteMessage.mutate(m.id)}
                  onRetry={handleRetry}
                />
              </div>
            );
          })}

          {typingUsers.length > 0 && (
            <TypingIndicator
              label={
                isGroup ? `${typingUsers[0].userName} is typing…` : undefined
              }
            />
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <MessageInput
        conversationId={conversationId}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
      />

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isGroup ? "Delete this conversation?" : "Delete this chat?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isGroup
                ? "This deletes the group conversation for everyone. This can't be undone."
                : "This removes the conversation from your inbox. The other person will still see their side."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={handleDeleteConversation}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
