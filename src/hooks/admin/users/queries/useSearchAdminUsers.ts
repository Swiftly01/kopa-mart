import { AdminUserService } from "@/services/adminUserService";
import { useQuery } from "@tanstack/react-query";

export default function useSearchAdminUsers(search: string, enabled = true) {
  return useQuery({
    queryKey: ["admin", "users", "search", search],
    queryFn: () => AdminUserService.searchUsers(search),
    enabled,
    staleTime: 60 * 1000,
  });
}
