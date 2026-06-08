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
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
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
      newPassword: data.newPassword,
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
        console.log(error.response);
        handleAxiosError(error, setError);
      },
    });
  };

  return (
    <div className="flex flex-col items-center justify-center px-5 py-24 bg-gradient-soft">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center mx-auto mb-4 rounded-full size-16 bg-success/15">
            <CheckCircle className="size-8 text-success" />
          </div>
          <h1 className="mb-1 text-2xl font-bold">Create New Password</h1>
          <p className="text-sm text-muted-foreground">
            Enter your new password below.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>New password</Label>
            <Input type="password" {...register("newPassword")} />
            {errors.newPassword && (
              <p className="text-sm text-red-500">
                {errors.newPassword.message}
              </p>
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
