import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  MapPin,
  ShieldCheck,
  Heart,
  Flag,
  ShieldAlert,
} from "lucide-react";
import { useStore } from "@/store/useStore";
import { formatNaira } from "@/data/seed";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils/utils";

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const listing = useStore((s) => s.listings.find((l) => l.id === id));
  const isSaved = useStore((s) => (id ? s.isSaved(id) : false));
  const toggle = useStore((s) => s.toggleSaved);
  const [activeImg, setActiveImg] = useState(0);

  if (!listing) {
    return (
      <div className="p-6 text-center">
        <p className="mb-4">Listing not found.</p>
        <Button onClick={() => navigate("/")}>Back to home</Button>
      </div>
    );
  }

  const waNumber = listing.vendorPhone.replace(/[^\d]/g, "");
  const waMsg = encodeURIComponent(
    `Hi, I'm interested in your "${listing.title}" listing on Kopa Marketplace.`,
  );

  return (
    <div className="max-w-2xl mx-auto pb-32">
      <div className="relative">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-3 left-3 z-10 size-10 rounded-full bg-background/90 backdrop-blur flex items-center justify-center shadow-soft"
        >
          <ArrowLeft className="size-4" />
        </button>
        <button
          onClick={() => toggle(listing.id)}
          className="absolute top-3 right-3 z-10 size-10 rounded-full bg-background/90 backdrop-blur flex items-center justify-center shadow-soft"
        >
          <Heart
            className={cn(
              "size-4",
              isSaved && "fill-destructive text-destructive",
            )}
          />
        </button>
        <div className="aspect-square bg-muted overflow-hidden">
          <img
            src={listing.images[activeImg]}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
        </div>
        {listing.images.length > 1 && (
          <div className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar">
            {listing.images.map((src, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={`size-16 rounded-lg overflow-hidden border-2 shrink-0 ${i === activeImg ? "border-primary" : "border-transparent"}`}
              >
                <img src={src} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 pt-4 space-y-5">
        <div>
          <h1 className="text-xl font-bold">{listing.title}</h1>
          <p className="text-2xl font-bold text-primary mt-1">
            {formatNaira(listing.price)}
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
            <MapPin className="size-3" />
            {listing.location}
          </p>
          <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
            {listing.category}
          </span>
        </div>

        <div>
          <h2 className="font-semibold mb-1 text-sm">Description</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {listing.description}
          </p>
        </div>

        <Link
          to={`/seller/${listing.sellerId}`}
          className="card-listing p-4 block hover:bg-secondary/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center font-bold">
              {listing.vendorName[0]}
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">{listing.vendorName}</p>
              {listing.vendorVerified ? (
                <span className="badge-verified">
                  <ShieldCheck className="size-3" />
                  Verified NYSC Seller
                </span>
              ) : (
                <span className="badge-pending">Unverified</span>
              )}
              <p className="text-[11px] text-primary mt-0.5">
                View seller profile →
              </p>
            </div>
          </div>
        </Link>

        <div className="flex items-start gap-3 p-3 rounded-xl bg-warning/10 border border-warning/20">
          <ShieldAlert className="size-5 text-warning shrink-0 mt-0.5" />
          <p className="text-xs text-foreground/80">
            <strong>Always meet in a safe public place.</strong> Verify the item
            before payment.
          </p>
        </div>

        <button
          onClick={() =>
            toast({
              title: "Reported",
              description: "Thanks. Our team will review this listing.",
            })
          }
          className="w-full text-xs text-muted-foreground flex items-center justify-center gap-1 py-2"
        >
          <Flag className="size-3" />
          Report this listing
        </button>
      </div>

      <div className="fixed bottom-20 inset-x-0 z-40 px-4 pb-2">
        <div className="max-w-2xl mx-auto flex gap-2">
          <a
            href={`tel:${listing.vendorPhone}`}
            className="flex-1 h-12 rounded-2xl bg-secondary text-secondary-foreground font-medium flex items-center justify-center gap-2 shadow-soft"
          >
            <Phone className="size-4" />
            Call
          </a>
          <a
            href={`https://wa.me/${waNumber}?text=${waMsg}`}
            target="_blank"
            rel="noopener"
            className="flex-1 h-12 rounded-2xl bg-gradient-primary text-primary-foreground font-medium flex items-center justify-center gap-2 shadow-elevated"
          >
            <MessageCircle className="size-4" />
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;
