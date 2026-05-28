import { useQuery } from "@tanstack/react-query";
import { adminUserKeys } from "../adminUserkeys";
import { AdminUserService } from "@/services/adminUserService";
import { User } from "@/types/user";

 
export default function useUserDetail(
  userId: string,
  options?: { initialData?: User },
) {
  return useQuery({
    queryKey: adminUserKeys.byId(userId),
    queryFn: () => AdminUserService.getUserById(userId),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    initialData: options?.initialData,
    enabled: !!userId,
  });
}
 