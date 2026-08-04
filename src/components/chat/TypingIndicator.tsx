export function TypingIndicator({ label }: { label?: string }) {
  return (
    <div className="flex items-end gap-2 px-4 py-1 animate-in fade-in slide-in-from-bottom-1">
      <div className="flex items-center gap-1 px-3 py-2.5 rounded-2xl rounded-bl-md bg-muted">
        <span className="size-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:-0.3s]" />
        <span className="size-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:-0.15s]" />
        <span className="size-1.5 rounded-full bg-muted-foreground/60 animate-bounce" />
      </div>
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
    </div>
  );
}
