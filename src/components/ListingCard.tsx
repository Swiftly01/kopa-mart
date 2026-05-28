import { Link } from "react-router-dom";
import { Heart, MapPin, ShieldCheck } from "lucide-react";
import { Listing, formatNaira } from "@/data/seed";
import { useStore } from "@/store/useStore";
import { cn } from "@/lib/utils/utils";

export const ListingCard = ({ listing }: { listing: Listing }) => {
  const isSaved = useStore((s) => s.isSaved(listing.id));
  const toggle = useStore((s) => s.toggleSaved);

  return (
    <Link
      to={`/listing/${listing.id}`}
      className="card-listing block group animate-fade-in"
    >
      <div className="relative aspect-square bg-muted overflow-hidden">
        <img
          src={listing.images[0]}
          alt={listing.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <button
          onClick={(e) => {
            e.preventDefault();
            toggle(listing.id);
          }}
          className="absolute top-2 right-2 size-9 rounded-full bg-background/90 backdrop-blur flex items-center justify-center shadow-soft active:scale-90 transition-transform"
          aria-label={isSaved ? "Remove from saved" : "Save listing"}
        >
          <Heart
            className={cn(
              "size-4",
              isSaved && "fill-destructive text-destructive",
            )}
          />
        </button>
        {listing.vendorVerified && (
          <span className="absolute top-2 left-2 badge-verified bg-background/90 backdrop-blur">
            <ShieldCheck className="size-3" /> Verified
          </span>
        )}
      </div>
      <div className="p-3 space-y-1">
        <h3 className="font-medium text-sm line-clamp-1">{listing.title}</h3>
        <p className="font-bold text-primary">{formatNaira(listing.price)}</p>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3" /> {listing.location}
        </div>
      </div>
    </Link>
  );
};
