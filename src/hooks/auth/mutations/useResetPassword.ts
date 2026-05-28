import { useMutation } from "@tanstack/react-query";
import React from "react";
import { authKeys } from "../keys";
import { AuthService } from "@/services/authService";
import { ResetPasswordData } from "@/types/auth";

export default function useResetPassword() {
  const mutation = useMutation({
    mutationKey: authKeys.resetPassword(),
    mutationFn: (data: ResetPasswordData) => AuthService.resetPassword(data),
  });

  return {
    resetPassword: mutation.mutate,
    isPending: mutation.isPending,
  };
}
