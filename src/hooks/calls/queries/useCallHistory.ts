import { useInfiniteQuery } from "@tanstack/react-query";
import { CallService } from "@/services/callService";
import { callKeys } from "../callKeys";
import { CallHistoryQueryParams } from "@/types/chat";

export default function useCallHistory(
  params: Omit<CallHistoryQueryParams, "page"> = {},
) {
  return useInfiniteQuery({
    queryKey: callKeys.history(params),
    queryFn: ({ pageParam = 1 }) =>
      CallService.getCallHistory({ ...params, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage.meta;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    staleTime: 1000 * 60,
  });
}
