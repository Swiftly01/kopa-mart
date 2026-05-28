import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import useForgotPassword from "@/hooks/auth/mutations/useForgotPassword";
import appToast from "@/lib/appToast";
import { handleAxiosError } from "@/lib/utils/errors/errorHandler";
import { AxiosError } from "axios";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordRequestForm() {
  const navigate = useNavigate();
  const { forgotPassword, isPending } = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = (data: ForgotPasswordData) => {
    forgotPassword(data, {
      onSuccess: () => {
        appToast({
          title: "Forgot password",
          description: "Reset password link has been sent to your email",
        });
        navigate(`/forgot?step=check&email=${data.email}`);
      },
      onError: (err: AxiosError) => {
        handleAxiosError(err);
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-soft flex flex-col items-center justify-center px-5 py-10">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-1">Forgot Password?</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email address and we'll send you a reset link.
          </p>
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full max-w-md space-y-4"
        >
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="you@example.com"
              {...register("email", { required: "Email is required" })}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <Button
            disabled={isPending}
            className="w-full h-12 bg-gradient-primary"
          >
            {isPending ? "Sending reset link" : "Send Reset Link"}
          </Button>
        </form>
      </div>
    </div>
  );
}
