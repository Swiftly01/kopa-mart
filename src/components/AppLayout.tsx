import { ReactNode, useEffect } from "react";
import { BottomNav } from "./BottomNav";
import { useLocation } from "react-router-dom";
import { useStore } from "@/store/useStore";

export const AppLayout = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation();
  const touch = useStore((s) => s.touchActivity);
  const hideNav = pathname.startsWith("/login") || pathname.startsWith("/signup") || pathname.startsWith("/forgot") || pathname.startsWith("/verify-email");

  // Scroll to top on route change
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  // Heartbeat: update lastSeen every 60s + on route change
  useEffect(() => { touch(); }, [pathname, touch]);
  useEffect(() => {
    const id = setInterval(touch, 60_000);
    return () => clearInterval(id);
  }, [touch]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className={`flex-1 ${hideNav ? "" : "pb-24"}`}>{children}</main>
      {!hideNav && <BottomNav />}
    </div>
  );
};
