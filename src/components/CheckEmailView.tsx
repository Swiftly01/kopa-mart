import { Button } from "@/components/ui/button";
import useForgotPassword from "@/hooks/auth/mutations/useForgotPassword";
import appToast from "@/lib/appToast";
import { handleAxiosError } from "@/lib/utils/errors/errorHandler";
import { AxiosError } from "axios";
import { Loader2, Mail } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function CheckEmailView() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const email = params.get("email");

  const { forgotPassword, isPending } = useForgotPassword();

  function handleResend() {
    if (!email) return;

    forgotPassword(
      { email },
      {
        onSuccess: () => {
          appToast({
            title: "Resend link",
            description: "Password reset link sent successfully",
          });
        },
        onError: (err: AxiosError) => {
          handleAxiosError(err);
        },
      },
    );
  }

  return (
    <div className="min-h-screen bg-gradient-soft flex flex-col items-center justify-center px-5 py-10">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto size-20 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
          <Mail className="size-10 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">Check Your Email</h1>
        <p className="text-sm text-muted-foreground">
          We've sent a password reset link to{" "}
          <strong className="text-foreground">{email}</strong>
        </p>
        <div className="card-listing p-5 text-left space-y-3">
          <p className="font-semibold text-sm">What to do next:</p>
          {[
            "Open your email inbox",
            "Find the email from Kopa Marketplace",
            'Click the "Reset Password" link',
            "Create a new password",
          ].map((t, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="size-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <p className="text-sm text-muted-foreground pt-0.5">{t}</p>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">
          Didn't get the email? Check spam or{" "}
          <button
            disabled={isPending}
            onClick={handleResend}
            className="text-primary font-medium inline-flex items-center gap-2 disabled:opacity-50"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isPending ? "Sending..." : "Resend"}
          </button>
        </p>
      </div>
    </div>
  );
}
