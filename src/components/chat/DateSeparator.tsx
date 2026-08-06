import { formatDaySeparator } from "./chatDateUtils";

export function DateSeparator({ iso }: { iso: string }) {
  return (
    <div className="flex justify-center my-3">
      <span className="px-3 py-1 text-xs font-medium rounded-full bg-muted text-muted-foreground">
        {formatDaySeparator(iso)}
      </span>
    </div>
  );
}
