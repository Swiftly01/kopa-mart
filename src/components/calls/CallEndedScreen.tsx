import { Phone, PhoneMissed, PhoneOff, Ban, WifiOff } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials, formatCallDuration } from "@/components/chat/chatDateUtils";
import { ActiveCallInfo, CallPhase } from "@/context/CallContext";

const COPY: Partial<Record<CallPhase, { label: string; icon: typeof Phone }>> = {
  declined: { label: "Call declined", icon: PhoneOff },
  missed: { label: "No answer", icon: PhoneMissed },
  cancelled: { label: "Call cancelled", icon: PhoneOff },
  ended: { label: "Call ended", icon: Phone },
  failed: { label: "Call failed", icon: WifiOff },
  unreachable: { label: "User unavailable", icon: WifiOff },
  busy: { label: "Line busy", icon: Ban },
};

export function CallEndedScreen({ call }: { call: ActiveCallInfo }) {
  const [first, ...rest] = call.peerName.split(" ");
  const copy = COPY[call.phase] ?? { label: "Call ended", icon: Phone };
  const Icon = copy.icon;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-zinc-950 px-6 text-white animate-in fade-in">
      <Avatar className="size-24 ring-4 ring-white/10 opacity-80">
        <AvatarFallback className="text-2xl bg-white/10 text-white">
          {getInitials(first, rest.join(" "))}
        </AvatarFallback>
      </Avatar>
      <h2 className="text-xl font-semibold">{call.peerName}</h2>
      <div className="flex items-center gap-2 text-white/70">
        <Icon className="size-4" />
        <span className="text-sm">
          {copy.label}
          {call.phase === "ended" && call.durationSeconds > 0
            ? ` · ${formatCallDuration(call.durationSeconds)}`
            : ""}
        </span>
      </div>
    </div>
  );
}
