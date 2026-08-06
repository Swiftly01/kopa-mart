import { Check, CheckCheck, Clock3, AlertCircle } from "lucide-react";
import { MessageStatus } from "@/types/chat";
import { cn } from "@/lib/utils/utils";

export function MessageStatusTicks({
  status,
  clientState,
}: {
  status: MessageStatus;
  clientState?: "pending" | "failed" | "sent";
}) {
  if (clientState === "pending") {
    return <Clock3 className="size-3.5 text-primary-foreground/70" />;
  }
  if (clientState === "failed") {
    return <AlertCircle className="size-3.5 text-destructive" />;
  }
  if (status === MessageStatus.READ) {
    return <CheckCheck className={cn("size-3.5 text-sky-300")} />;
  }
  if (status === MessageStatus.DELIVERED) {
    return <CheckCheck className="size-3.5 text-primary-foreground/70" />;
  }
  return <Check className="size-3.5 text-primary-foreground/70" />;
}
