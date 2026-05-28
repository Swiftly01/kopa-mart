import { AuthService } from "@/services/authService";
import { ForgotPasswordData } from "@/types/auth";
import { useMutation } from "@tanstack/react-query";
import { authKeys } from "../keys";

export default function useForgotPassword() {
  const mutation = useMutation({
    mutationKey: authKeys.forgotPassword(),
    mutationFn: (data: ForgotPasswordData) => AuthService.forgotPassword(data),
  });

  return {
    forgotPassword: mutation.mutate,
    isPending: mutation.isPending,
  };
}
