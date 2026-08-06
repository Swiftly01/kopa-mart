import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils/utils";

export function MessageSkeleton() {
  const widths = ["w-40", "w-56", "w-32", "w-48", "w-28", "w-52"];
  return (
    <div className="flex flex-col gap-3 px-4 py-4">
      {widths.map((w, i) => (
        <div
          key={i}
          className={cn("flex", i % 3 === 0 ? "justify-end" : "justify-start")}
        >
          <Skeleton className={cn("h-9 rounded-2xl", w)} />
        </div>
      ))}
    </div>
  );
}
