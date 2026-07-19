import {
  Bell,
  KeyRound,
  Mail,
  MessageSquare,
  Package,
  ShieldCheck,
  ShieldX,
  TrendingDown,
  Megaphone,
  LucideIcon,
} from "lucide-react";
import { NotificationChannel, NotificationType } from "@/types/notification";

interface NotificationVisual {
  icon: LucideIcon;
  className: string; 
}

const TYPE_VISUALS: Partial<Record<NotificationType, NotificationVisual>> = {
  [NotificationType.OTP_VERIFICATION]: {
    icon: KeyRound,
    className: "bg-primary/15 text-primary",
  },
  [NotificationType.PASSWORD_RESET]: {
    icon: KeyRound,
    className: "bg-primary/15 text-primary",
  },
  [NotificationType.ORDER_CONFIRMATION]: {
    icon: Package,
    className: "bg-success/15 text-success",
  },
  [NotificationType.ORDER_STATUS_UPDATE]: {
    icon: Package,
    className: "bg-blue-500/15 text-blue-500",
  },
  [NotificationType.SELLER_APPROVED]: {
    icon: ShieldCheck,
    className: "bg-success/15 text-success",
  },
  [NotificationType.SELLER_REJECTED]: {
    icon: ShieldX,
    className: "bg-destructive/15 text-destructive",
  },
  [NotificationType.PRICE_DROP_ALERT]: {
    icon: TrendingDown,
    className: "bg-warning/15 text-warning",
  },
  [NotificationType.PROMOTION_ALERT]: {
    icon: Megaphone,
    className: "bg-accent/30 text-accent-foreground",
  },
};

const CHANNEL_FALLBACK: Record<NotificationChannel, NotificationVisual> = {
  [NotificationChannel.EMAIL]: {
    icon: Mail,
    className: "bg-secondary text-foreground",
  },
  [NotificationChannel.SMS]: {
    icon: MessageSquare,
    className: "bg-secondary text-foreground",
  },
  [NotificationChannel.PUSH]: {
    icon: Bell,
    className: "bg-secondary text-foreground",
  },
};

/** Falls back to a channel-based icon for any type not explicitly mapped above, so a new NotificationType added server-side never renders blank. */
export function getNotificationVisual(
  type: NotificationType,
  channel: NotificationChannel,
): NotificationVisual {
  return TYPE_VISUALS[type] ?? CHANNEL_FALLBACK[channel];
}
