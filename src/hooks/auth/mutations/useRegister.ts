import { handleAxiosError } from "@/lib/utils/errors/errorHandler";
import { AuthService } from "@/services/authService";
import { SignupData } from "@/types/auth";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { UseFormReset, UseFormSetError } from "react-hook-form";
import { toast } from "sonner";

export default function useSignup(setError: UseFormSetError<SignupData>) {
  const { mutateAsync: signup, isPending } = useMutation({
    mutationFn: AuthService.signup,
    onError: (error: AxiosError) => {
      handleAxiosError(error, setError);
    },
  });
  
  return { signup, isPending };
}
