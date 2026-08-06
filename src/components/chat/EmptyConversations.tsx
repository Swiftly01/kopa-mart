import { MessageCircle } from "lucide-react";

export function EmptyConversations({ searching }: { searching?: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-24 text-center">
      <div className="flex items-center justify-center rounded-full size-16 bg-secondary text-secondary-foreground">
        <MessageCircle className="size-7" />
      </div>
      <h3 className="font-semibold text-foreground">
        {searching ? "No conversations found" : "No messages yet"}
      </h3>
      <p className="max-w-xs text-sm text-muted-foreground">
        {searching
          ? "Try a different search term."
          : "When you message a seller or buyer, your conversations will show up here."}
      </p>
    </div>
  );
}
