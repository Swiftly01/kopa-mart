import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useResetPassword from "@/hooks/auth/mutations/useResetPassword";
import { toast } from "@/hooks/use-toast";
import appToast from "@/lib/appToast";
import { handleAxiosError } from "@/lib/utils/errors/errorHandler";

import { useStore } from "@/store/useStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { CheckCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordForm() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const email = params.get("email");
  const token = params.get("token");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const { resetPassword, isPending } = useResetPassword();

  const onSubmit = (data: ResetPasswordSchema) => {
    if (!email || !token) return;
    const payload = {
      token,
      email,
      newPassword: data.password,
    };

    resetPassword(payload, {
      onSuccess: () => {
        appToast({
          title: "Reset password",
          description: "Password reset successfully",
        });

        navigate("/login");
      },
      onError: (error: AxiosError) => {
        handleAxiosError(error, setError);
      },
    });
  };

  return (
    <div className="py-24 bg-gradient-soft flex flex-col items-center justify-center px-5">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <div className="mx-auto size-16 rounded-full bg-success/15 flex items-center justify-center mb-4">
            <CheckCircle className="size-8 text-success" />
          </div>
          <h1 className="text-2xl font-bold mb-1">Create New Password</h1>
          <p className="text-sm text-muted-foreground">
            Enter your new password below.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>New password</Label>
            <Input type="password" {...register("password")} />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div>
            <Label>Confirm password</Label>
            <Input type="password" {...register("confirmPassword")} />
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            disabled={isPending}
            className="w-full h-12 bg-gradient-primary"
          >
            {isPending ? "Updating password" : "Update password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
