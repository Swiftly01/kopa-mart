import { useMutation } from "@tanstack/react-query";
import React from "react";
import { authKeys } from "../keys";
import { AuthService } from "@/services/authService";
import { LoginData } from "@/types/auth";

export default function useLogin() {
  const mutation = useMutation({
    mutationKey: authKeys.currentUser(),
    mutationFn: (data: LoginData) => AuthService.login(data),
  });

  return { logIn: mutation.mutate, isLoggingIn: mutation.isPending };
}
