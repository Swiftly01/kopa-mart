import { AdminUserService } from "@/services/adminUserService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminUserKeys } from "../adminUserkeys";
import { User } from "@/types/user";



export const useChangeUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      newRole,
    }: {
      userId: string;
      newRole: "buyer" | "admin" | "superadmin";
    }): Promise<User> => {
      return AdminUserService.changeUserRole(userId, newRole);
    },

    onSuccess: (updatedUser, { userId }) => {
      queryClient.setQueryData(adminUserKeys.byId(userId), updatedUser);

      queryClient.invalidateQueries({
        queryKey: adminUserKeys.all,
      });
    },
  });
};
