import { Link } from "react-router-dom";
import { Heart, MapPin, Tag } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { Product } from "@/types/product";
import { useGetSaveStatus } from "@/hooks/saved-products/queries/useGetSaveStatus";
import { useToggleSavedProduct } from "@/hooks/saved-products/mutations/usetoggleSavedProduct";

const formatNaira = (value: string | number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(Number(value));

export const ListingCard = ({ listing }: { listing: Product }) => {
  const { isSaved } = useGetSaveStatus(listing.id);
  const { mutate: toggle, isPending } = useToggleSavedProduct(listing.id);

  const image = listing.images.find((i) => i.isMain) ?? listing.images[0];

  return (
    <Link
      to={`/listing/${listing.slug}`}
      className="card-listing block group animate-fade-in"
    >
      {/* ── Image ── */}
      <div className="relative aspect-square bg-muted overflow-hidden rounded-xl">
        {image ? (
          <img
            src={image.cloudinaryUrl}
            alt={listing.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary">
            <Tag className="size-8 text-muted-foreground/40" />
          </div>
        )}

        {/* ── Heart / save button ── */}
        <button
          type="button"
          disabled={isPending}
          onClick={(e) => {
            e.preventDefault();
            toggle();
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
              isSaved
                ? "fill-destructive text-destructive"
                : "text-muted-foreground",
            )}
          />
        </button>

        {/* ── Condition badge ── */}
        {listing.condition && listing.condition !== "used" && (
          <span className="absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-background/90 backdrop-blur capitalize">
            {listing.condition}
          </span>
        )}
      </div>

      {/* ── Info ── */}
      <div className="p-3 space-y-1">
        <h3 className="font-medium text-sm line-clamp-1">{listing.name}</h3>
        <p className="font-bold text-primary">{formatNaira(listing.price)}</p>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3 shrink-0" />
          <span className="line-clamp-1">
            {listing.lgaName}, {listing.stateName}
          </span>
        </div>
      </div>
    </Link>
  );
};
