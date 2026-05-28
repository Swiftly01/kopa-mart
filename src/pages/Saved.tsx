import { Link } from "react-router-dom";
import { useStore } from "@/store/useStore";
import { ListingCard } from "@/components/ListingCard";
import { Heart } from "lucide-react";

const Saved = () => {
  const listings = useStore((s) => s.listings);
  const saved = useStore((s) => s.saved);
  const uid = useStore((s) => s.currentUserId) ?? "guest";
  const ids = saved[uid] ?? [];
  const items = listings.filter((l) => ids.includes(l.id));

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 space-y-4">
      <h1 className="font-bold text-lg">Saved listings</h1>
      {items.length === 0 ? (
        <div className="text-center py-20 space-y-2">
          <Heart className="size-12 mx-auto text-muted-foreground"/>
          <p className="text-sm text-muted-foreground">No saved items yet.</p>
          <Link to="/listings" className="inline-block text-primary text-sm font-medium">Browse listings →</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {items.map((l) => <ListingCard key={l.id} listing={l}/>)}
        </div>
      )}
    </div>
  );
};

export default Saved;
