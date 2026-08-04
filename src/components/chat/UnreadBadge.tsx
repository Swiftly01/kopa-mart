export function UnreadBadge({ count }: { count: number }) {
  if (!count) return null;
  return (
    <span className="flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[11px] font-semibold leading-none">
      {count > 99 ? "99+" : count}
    </span>
  );
}
