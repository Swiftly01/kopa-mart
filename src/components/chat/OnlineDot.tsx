import { cn } from "@/lib/utils/utils";

export function OnlineDot({
  online,
  className,
}: {
  online: boolean;
  className?: string;
}) {
  if (!online) return null;
  return (
    <span
      className={cn(
        "absolute bottom-0 right-0 size-3 rounded-full bg-success border-2 border-background",
        className,
      )}
      aria-label="Online"
    />
  );
}
