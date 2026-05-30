import { cn } from "@/lib/utils/utils";

export default function StatPill({
  icon: Icon,
  label,
  value,
  accent = false,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 px-4 py-3 rounded-2xl border",
        accent
          ? "bg-primary/5 border-primary/20 text-primary"
          : "bg-card border-border/60",
      )}
    >
      <Icon
        className={cn(
          "size-4 shrink-0",
          accent ? "text-primary" : "text-muted-foreground",
        )}
      />
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium leading-none mb-1">
          {label}
        </p>
        <p
          className={cn(
            "text-sm font-semibold leading-none",
            accent ? "text-primary" : "text-foreground",
          )}
        >
          {value}
        </p>
      </div>
    </div>
  );
}