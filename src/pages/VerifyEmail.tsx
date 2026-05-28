import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Mail, ArrowRight, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import useResendEmailLink from "@/hooks/auth/mutations/useResendEmailLink";
import useVerifyEmail from "@/hooks/auth/mutations/useVerifyEmail";
import appToast from "@/lib/appToast";
import { AxiosError } from "axios";
import { handleAxiosError } from "@/lib/utils/errors/errorHandler";
import { VerifyEmailResponse } from "@/types/auth";

const VerifyEmail = () => {
  const [params] = useSearchParams();
  const email = params.get("email") ?? "";
  const token = params.get("token");
  const navigate = useNavigate();

  const { verifyEmail, isVerifying, isSuccess } = useVerifyEmail();
  const { resendLink, isPending: isResending } = useResendEmailLink();

  const [countDown, setCoutDown] = useState(5);

  useEffect(() => {
    if (!email || !token) return;

    verifyEmail(
      { email, token },
      {
        onSuccess: (res: VerifyEmailResponse) => {
          appToast({
            title: "Email Verified",
            description: res.message,
          });

          navigate("/login");
        },

        onError: (err: AxiosError) => {
          handleAxiosError(err);
        },
      },
    );
  }, [email, token, verifyEmail, navigate]);

  useEffect(() => {
    if (!isSuccess) return;

    if (countDown <= 0) {
      navigate("/login");
    }

    const timer = setTimeout(() => {
      setCoutDown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isSuccess, countDown, navigate]);

  function handleResend() {
    if (!email) return;

    resendLink(email, {
      onSuccess: () => {
        appToast({
          title: "Email Sent",
          description: "Verification link sent successfully",
        });

        setCoutDown(10);
      },

      onError: (err: AxiosError) => {
        handleAxiosError(err);
      },
    });
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <CheckCircle className="size-12 text-success mx-auto" />

          <h1 className="text-xl font-bold">Email Verified!</h1>

          <p className="text-sm text-muted-foreground">
            Redirecting to sign in in{" "}
            <span className="font-semibold text-foreground">{countDown}</span>{" "}
            seconds...
          </p>

          <Button onClick={() => navigate("/signin")}>Go now</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-soft flex flex-col items-center justify-center px-5 py-10">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto size-20 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
          <Mail className="size-10 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">Verify Your Email</h1>
        <p className="text-sm text-muted-foreground">
          We've sent a verification link to{" "}
          <strong className="text-foreground">{email}</strong>
        </p>

        <div className="card-listing p-5 text-left space-y-4">
          <p className="font-semibold text-sm">How to verify:</p>
          <div className="space-y-3">
            {[
              {
                step: "1",
                text: "Open your email inbox (check spam/junk folder too)",
              },
              { step: "2", text: "Find the email from Kopa Marketplace" },
              {
                step: "3",
                text: 'Click the "Verify Email" button in the email',
              },
              { step: "4", text: "You'll be redirected to sign in" },
            ].map((s) => (
              <div key={s.step} className="flex items-start gap-3">
                <span className="size-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0">
                  {s.step}
                </span>
                <p className="text-sm text-muted-foreground pt-0.5">{s.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Didn't get the email? Check your spam folder or{" "}
            <button
              onClick={handleResend}
              disabled={isResending}
              className="text-primary font-medium"
            >
              {isResending
                ? "Resending..."
                : isVerifying
                  ? "Verifying email"
                  : "resend verification email"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
