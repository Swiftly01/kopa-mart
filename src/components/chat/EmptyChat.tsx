import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "./chatDateUtils";

export function EmptyChat({
  name,
  avatarUrl,
}: {
  name: string;
  avatarUrl?: string;
}) {
  const [first, ...rest] = name.split(" ");
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 px-6 text-center">
      <Avatar className="size-20">
        <AvatarImage src={avatarUrl} alt={name} />
        <AvatarFallback className="text-xl bg-secondary text-secondary-foreground">
          {getInitials(first, rest.join(" "))}
        </AvatarFallback>
      </Avatar>
      <h3 className="font-semibold text-foreground">{name}</h3>
      <p className="max-w-xs text-sm text-muted-foreground">
        This is the beginning of your conversation. Say hello 👋
      </p>
    </div>
  );
}
