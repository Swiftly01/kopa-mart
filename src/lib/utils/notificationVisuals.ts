import { LucideIcon } from "lucide-react";
import { NotificationItem } from "@/types/notification";
import { resolveNotificationDescriptor } from "@/lib/utils/notificationRegistry";

export interface NotificationVisual {
  icon: LucideIcon;
  /** Tailwind classes for the icon tile. */
  className: string;
}

/**
 * Icon + colour for a notification, driven by the registry — add a descriptor
 * there to give a new type its own look. Unknown types fall back to a
 * channel-based icon, so nothing ever renders blank.
 */
export function getNotificationVisual(
  notification: NotificationItem,
): NotificationVisual {
  const { icon, className } = resolveNotificationDescriptor(notification);
  return { icon, className };
}
