export default function NotificationCardSkeleton() {
  return (
    <div className="flex items-start gap-3 p-4 card-listing animate-pulse">
      <div className="rounded-xl bg-muted size-10 shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <div className="w-2/3 h-3 rounded bg-muted" />
        <div className="w-full h-3 rounded bg-muted" />
      </div>
    </div>
  );
}
