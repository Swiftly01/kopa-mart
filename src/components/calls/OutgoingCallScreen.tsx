import { PhoneOff } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/components/chat/chatDateUtils";
import { ActiveCallInfo } from "@/context/CallContext";

export function OutgoingCallScreen({
  call,
  onCancel,
}: {
  call: ActiveCallInfo;
  onCancel: () => void;
}) {
  const [first, ...rest] = call.peerName.split(" ");
  const statusLabel = call.phase === "connecting" ? "Connecting…" : "Ringing…";

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-between bg-gradient-hero px-6 py-16 text-white animate-in fade-in">
      <div className="flex flex-col items-center gap-3 mt-12">
        <Avatar className="size-28 ring-4 ring-white/20">
          <AvatarFallback className="text-3xl bg-white/15 text-white">
            {getInitials(first, rest.join(" "))}
          </AvatarFallback>
        </Avatar>
        <h2 className="text-2xl font-semibold">{call.peerName}</h2>
        <p className="text-sm opacity-80 animate-pulse">{statusLabel}</p>
      </div>

      <div className="flex flex-col items-center gap-2">
        <button
          onClick={onCancel}
          className="flex items-center justify-center transition-transform rounded-full size-16 bg-destructive active:scale-95"
          aria-label="Cancel call"
        >
          <PhoneOff className="size-6" />
        </button>
        <span className="text-xs opacity-80">Cancel</span>
      </div>
    </div>
  );
}
