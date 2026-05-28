import { ReactNode } from "react";
import { Link, useLocation, Navigate } from "react-router-dom";
import { useCurrentUser } from "@/store/useStore";
import { LayoutDashboard, Plus } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { Button } from "@/components/ui/button";

export const SellerShell = ({ children }: { children: ReactNode }) => {
  const user = useCurrentUser();
  const { pathname } = useLocation();

  if (!user)
    return (
      <Navigate to="/login?next=/seller-dashboard/manage-listings" replace />
    );
  if (user.status !== "verified") {
    return (
      <div className="max-w-md mx-auto px-6 pt-16 text-center space-y-3">
        <h1 className="font-bold text-lg">Verification required</h1>
        <p className="text-sm text-muted-foreground">
          You must complete seller verification before posting.
        </p>
        <Button asChild className="bg-gradient-primary">
          <Link to="/seller-onboarding/intro">Become a seller</Link>
        </Button>
      </div>
    );
  }

  const tabs = [
    {
      to: "/seller-dashboard/manage-listings",
      label: "Manage",
      icon: LayoutDashboard,
    },
    { to: "/seller-dashboard/create-listing", label: "Add new", icon: Plus },
  ];
  return (
    <div className="max-w-2xl mx-auto px-4 pt-4">
      <h1 className="font-bold text-lg mb-3">Seller Dashboard</h1>
      <div className="flex gap-2 p-1 bg-secondary rounded-2xl mb-4">
        {tabs.map((t) => {
          const active = pathname === t.to;
          return (
            <Link
              key={t.to}
              to={t.to}
              className={cn(
                "flex-1 h-10 rounded-xl flex items-center justify-center gap-1.5 text-sm font-medium transition-colors",
                active
                  ? "bg-background shadow-soft text-foreground"
                  : "text-muted-foreground",
              )}
            >
              <t.icon className="size-4" />
              {t.label}
            </Link>
          );
        })}
      </div>
      {children}
    </div>
  );
};
