import { UserRoleEnum } from "@/types/user";
import { useQuery } from "@tanstack/react-query";
import { adminUserKeys } from "../adminUserkeys";
import { AdminUserService } from "@/services/adminUserService";

export default function useAllUsers(
  page: number = 1,
  limit: number = 10,
  role: UserRoleEnum = UserRoleEnum.BUYER,
) {
   return useQuery({
    queryKey: adminUserKeys.byStatusPaginated(page, limit, role),
    queryFn: () =>
      AdminUserService.getUsers(page, limit, role),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    placeholderData: (prev) => prev,
  });
}
