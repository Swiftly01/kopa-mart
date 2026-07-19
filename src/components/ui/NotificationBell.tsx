import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import useUnreadCount from "@/hooks/notifications/queries/useUnreadCount";
import useUser from "@/hooks/users/queries/useUser";

export default function NotificationBell() {
  const { data: user } = useUser();
  const { data, isLoading, isFetching, error } = useUnreadCount();

  if (!user) return null;

  const unreadCount = data?.count ?? 0;

  return (
    <Link
      to="/notifications"
      className="relative flex items-center justify-center transition-colors rounded-full shrink-0 size-9 hover:bg-secondary text-foreground"
      aria-label={
        unreadCount > 0
          ? `Notifications, ${unreadCount} unread`
          : "Notifications"
      }
    >
      <Bell className="size-5" />
      {unreadCount > 0 && (
        <span className="absolute flex items-center justify-center px-1 text-[8px] font-bold text-white rounded-full top-0.5 right-0.5 bg-destructive min-w-4 h-4">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
