import { ImageOff } from "lucide-react";
import { Link } from "react-router-dom";
import AdStatusBadge from "@/components/ads/AdStatusBadge";
import { formatNaira } from "@/lib/utils/formatNaira";
import type { ListingCardData } from "@/types/listing";

// one of the user's own ads in a list; opens the owner page of that ad
export default function MyAdRow({ ad }: { ad: ListingCardData }) {
  return (
    <Link to={`/my-ads/${ad.id}`} className="flex gap-3 p-3 card-listing">
      <div className="flex items-center justify-center overflow-hidden rounded-lg size-20 shrink-0 bg-secondary text-muted-foreground">
        {ad.thumbnailUrl ? (
          <img src={ad.thumbnailUrl} alt="" className="object-cover w-full h-full" />
        ) : (
          <ImageOff className="size-5" />
        )}
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <p className="text-sm font-medium truncate">{ad.title}</p>
        <p className="text-sm font-bold text-primary">{formatNaira(ad.price)}</p>
        <p className="text-xs truncate text-muted-foreground">
          {ad.lgaName}, {ad.stateName}
        </p>
        <AdStatusBadge status={ad.status} />
        {ad.status === "rejected" && ad.rejectionReason && (
          <p className="text-xs truncate text-destructive">{ad.rejectionReason}</p>
        )}
      </div>
    </Link>
  );
}
