import { cn } from "@/lib/utils/utils";

export const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn("animate-pulse rounded-xl bg-muted", className)} />
);
