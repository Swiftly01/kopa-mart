import { useParams, Link } from "react-router-dom";
import { useStore } from "@/store/useStore";
import { ListingCard } from "@/components/ListingCard";
import { ArrowLeft, MapPin, ShieldCheck, MessageCircle, Phone } from "lucide-react";

const SellerProfile = () => {
  const { id } = useParams();
  const users = useStore((s) => s.users);
  const listings = useStore((s) => s.listings);
  const seller = users.find((u) => u.id === id);
  // Fallback for seed sellers (no user account) — derive from listings
  const sellerListings = listings.filter((l) => l.sellerId === id);
  const fallback = sellerListings[0];

  if (!seller && !fallback) {
    return (
      <div className="p-10 text-center text-sm text-muted-foreground">
        Seller not found. <Link to="/" className="text-primary">Go home</Link>
      </div>
    );
  }

  const name = seller?.storeProfile?.storeName ?? seller?.name ?? fallback?.vendorName ?? "Seller";
  const phone = seller?.storeProfile?.whatsapp ?? seller?.phone ?? fallback?.vendorPhone ?? "";
  const location = seller?.storeProfile?.lga ?? fallback?.location ?? "";
  const avatar = seller?.storeProfile?.logo ?? seller?.avatar;
  const verified = seller?.status === "verified" || !!fallback?.vendorVerified;

  const wa = phone.replace(/[^\d]/g, "");

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-10 space-y-5">
      <div className="flex items-center gap-2">
        <Link to="/" className="size-9 rounded-full bg-secondary flex items-center justify-center"><ArrowLeft className="size-4"/></Link>
        <h1 className="font-bold">Seller profile</h1>
      </div>

      <div className="card-listing p-5 flex items-center gap-4">
        <div className="size-16 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center text-2xl font-bold overflow-hidden">
          {avatar ? <img src={avatar} alt="" className="w-full h-full object-cover"/> : name[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-lg truncate">{name}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="size-3"/>{location || "—"}</p>
          {verified && <span className="badge-verified mt-1"><ShieldCheck className="size-3"/>Verified NYSC Seller</span>}
        </div>
      </div>

      {phone && (
        <div className="flex gap-2">
          <a href={`tel:${phone}`} className="flex-1 h-11 rounded-2xl bg-secondary text-secondary-foreground font-medium flex items-center justify-center gap-2"><Phone className="size-4"/>Call</a>
          <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener" className="flex-1 h-11 rounded-2xl bg-gradient-primary text-primary-foreground font-medium flex items-center justify-center gap-2"><MessageCircle className="size-4"/>WhatsApp</a>
        </div>
      )}

      <div>
        <h2 className="font-semibold mb-2 text-sm">{sellerListings.length} listings</h2>
        {sellerListings.length === 0 ? (
          <p className="text-sm text-muted-foreground">No listings yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {sellerListings.map((l) => <ListingCard key={l.id} listing={l}/>)}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerProfile;
