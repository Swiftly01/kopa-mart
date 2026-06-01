import { User } from "@/types/user";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userKeys } from "../userKey";
import { UserService } from "@/services/userService";
import appToast from "@/lib/appToast";

export default function useUpdateAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: UserService.updateAvatar,
    onSuccess: (updatedUser) => {
      // Merge into the cached user so the UI updates instantly
      queryClient.setQueryData<User>(userKeys.getUser(), (prev) =>
        prev ? { ...prev, ...updatedUser } : updatedUser,
      );
      appToast({ title: "Profile picture updated" });
    },
    onError: () => {
      appToast({
        title: "Upload failed",
        description: "Could not update your profile picture. Please try again.",
        variant: "destructive",
      });
    },
  });
}
