import { ReactNode } from "react";
import { Link, useLocation, Navigate } from "react-router-dom";
//import { useCurrentUser, isAdmin, isSuperAdmin } from "@/store/useStore";
import {
  LayoutDashboard,
  ShieldCheck,
  Users,
  Package,
  Settings as Cog,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils/utils";
import useUser from "@/hooks/users/queries/useUser";
import { isAdmin, isSuperAdmin } from "@/lib/utils/authRoles";
import SignInPrompt from "./SignInPrompt";

export const AdminShell = ({ children }: { children: ReactNode }) => {

  const { data: user, isLoading } = useUser();
  const { pathname } = useLocation();

  if (isLoading) {
    return <Loader2 className="mx-auto size-12 animate-spin text-primary" />;
  }

  if (!user) {
    return <SignInPrompt />;
  }

  if (!isAdmin(user)) {
    return (
      <div className="max-w-md p-10 mx-auto text-center">
        <p className="text-sm text-muted-foreground">Admins only.</p>
      </div>
    );
  }
  const tabs = [
    { to: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
    { to: "/admin/users", label: "Users", icon: Users },
    { to: "/admin/listings", label: "Listings", icon: Package },
    { to: "/admin/seller-verification", label: "Verify", icon: ShieldCheck },
    { to: "/admin/categories", label: "Categories", icon: ShieldCheck },
    ...(isAdmin(user)
      ? [{ to: "/admin/settings", label: "Settings", icon: Cog }]
      : []),
  ];
  return (
    <div className="px-4 pt-4 mx-auto max-w-7xl">
      <div className="flex items-center gap-2 mb-3">
        <h1 className="text-lg font-bold">Admin Dashboard</h1>
        <span
          className={cn(
            "text-[10px] px-2 py-0.5 rounded-full font-medium",
            isSuperAdmin(user)
              ? "bg-primary/15 text-primary"
              : "bg-accent/20 text-accent-foreground",
          )}
        >
          {isSuperAdmin(user) ? "Super Admin" : "Admin"}
        </span>
      </div>
      <div className="flex gap-1 p-1 mb-4 overflow-x-auto bg-secondary rounded-2xl no-scrollbar">
        {tabs.map((t) => {
          const active = pathname === t.to;
          return (
            <Link
              key={t.to}
              to={t.to}
              className={cn(
                "shrink-0 px-3 h-10 rounded-xl flex items-center gap-1.5 text-sm font-medium",
                active ? "bg-background shadow-soft" : "text-muted-foreground",
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
