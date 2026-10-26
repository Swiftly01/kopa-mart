import { MapPin } from "lucide-react";
import AdGallery from "@/components/ads/AdGallery";
import AdSpecs from "@/components/ads/AdSpecs";
import { formatNaira } from "@/lib/utils/formatNaira";
import type { ListingDetailData } from "@/types/listing";

const NEGOTIABLE_LABELS = { yes: "Negotiable", no: "Fixed price", not_sure: "" };

// the body of an ad page for the owner and the admin: photos, price, place, details, description
export default function AdDetailsView({ ad }: { ad: ListingDetailData }) {
  const negotiable = NEGOTIABLE_LABELS[ad.negotiable];

  return (
    <div className="space-y-4">
      <AdGallery images={ad.images} title={ad.title} />

      <div className="space-y-1">
        <h2 className="text-lg font-bold">{ad.title}</h2>
        <p className="text-xl font-bold text-primary">
          {formatNaira(ad.price)}
          {negotiable && (
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              {negotiable}
            </span>
          )}
        </p>
        <p className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="size-4" />
          {ad.lgaName}, {ad.stateName}
        </p>
        <p className="text-xs text-muted-foreground">{ad.category.name}</p>
      </div>

      <AdSpecs ad={ad} />
    </div>
  );
}
