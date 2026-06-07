import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Home, Heart, Plus, User, Moon, Sun } from "lucide-react";
import { useStore } from "@/store/useStore";
import { cn } from "@/lib/utils/utils";
import useUser from "@/hooks/users/queries/useUser";

export const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: user } = useUser();
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);

  
  const handleSell = () => {
    if (user.role === "seller") {
      return navigate("/seller-dashboard/create-listing");
    }
    return navigate("/seller-onboarding/intro");
  };

  const items = [
    { to: "/", label: "Home", icon: Home },
    { to: "/saved", label: "Saved", icon: Heart },
    { sell: true, label: "Sell", icon: Plus },
    {
      action: () => setTheme(theme === "dark" ? "light" : "dark"),
      label: theme === "dark" ? "Light" : "Dark",
      icon: theme === "dark" ? Sun : Moon,
    },
    { to: "/profile", label: "Profile", icon: User },
  ] as const;

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 border-t border-border bg-background/95 backdrop-blur-lg pb-[env(safe-area-inset-bottom)]"
      aria-label="Primary"
    >
      <ul className="grid max-w-2xl grid-cols-5 mx-auto">
        {items.map((it, i) => {
          const Icon = it.icon;
          if ("sell" in it) {
            return (
              <li key={i} className="flex justify-center -mt-5">
                <button
                  onClick={handleSell}
                  className="flex items-center justify-center transition-transform rounded-full size-14 bg-gradient-primary text-primary-foreground shadow-elevated active:scale-95"
                  aria-label="Sell"
                >
                  <Icon className="size-6" />
                </button>
              </li>
            );
          }
          if ("action" in it) {
            return (
              <li key={i}>
                <button
                  onClick={it.action}
                  className="w-full h-16 flex flex-col items-center justify-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Icon className="size-5" />
                  <span className="text-[10px] font-medium">{it.label}</span>
                </button>
              </li>
            );
          }
          const active = location.pathname === it.to;
          return (
            <li key={i}>
              <NavLink
                to={it.to}
                className={cn(
                  "w-full h-16 flex flex-col items-center justify-center gap-0.5 transition-colors",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className={cn("size-5", active && "fill-primary/15")} />
                <span className="text-[10px] font-medium">{it.label}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
