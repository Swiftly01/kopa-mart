import CheckEmailView from "@/components/CheckEmailView";
import ForgotPasswordRequestForm from "@/components/ForgotPasswordRequestForm";
import ResetPasswordForm from "@/components/ResetPasswordForm";
import React from "react";
import { useSearchParams } from "react-router-dom";

export default function Forgot() {
  const [params] = useSearchParams();
  const step = params.get("step");

  if (step === "check") return <CheckEmailView />;

  return <ForgotPasswordRequestForm />;
}
