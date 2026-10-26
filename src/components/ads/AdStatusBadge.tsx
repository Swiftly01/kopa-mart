import { cn } from "@/lib/utils/utils";
import { AD_STATUS } from "@/lib/post-ad/adStatus";
import type { ListingStatus } from "@/types/listing";

// small coloured pill showing where an ad is in its life
export default function AdStatusBadge({ status }: { status: ListingStatus }) {
  const { label, className } = AD_STATUS[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
        className,
      )}
    >
      {label}
    </span>
  );
}
