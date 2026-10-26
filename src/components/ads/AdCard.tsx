import { Link } from "react-router-dom";
import { Heart, MapPin, Tag } from "lucide-react";
import { StarRating } from "@/components/ui/starRating";
import { formatNaira } from "@/lib/utils/formatNaira";
import { cn } from "@/lib/utils/utils";
import { useToggleSavedProduct } from "@/hooks/saved-products/mutations/usetoggleSavedProduct";
import { useGetSaveStatus } from "@/hooks/saved-products/queries/useGetSaveStatus";
import type { ListingCardData } from "@/types/listing";

// a published ad in the homepage grid; opens the public ad page
export default function AdCard({ ad }: { ad: ListingCardData }) {
  // the save API takes an ad id the same way it takes a product id
  const { isSaved } = useGetSaveStatus(ad.id);
  const { mutate: toggleSave, isPending } = useToggleSavedProduct(ad.id);

  return (
    <Link to={`/ad/${ad.slug}`} className="block card-listing group animate-fade-in">
      <div className="relative overflow-hidden aspect-square bg-muted rounded-xl">
        {ad.thumbnailUrl ? (
          <img
            src={ad.thumbnailUrl}
            alt={ad.title}
            loading="lazy"
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-secondary">
            <Tag className="size-8 text-muted-foreground/40" />
          </div>
        )}

        {/* save button; preventDefault keeps the card link from opening */}
        <button
          type="button"
          disabled={isPending}
          onClick={(e) => {
            e.preventDefault();
            toggleSave();
          }}
          className={cn(
            "absolute top-2 right-2 size-9 rounded-full bg-background/90 backdrop-blur",
            "flex items-center justify-center shadow-soft",
            "active:scale-90 transition-transform",
            isPending && "opacity-60 cursor-not-allowed",
          )}
          aria-label={isSaved ? "Remove from saved" : "Save listing"}
        >
          <Heart
            className={cn(
              "size-4 transition-colors",
              isSaved ? "fill-destructive text-destructive" : "text-muted-foreground",
            )}
          />
        </button>
      </div>
      <div className="p-2 space-y-0.5">
        <p className="text-sm font-bold text-primary">{formatNaira(ad.price)}</p>
        <p className="text-sm truncate">{ad.title}</p>
        {ad.reviewCount > 0 && (
          <StarRating value={ad.rating} showValue reviewCount={ad.reviewCount} size="xs" />
        )}
        <p className="flex items-center gap-1 text-xs truncate text-muted-foreground">
          <MapPin className="size-3 shrink-0" />
          {ad.lgaName}, {ad.stateName}
        </p>
      </div>
    </Link>
  );
}