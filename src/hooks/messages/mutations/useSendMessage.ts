import { useMutation, useQueryClient } from "@tanstack/react-query";
import { messageKeys } from "../messageKeys";
import { chatKeys } from "@/hooks/chat/chatKeys";
import { useChatSocket } from "@/context/ChatSocketContext";
import useUser from "@/hooks/users/queries/useUser";
import {
  ChatUser,
  Conversation,
  Message,
  MessageStatus,
  MessageType,
  Paginated,
  SendMessagePayload,
} from "@/types/chat";

type MessagesCache = { pages: Paginated<Message>[]; pageParams: unknown[] };
type ConversationsCache = {
  pages: Paginated<Conversation>[];
  pageParams: unknown[];
};

export default function useSendMessage() {
  const queryClient = useQueryClient();
  const { sendMessage } = useChatSocket();
  const { data: currentUser } = useUser();

  return useMutation({
    mutationFn: async (payload: SendMessagePayload & { clientId: string }) => {
      const { clientId, ...rest } = payload;
      const message = await sendMessage(rest);
      return { message, clientId };
    },

    onMutate: async (payload) => {
      await queryClient.cancelQueries({
        queryKey: messageKeys.list(payload.conversationId),
      });

      const optimisticMessage: Message = {
        id: payload.clientId,
        clientId: payload.clientId,
        conversationId: payload.conversationId,
        senderId: currentUser?.id ?? "me",
        content: payload.content ?? null,
        type: payload.type ?? MessageType.TEXT,
        status: MessageStatus.SENT,
        mediaUrl: payload.mediaUrl ?? null,
        fileName: payload.fileName ?? null,
        replyToId: payload.replyToId ?? null,
        deletedAt: null,
        isEdited: false,
        sender: (currentUser as unknown as ChatUser) ?? {
          id: "me",
          firstName: "You",
          lastName: "",
          profilePictureUrl: null,
          profilePictureThumbnailUrl: null,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        clientState: "pending",
      };

      queryClient.setQueryData<MessagesCache>(
        messageKeys.list(payload.conversationId),
        (data) => {
          if (!data) {
            return {
              pages: [
                {
                  data: [optimisticMessage],
                  meta: {
                    itemsPerPage: 30,
                    totalItems: 1,
                    currentPage: 1,
                    totalPages: 1,
                  },
                  links: { first: null, last: null, current: null },
                },
              ],
              pageParams: [1],
            };
          }

          // Retrying a failed send reuses the same clientId, so a message
          // with this id may already be sitting in the cache (the failed
          // one). Replace it in place instead of prepending a second entry
          // with the same id — otherwise React sees two list items sharing
          // a key.
          const alreadyPresent = data.pages.some((page) =>
            page.data.some((m) => m.id === payload.clientId),
          );

          if (alreadyPresent) {
            const pages = data.pages.map((page) => ({
              ...page,
              data: page.data.map((m) =>
                m.id === payload.clientId ? optimisticMessage : m,
              ),
            }));
            return { ...data, pages };
          }

          const pages = [...data.pages];
          pages[0] = {
            ...pages[0],
            data: [optimisticMessage, ...pages[0].data],
          };
          return { ...data, pages };
        },
      );

      queryClient.setQueriesData<ConversationsCache>(
        { queryKey: chatKeys.lists() },
        (data) => {
          if (!data) return data;
          const pages = data.pages.map((page) => ({
            ...page,
            data: page.data.map((conv) =>
              conv.id === payload.conversationId
                ? {
                    ...conv,
                    lastMessagePreview:
                      optimisticMessage.content ?? `[${optimisticMessage.type}]`,
                    lastMessageAt: optimisticMessage.createdAt,
                  }
                : conv,
            ),
          }));
          return { ...data, pages };
        },
      );

      return { optimisticId: payload.clientId };
    },

    onSuccess: ({ message, clientId }, payload) => {
      queryClient.setQueryData<MessagesCache>(
        messageKeys.list(payload.conversationId),
        (data) => {
          if (!data) return data;
          const pages = data.pages.map((page) => ({
            ...page,
            data: page.data.map((m) =>
              m.id === clientId ? { ...message, clientState: "sent" as const } : m,
            ),
          }));
          return { ...data, pages };
        },
      );
    },

    onError: (_error, payload) => {
      queryClient.setQueryData<MessagesCache>(
        messageKeys.list(payload.conversationId),
        (data) => {
          if (!data) return data;
          const pages = data.pages.map((page) => ({
            ...page,
            data: page.data.map((m) =>
              m.id === payload.clientId
                ? { ...m, clientState: "failed" as const }
                : m,
            ),
          }));
          return { ...data, pages };
        },
      );
    },
  });
}
