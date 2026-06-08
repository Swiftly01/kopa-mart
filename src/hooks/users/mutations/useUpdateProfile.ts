import { UserService } from "@/services/userService";
import { User } from "@/types/user";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userKeys } from "../userKey";
import appToast from "@/lib/appToast";
import { AxiosError } from "axios";
import { handleAxiosError } from "@/lib/utils/errors/errorHandler";
import { UseFormSetError } from "react-hook-form";
import { FormValues } from "@/components/ui/editProfileModal";

export default function useUpdateProfile(
  setError: UseFormSetError<FormValues>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: UserService.updateProfile,
    onSuccess: (updatedUser) => {
      // queryClient.setQueryData<User>(userKeys.getUser(), (prev) =>
      //   prev ? { ...prev, ...updatedUser } : updatedUser,
      // );
      queryClient.invalidateQueries();
      appToast({ title: "Profile updated successfully" });
    },
    onError: (err: AxiosError) => {
      handleAxiosError(err, setError);
    },
  });
}
