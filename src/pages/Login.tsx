import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import nyscLogo from "@/assets/kopa_logo.jpeg";
  
import useLogin from "@/hooks/auth/mutations/useLogin";

import { useAuth } from "@/context/AuthContext";
import appToast from "@/lib/appToast";
import { handleAxiosError } from "@/lib/utils/errors/errorHandler";
import { LoginResponse } from "@/types/auth";
import { AxiosError } from "axios";
import { z } from "zod";
import { googleOAuthUrl } from "@/lib/utils/config";

 const loginSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginSchema = z.infer<typeof loginSchema>;

const Login = () => {
  const navigate = useNavigate();

 // const [params] = useSearchParams();
  //const next = params.get("next") ?? "/";

  const [showPw, setShowPw] = useState(false);

  const { logIn, isLoggingIn } = useLogin();
  const { login: auth } = useAuth();

  const {
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),

    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(data: LoginSchema) {
    logIn(data, {
      onSuccess: (res: LoginResponse) => {
        appToast({
          title: "Welcome back!",
          description: "Login successful",
          variant: "default",
        });

        const token = res.accessToken;
        const role = res.user.role;
        auth(token, role);
        reset()
        navigate('/');

      },

      onError: (err: AxiosError) => {
        handleAxiosError(err);
      },
    });
  }

  function googleLogin() {
     window.location.assign(googleOAuthUrl);
  }

  return (
    <div className="min-h-screen bg-gradient-soft flex flex-col px-5 py-10">
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col">
        <Link to="/" className="flex items-center gap-2 mb-10">
          <img
            src={nyscLogo}
            alt=""
            className="size-8 rounded-lg object-cover ring-1 ring-border"
          />

          <span className="font-bold">Kopa Marketplace</span>
        </Link>

        <h1 className="text-2xl font-bold mb-1">Welcome back</h1>

        <p className="text-sm text-muted-foreground mb-6">
          Sign in to continue.
        </p>

        {/* GOOGLE LOGIN */}
        <button
          onClick={googleLogin}
          className="w-full h-12 rounded-xl border border-border bg-background flex items-center justify-center gap-3 font-medium text-sm hover:bg-secondary transition-colors mb-4"
        >
          Continue with Google
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-border" />

          <span className="text-xs text-muted-foreground">or</span>

          <div className="flex-1 h-px bg-border" />
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {/* EMAIL */}
          <div>
            <Label htmlFor="email">Email</Label>

            <Input
              id="email"
              type="email"
              className="h-12 mt-1"
              {...register("email")}
            />

            {errors.email && (
              <p className="text-sm text-destructive mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* PASSWORD */}
          <div>
            <Label htmlFor="password">Password</Label>

            <div className="relative mt-1">
              <Input
                id="password"
                type={showPw ? "text" : "password"}
                className="h-12 pr-10"
                {...register("password")}
              />

              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPw ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>

            {errors.password && (
              <p className="text-sm text-destructive mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <Link to="/forgot" className="text-xs text-primary block text-right">
            Forgot password?
          </Link>

          <Button
            type="submit"
            disabled={isLoggingIn}
            className="w-full h-12 bg-gradient-primary"
          >
            {isLoggingIn ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <p className="text-sm text-center mt-6 text-muted-foreground">
          New here?{" "}
          <Link to="/signup" className="text-primary font-medium">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
