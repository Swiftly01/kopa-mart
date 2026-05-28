import { AuthService } from "@/services/authService";
import { useMutation } from "@tanstack/react-query";
import React from "react";
import { authKeys } from "../keys";

export default function useResendEmailLink() {
  const { mutate: resendLink, isPending } = useMutation({
    mutationKey: authKeys.resendEmail(),
    mutationFn: (email: string) => AuthService.resendEmailLink(email),
  });

  return { resendLink, isPending };
}
