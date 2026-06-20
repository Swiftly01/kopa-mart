import { useClaimPromotion } from "@/hooks/promotions/mutaions/useClaimPromotion";
import { useActivePromotion } from "@/hooks/promotions/queries/useActivePromotion";
import { useMyPromotionClaim } from "@/hooks/promotions/queries/useMyPromotionClaim";
import { usePromotionStatus } from "@/hooks/promotions/queries/usePromotionStatus";
import { Download, Gift, Loader2, Lock, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

// ── Constants ─────────────────────────────────────────────────────────────────
const LAUNCH_DATE = new Date("2026-06-22T12:00:00"); // Monday 12:00 PM

function getTimeLeft() {
  const diff = LAUNCH_DATE.getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

/** Returns true only if the user registered after the promotion launched */
function isEligible(userCreatedAt: string | Date | undefined): boolean {
  if (!userCreatedAt) return false;
  return new Date(userCreatedAt).getTime() >= LAUNCH_DATE.getTime();
}

// ─────────────────────────────────────────────────────────────────────────────

interface PromotionBannerProps {
  isAuthenticated: boolean;
  /** Pass user.createdAt so we can check eligibility */
  userCreatedAt?: string | Date;
}

export function PromotionBanner({
  isAuthenticated,
  userCreatedAt,
}: PromotionBannerProps) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isLaunched = timeLeft === null;
  const eligible = isEligible(userCreatedAt);

  // ── ALL hooks called unconditionally — Rules of Hooks ────────────────────
  const { data: active, isLoading: activeLoading } = useActivePromotion();

  const { data: status, isLoading: statusLoading } = usePromotionStatus(
    active?.promotionId ?? "",
    { enabled: isLaunched && eligible && !!active?.promotionId },
  );

  const { data: myClaim, isLoading: claimLoading } = useMyPromotionClaim(
    active?.promotionId ?? "",
    isLaunched && eligible && isAuthenticated && !!active?.promotionId,
  );

  const { mutate: claim, isPending: isClaiming } = useClaimPromotion(
    active?.promotionId ?? "",
  );
  // ─────────────────────────────────────────────────────────────────────────

  // Phase 1: countdown
  if (!isLaunched) {
    return <CountdownCard timeLeft={timeLeft} />;
  }

  // Phase 2: launched — check eligibility
  if (isAuthenticated && !eligible) {
    return <NotEligibleCard />;
  }

  // Phase 3: eligible — show promotion
  if (activeLoading || statusLoading) return null;
  if (!active || !status) return null;

  const alreadyClaimed = !!myClaim;
  const isClosed = !status.isOpen;
  const filledPct =
    status.slotLimit !== null
      ? Math.round((status.claimedCount / status.slotLimit) * 100)
      : 0;

  // ── Already claimed ──────────────────────────────────────────────────────
  if (alreadyClaimed && myClaim) {
    return (
      <div className="p-4 space-y-3 card-listing border-success/30">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-xl bg-success/15 text-success shrink-0">
            <Gift className="size-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{status.name}</p>
            <p className="text-xs text-muted-foreground">
              You were{" "}
              <span className="font-semibold text-success">
                #{myClaim.slotNumber}
              </span>{" "}
              of {status.slotLimit ?? "∞"} 🎉
            </p>
          </div>
        </div>

        {myClaim.assetUrl && (
          <a
            href={myClaim.assetUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="flex items-center justify-center w-full gap-2 px-4 py-2.5 text-sm font-medium transition-opacity rounded-xl bg-success text-white hover:opacity-90"
          >
            <Download className="size-4" />
            Download your free Ebook
          </a>
        )}
      </div>
    );
  }

  // ── Slots full / promo closed ────────────────────────────────────────────
  if (isClosed) {
    return (
      <div className="p-4 space-y-3 opacity-60 card-listing">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-xl bg-muted text-muted-foreground shrink-0">
            <Lock className="size-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{status.name}</p>
            <p className="text-xs text-muted-foreground">
              All {status.slotLimit} slots have been claimed
            </p>
          </div>
        </div>
        <SlotBar
          filled={filledPct}
          count={status.claimedCount}
          limit={status.slotLimit}
        />
      </div>
    );
  }

  // ── Open — can claim ─────────────────────────────────────────────────────
  return (
    <div className="p-4 space-y-3 card-listing border-primary/20">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-10 rounded-xl bg-primary/15 text-primary shrink-0">
          <Gift className="size-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{status.name}</p>
          <p className="text-xs text-muted-foreground">{status.description}</p>
        </div>
      </div>

      <SlotBar
        filled={filledPct}
        count={status.claimedCount}
        limit={status.slotLimit}
      />

      <button
        onClick={() => claim()}
        disabled={isClaiming || claimLoading || !isAuthenticated}
        className="flex items-center justify-center w-full gap-2 px-4 py-2.5 text-sm font-medium transition-opacity rounded-xl bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isClaiming ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Download className="size-4" />
        )}
        {isClaiming
          ? "Claiming..."
          : !isAuthenticated
            ? "Sign in to claim"
            : "Claim your free Ebook"}
      </button>
    </div>
  );
}

// ── NotEligibleCard ───────────────────────────────────────────────────────────
function NotEligibleCard() {
  return (
    <div className="p-4 space-y-1 card-listing opacity-70">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-10 rounded-xl bg-muted text-muted-foreground shrink-0">
          <XCircle className="size-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">Free Ebook Giveaway</p>
          <p className="text-xs text-muted-foreground">
            Sorry, this offer is only available to users who registered after
            launch.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── SlotBar ───────────────────────────────────────────────────────────────────
function SlotBar({
  filled,
  count,
  limit,
}: {
  filled: number;
  count: number;
  limit: number | null;
}) {
  if (limit === null) return null;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>
          <span className="font-semibold text-foreground">{count}</span> of{" "}
          {limit} claimed
        </span>
        <span>{limit - count} remaining</span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${filled}%` }}
        />
      </div>
    </div>
  );
}

// ── CountdownCard ─────────────────────────────────────────────────────────────
function CountdownCard({
  timeLeft,
}: {
  timeLeft: NonNullable<ReturnType<typeof getTimeLeft>>;
}) {
  return (
    <div className="p-4 space-y-4 card-listing border-primary/20 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />

      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-10 rounded-xl bg-primary/15 text-primary shrink-0">
          <Gift className="size-5" />
        </div>
        <div>
          <p className="text-sm font-semibold">
            Free Ebook Giveaway — First 50 Users
          </p>
          <p className="text-xs text-muted-foreground">
            Launching Monday 12:00 PM · Be ready
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "Days", value: timeLeft.days },
          { label: "Hours", value: timeLeft.hours },
          { label: "Mins", value: timeLeft.minutes },
          { label: "Secs", value: timeLeft.seconds },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="flex flex-col items-center justify-center py-3 rounded-xl bg-muted"
          >
            <span className="text-xl font-bold tabular-nums">
              {String(value).padStart(2, "0")}
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
              {label}
            </span>
          </div>
        ))}
      </div>

      <p className="text-xs text-center text-muted-foreground">
        Only <span className="font-semibold text-foreground">50 spots</span>{" "}
        available — first come, first served
      </p>
    </div>
  );
}
