import { Phone, PhoneOff, Video } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/components/chat/chatDateUtils";
import { ActiveCallInfo } from "@/context/CallContext";
import { CallType } from "@/types/chat";

export function IncomingCallScreen({
  call,
  onAccept,
  onDecline,
}: {
  call: ActiveCallInfo;
  onAccept: () => void;
  onDecline: () => void;
}) {
  const [first, ...rest] = call.peerName.split(" ");

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-between bg-gradient-hero px-6 py-16 text-white animate-in fade-in">
      <div className="flex flex-col items-center gap-3 mt-12">
        <span className="text-sm font-medium tracking-wide uppercase opacity-80">
          Incoming {call.type === CallType.VIDEO ? "video" : "voice"} call
        </span>
        <Avatar className="size-28 ring-4 ring-white/20">
          <AvatarFallback className="text-3xl bg-white/15 text-white">
            {getInitials(first, rest.join(" "))}
          </AvatarFallback>
        </Avatar>
        <h2 className="text-2xl font-semibold">{call.peerName}</h2>
      </div>

      <div className="flex items-center justify-center w-full gap-16">
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={onDecline}
            className="flex items-center justify-center transition-transform rounded-full size-16 bg-destructive active:scale-95"
            aria-label="Decline"
          >
            <PhoneOff className="size-6" />
          </button>
          <span className="text-xs opacity-80">Decline</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={onAccept}
            className="flex items-center justify-center transition-transform rounded-full size-16 bg-success active:scale-95"
            aria-label="Accept"
          >
            {call.type === CallType.VIDEO ? (
              <Video className="size-6" />
            ) : (
              <Phone className="size-6" />
            )}
          </button>
          <span className="text-xs opacity-80">Accept</span>
        </div>
      </div>
    </div>
  );
}
