import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import useUser from "@/hooks/users/queries/useUser";
import { useAuth } from "@/context/AuthContext";
import appToast from "@/lib/appToast";

const AuthSuccess = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const token = params.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );

  const hasAuthenticated = useRef(false);
  const { login: auth } = useAuth();

  // SINGLE COMBINED EFFECT - Handles token validation and initial auth
  useEffect(() => {
    if (!token) {
      setStatus("error");
      appToast({
        title: "Authentication failed",
        description: "No token received from server",
        variant: "destructive",
      });
      setTimeout(() => navigate("/login"), 2000);
      return;
    }

    // Just set up the initial auth call, don't await user data yet
    auth(token, "");
  }, [token, navigate, auth]);

  const { session } = useAuth();

  const {
    data: user,
    isLoading,
    isError,
  } = useUser({
    enabled: !!session?.token,
  });

  // SECOND EFFECT - Handles user data and final auth setup
  useEffect(() => {
    if (!token || isLoading || hasAuthenticated.current) {
      return;
    }

    if (isError) {
      setStatus("error");
      appToast({
        title: "Authentication failed",
        description: "Unable to fetch user",
        variant: "destructive",
      });
      setTimeout(() => navigate("/login"), 2000);
      return;
    }

    // Guard: wait until user data is actually present
    if (!user) {
      return;
    }

    // Mark as authenticated and update role
    hasAuthenticated.current = true;
    auth(token, user.role);
    setStatus("success");

    // Redirect after success
    const redirectTimer = setTimeout(() => {
      navigate("/");
    }, 1500);

    return () => clearTimeout(redirectTimer);
  }, [token, user, isLoading, isError, navigate, auth]);

  // LOADING STATE
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen px-5 bg-gradient-soft">
        <div className="space-y-4 text-center">
          <Loader2 className="mx-auto size-12 animate-spin text-primary" />
          <h1 className="text-2xl font-bold">Signing you in...</h1>
          <p className="text-sm text-muted-foreground">
            Please wait while we complete your authentication
          </p>
        </div>
      </div>
    );
  }

  // ERROR STATE
  if (status === "error") {
    return (
      <div className="flex items-center justify-center min-h-screen px-5 bg-gradient-soft">
        <div className="max-w-md space-y-4 text-center">
          <div className="flex items-center justify-center mx-auto rounded-full size-20 bg-destructive/10">
            <span className="text-3xl text-destructive">✕</span>
          </div>
          <h1 className="text-2xl font-bold">Authentication Failed</h1>
          <p className="text-sm text-muted-foreground">
            We couldn't complete your sign-in. Please try again.
          </p>
          <Link to="/login">
            <Button className="w-full h-12 mt-2 bg-gradient-primary">
              Back to Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // SUCCESS STATE
  return (
    <div className="flex items-center justify-center min-h-screen px-5 bg-gradient-soft">
      <div className="max-w-md space-y-6 text-center">
        <div className="flex items-center justify-center mx-auto rounded-full size-24 bg-success/15">
          <CheckCircle className="size-12 text-success" />
        </div>
        <h1 className="text-2xl font-bold">Welcome to Kopa Marketplace</h1>
        <p className="text-sm text-muted-foreground">
          You've successfully signed in. Redirecting you to the home page...
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Preparing your account
        </div>
        <Link to="/">
          <Button className="w-full h-12 mt-4 bg-gradient-primary">
            Go to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default AuthSuccess;
