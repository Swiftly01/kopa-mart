import { useMutation } from "@tanstack/react-query";
import React from "react";
import { authKeys } from "../keys";
import { AuthService } from "@/services/authService";
import { VerifyEmailData } from "@/types/auth";

export default function useVerifyEmail() {
  const {
    mutate: verifyEmail,
    isPending: isVerifying,
    isSuccess,
    isError,
  } = useMutation({
    mutationKey: authKeys.verifyEmail(),
    mutationFn: (data: VerifyEmailData) => AuthService.verifyEmail(data),
  });

  return { verifyEmail, isVerifying, isSuccess, isError };
}
