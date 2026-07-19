import { NotificationService } from "@/services/notificationService";
import { useInfiniteQuery } from "@tanstack/react-query";
import { notificationKeys } from "../notificationKey";

const PAGE_SIZE = 20;


export default function useNotificationsInfinite() {
  return useInfiniteQuery({
    queryKey: notificationKeys.list(),
    queryFn: ({ pageParam }) =>
      NotificationService.getNotifications({
        page: pageParam,
        limit: PAGE_SIZE,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage.meta;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    staleTime: 60 * 1000,
  });
}
