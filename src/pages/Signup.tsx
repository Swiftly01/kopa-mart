import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";
import nyscLogo from "@/assets/kopa_logo.jpeg";
import { z } from "zod";
import useSignup from "@/hooks/auth/mutations/useRegister";
import { googleOAuthUrl } from "@/lib/utils/config";

const signupSchema = z.object({
  firstName: z
    .string({
      required_error: "First name is required",
      invalid_type_error: "First name must be a string",
    })
    .trim()
    .min(2, { message: "First name must be at least 2 characters long" })
    .max(40, { message: "First name cannot exceed 40 characters" }),

  lastName: z
    .string({
      required_error: "Last name is required",
      invalid_type_error: "Last name must be a string",
    })
    .trim()
    .min(2, { message: "Last name must be at least 2 characters long" })
    .max(40, { message: "Last name cannot exceed 40 characters" }),

  email: z
    .string({
      required_error: "Email is required",
      invalid_type_error: "Email must be a string",
    })
    .trim()
    .email({ message: "Please enter a valid email address" })
    .max(255, { message: "Email cannot exceed 255 characters" }),

  phoneNumber: z
    .string()
    .regex(
      /^\+234\d{10}$/,
      "Enter a valid Nigerian number e.g. +2349131365111",
    ),

  password: z
    .string({
      required_error: "Password is required",
      invalid_type_error: "Password must be a string",
    })
    .min(6, { message: "Password must be at least 6 characters long" })
    .max(100, { message: "Password cannot exceed 100 characters" }),
});

export type SignupFormData = z.infer<typeof signupSchema>;

const Signup = () => {
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const { signup, isPending } = useSignup(setError);

  const onSubmit = async (data: SignupFormData) => {
    const payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      phoneNumber: data.phoneNumber,
    };

    try {
      await signup(payload);

      toast({
        title: "Account created!",
        description: "Please verify your email.",
      });
      navigate("/verify-email?email=" + encodeURIComponent(data.email));
    } catch (err) {
      // console.log(err.response);
    }
  };

  const googleSignup = () => {
    window.location.assign(googleOAuthUrl);
  };

  return (
    <div className="flex flex-col min-h-screen px-5 py-10 bg-gradient-soft">
      <div className="flex-1 w-full max-w-md mx-auto">
        <Link to="/" className="flex items-center gap-2 mb-10">
          <img src={nyscLogo} className="rounded-lg size-8" />
          <span className="font-bold">Kopa Marketplace</span>
        </Link>

        <h1 className="text-2xl font-bold">Create your account</h1>

        <button
          onClick={googleSignup}
          className="flex items-center justify-center w-full h-12 gap-3 mt-4 mb-4 text-sm font-medium transition-colors border rounded-xl border-border bg-background hover:bg-secondary"
        >
          <svg className="size-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </button>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>First name</Label>
              <Input {...register("firstName")} className="h-12 mt-1" />
              {errors.firstName && (
                <p className="text-sm text-red-500">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div>
              <Label>Last name</Label>
              <Input {...register("lastName")} className="h-12 mt-1" />
              {errors.lastName && (
                <p className="text-sm text-red-500">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label>Email</Label>
            <Input type="email" {...register("email")} className="h-12 mt-1" />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Label>Phone</Label>
            <Input
              placeholder="+2349111111111"
              {...register("phoneNumber")}
              className="h-12 mt-1"
            />
            {errors.phoneNumber && (
              <p className="text-sm text-red-500">
                {errors.phoneNumber.message}
              </p>
            )}
          </div>

          <div>
            <Label>Password</Label>
            <div className="relative mt-1">
              <Input
                type={showPw ? "text" : "password"}
                {...register("password")}
                className="h-12 pr-10"
              />
              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}

              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute -translate-y-1/2 right-3 top-1/2"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <Button type="submit" disabled={isPending} className="w-full h-12">
            {isPending ? "Creating..." : "Create account"}
          </Button>
        </form>

        <p className="mt-6 text-sm text-center">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
