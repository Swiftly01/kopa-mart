import { useQuery } from "@tanstack/react-query";
import { MessageService } from "@/services/messageService";
import { messageKeys } from "../messageKeys";
import { useAuth } from "@/context/AuthContext";

export default function useUnreadMessages() {
  const { session } = useAuth();

  return useQuery({
    queryKey: messageKeys.unread(),
    queryFn: MessageService.getUnreadCounts,
    enabled: !!session?.token,
    staleTime: 1000 * 15,
    refetchInterval: 1000 * 30,
  });
}
