import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import SignInPrompt from "@/components/SignInPrompt";
import { Button } from "@/components/ui/button";
import useUser from "@/hooks/users/queries/useUser";

// only sellers may post ads; everyone else sees why and how to become one
export default function SellerGate({ children }: { children: ReactNode }) {
  const { data: user, isLoading } = useUser();

  if (isLoading) {
    return <Loader2 className="mx-auto mt-16 size-10 animate-spin text-primary" />;
  }
  if (!user) return <SignInPrompt />;

  if (user.role !== "seller") {
    return (
      <div className="max-w-md px-6 pt-16 mx-auto space-y-3 text-center">
        <h1 className="text-lg font-bold">Only sellers can post ads</h1>
        <p className="text-sm text-muted-foreground">
          Complete seller verification to start posting ads.
        </p>
        <Button asChild className="bg-gradient-primary">
          <Link to="/seller-onboarding/intro">Become a seller</Link>
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
