import { LogIn } from "lucide-react";
import React from "react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

export default function SignInPrompt() {
  const navigate = useNavigate();
  return (
    <div className="max-w-2xl px-4 pt-10 mx-auto space-y-4 text-center">
      <div className="flex items-center justify-center mx-auto rounded-full size-16 bg-secondary">
        <LogIn className="size-7" />
      </div>
      <h1 className="text-xl font-bold">You're not signed in</h1>
      <p className="text-sm text-muted-foreground">
        Sign in to manage your profile, save listings and become a seller.
      </p>
      <div className="flex justify-center gap-2">
        <Button onClick={() => navigate("/login")}>Sign in</Button>
        <Button variant="outline" onClick={() => navigate("/signup")}>
          Create account
        </Button>
      </div>
    </div>
  );
}
