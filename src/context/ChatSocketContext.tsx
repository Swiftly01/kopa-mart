import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./AuthContext";
import { getChatSocket, disconnectAllSockets } from "@/lib/socket/socketManager";
import { chatKeys } from "@/hooks/chat/chatKeys";
import { messageKeys } from "@/hooks/messages/messageKeys";
import useUser from "@/hooks/users/queries/useUser";
import {
  ChatStatus,
  Conversation,
  Message,
  Paginated,
  SendMessagePayload,
} from "@/types/chat";
import { MessageService } from "@/services/messageService";

interface TypingUser {
  userId: string;
  userName: string;
}

interface ChatSocketContextValue {
  connected: boolean;
  onlineUsers: Set<string>;
  isUserOnline: (userId: string) => boolean;
  typingUsersByConversation: Record<string, TypingUser[]>;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  sendMessage: (payload: SendMessagePayload) => Promise<Message>;
  startTyping: (conversationId: string) => void;
  stopTyping: (conversationId: string) => void;
  markRead: (conversationId: string) => void;
}

const ChatSocketContext = createContext<ChatSocketContextValue | undefined>(
  undefined,
);

export function ChatSocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session } = useAuth();
  const { data: currentUser } = useUser();
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [typingUsersByConversation, setTypingUsersByConversation] = useState<
    Record<string, TypingUser[]>
  >({});
  const typingTimeouts = useRef<Record<string, NodeJS.Timeout>>({});

  useEffect(() => {
    if (!session?.token) {
      disconnectAllSockets();
      socketRef.current = null;
      setConnected(false);
      return;
    }

    const socket = getChatSocket(session.token);
    socketRef.current = socket;

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    const onNewMessage = (message: Message) => {
      // The server's `send_message` handler broadcasts to the whole
      // conversation room via `server.to(room)`, which — unlike the
      // `client.broadcast.to(room)` used elsewhere in the gateway —
      // includes the sender's own socket. So when *we* send a message we
      // get it twice: once as the resolved value of our own `sendMessage()`
      // call (handled by useSendMessage's optimistic-reconcile), and again
      // right here as this room broadcast. Skip the cache insert for our
      // own messages entirely so the two paths can't race and produce a
      // duplicate entry with the same id.
      if (message.senderId === currentUser?.id) {
        queryClient.invalidateQueries({ queryKey: messageKeys.unread() });
        return;
      }

      // Append to the message thread cache if it's currently loaded.
      queryClient.setQueryData(
        messageKeys.list(message.conversationId),
        (data: { pages: Paginated<Message>[]; pageParams: unknown[] } | undefined) => {
          if (!data) return data;
          const alreadyExists = data.pages.some((page) =>
            page.data.some((m) => m.id === message.id),
          );
          if (alreadyExists) return data;

          const pages = [...data.pages];
          // Page 0 holds the newest messages (API is newest-first).
          pages[0] = { ...pages[0], data: [message, ...pages[0].data] };
          return { ...data, pages };
        },
      );

      // Bump the conversation's preview + ordering in the list cache.
      queryClient.setQueriesData(
        { queryKey: chatKeys.lists() },
        (data: { pages: Paginated<Conversation>[]; pageParams: unknown[] } | undefined) => {
          if (!data) return data;
          let found = false;
          const pages = data.pages.map((page) => ({
            ...page,
            data: page.data.map((conv) => {
              if (conv.id !== message.conversationId) return conv;
              found = true;
              return {
                ...conv,
                lastMessagePreview: message.content ?? `[${message.type}]`,
                lastMessageAt: message.createdAt,
                lastMessageMediaUrl: message.mediaUrl,
                lastMessageFileName: message.fileName,
                lastMessageType: message.type,
              };
            }),
          }));
          if (!found) return data;
          return { ...data, pages };
        },
      );

      queryClient.invalidateQueries({ queryKey: messageKeys.unread() });
    };

    const onStatusChanged = (data: { userId: string; status: string }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        if (data.status === ChatStatus.ONLINE) next.add(data.userId);
        else next.delete(data.userId);
        return next;
      });
    };

    const onUserTyping = (data: {
      conversationId: string;
      userId: string;
      userName: string;
    }) => {
      setTypingUsersByConversation((prev) => {
        const existing = prev[data.conversationId] ?? [];
        if (existing.some((u) => u.userId === data.userId)) return prev;
        return {
          ...prev,
          [data.conversationId]: [
            ...existing,
            { userId: data.userId, userName: data.userName },
          ],
        };
      });

      const timeoutKey = `${data.conversationId}:${data.userId}`;
      clearTimeout(typingTimeouts.current[timeoutKey]);
      typingTimeouts.current[timeoutKey] = setTimeout(() => {
        setTypingUsersByConversation((prev) => ({
          ...prev,
          [data.conversationId]: (prev[data.conversationId] ?? []).filter(
            (u) => u.userId !== data.userId,
          ),
        }));
      }, 6000);
    };

    const onUserStoppedTyping = (data: {
      conversationId: string;
      userId: string;
    }) => {
      setTypingUsersByConversation((prev) => ({
        ...prev,
        [data.conversationId]: (prev[data.conversationId] ?? []).filter(
          (u) => u.userId !== data.userId,
        ),
      }));
    };

    const onReadReceipt = (data: {
      conversationId: string;
      userId: string;
      readAt: string;
    }) => {
      // Surfaced to consumers via query invalidation; message-level read
      // status is derived from participant.lastReadAt on next refetch.
      queryClient.invalidateQueries({
        queryKey: chatKeys.detail(data.conversationId),
      });
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("new_message", onNewMessage);
    socket.on("user_status_changed", onStatusChanged);
    socket.on("user_typing", onUserTyping);
    socket.on("user_stopped_typing", onUserStoppedTyping);
    socket.on("read_receipt", onReadReceipt);

    if (socket.connected) setConnected(true);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("new_message", onNewMessage);
      socket.off("user_status_changed", onStatusChanged);
      socket.off("user_typing", onUserTyping);
      socket.off("user_stopped_typing", onUserStoppedTyping);
      socket.off("read_receipt", onReadReceipt);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.token, currentUser?.id]);

  const joinConversation = useCallback((conversationId: string) => {
    socketRef.current?.emit("join_conversation", { conversationId });
  }, []);

  const leaveConversation = useCallback((conversationId: string) => {
    socketRef.current?.emit("leave_conversation", { conversationId });
  }, []);

  const startTyping = useCallback((conversationId: string) => {
    socketRef.current?.emit("typing_start", { conversationId });
  }, []);

  const stopTyping = useCallback((conversationId: string) => {
    socketRef.current?.emit("typing_stop", { conversationId });
  }, []);

  const markRead = useCallback((conversationId: string) => {
    socketRef.current?.emit("message_read", { conversationId });
  }, []);

  const sendMessage = useCallback(
    (payload: SendMessagePayload): Promise<Message> => {
      const socket = socketRef.current;

      // Realtime broadcast to other participants only happens via the
      // socket path (see chat.gateway.ts `send_message`) — the REST
      // POST /messages endpoint persists but never emits. We prefer the
      // socket so the other side gets it instantly, and fall back to REST
      // only when the socket is disconnected (message still saves, but the
      // peer won't see it until they reload / reconnect and refetch).
      if (socket && socket.connected) {
        return new Promise<Message>((resolve, reject) => {
          socket.emit("send_message", payload, (response: Message | { message?: string }) => {
            if (response && "id" in response) {
              resolve(response as Message);
            } else {
              reject(
                new Error(
                  (response as { message?: string })?.message ??
                    "Failed to send message",
                ),
              );
            }
          });
        });
      }

      return MessageService.sendMessage(payload);
    },
    [],
  );

  const isUserOnline = useCallback(
    (userId: string) => onlineUsers.has(userId),
    [onlineUsers],
  );

  const value = useMemo<ChatSocketContextValue>(
    () => ({
      connected,
      onlineUsers,
      isUserOnline,
      typingUsersByConversation,
      joinConversation,
      leaveConversation,
      sendMessage,
      startTyping,
      stopTyping,
      markRead,
    }),
    [
      connected,
      onlineUsers,
      isUserOnline,
      typingUsersByConversation,
      joinConversation,
      leaveConversation,
      sendMessage,
      startTyping,
      stopTyping,
      markRead,
    ],
  );

  return (
    <ChatSocketContext.Provider value={value}>
      {children}
    </ChatSocketContext.Provider>
  );
}

export function useChatSocket() {
  const context = useContext(ChatSocketContext);
  if (context === undefined) {
    throw new Error("useChatSocket must be used within a ChatSocketProvider");
  }
  return context;
}
