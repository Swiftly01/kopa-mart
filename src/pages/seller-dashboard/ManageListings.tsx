import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useStore, useCurrentUser } from "@/store/useStore";
import { SellerShell } from "@/components/SellerShell";
import { formatNaira } from "@/data/seed";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Pencil, Plus, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const ManageListings = () => {
  const user = useCurrentUser();
  const allListings = useStore((s) => s.listings);
  const del = useStore((s) => s.deleteListing);
  const [q, setQ] = useState("");

  const mine = useMemo(() => allListings.filter((l) => l.sellerId === user?.id), [allListings, user?.id]);
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return mine;
    return mine.filter((l) => l.title.toLowerCase().includes(t) || l.category.toLowerCase().includes(t) || l.location.toLowerCase().includes(t));
  }, [mine, q]);

  return (
    <SellerShell>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-muted-foreground"><span className="font-bold text-foreground text-base">{mine.length}</span> total listings</p>
        <Button asChild size="sm" className="bg-gradient-primary"><Link to="/seller-dashboard/create-listing"><Plus className="size-3.5 mr-1"/>Add new</Link></Button>
      </div>
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"/>
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search your listings..." className="pl-10 h-11 rounded-2xl bg-secondary border-0"/>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <p className="text-sm text-muted-foreground">{mine.length === 0 ? "No listings yet." : "No matches."}</p>
          {mine.length === 0 && <Button asChild className="bg-gradient-primary"><Link to="/seller-dashboard/create-listing"><Plus className="size-4 mr-1"/>Create your first listing</Link></Button>}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((l) => (
            <div key={l.id} className="card-listing p-3 flex gap-3">
              <img src={l.images[0]} alt={l.title} className="size-20 rounded-lg object-cover"/>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm line-clamp-1">{l.title}</p>
                <p className="text-primary font-bold text-sm">{formatNaira(l.price)}</p>
                <p className="text-xs text-muted-foreground">{l.location} · {l.category}</p>
              </div>
              <div className="flex flex-col gap-1.5">
                <Link to={`/seller-dashboard/edit-listing/${l.id}`} className="size-8 rounded-lg bg-secondary flex items-center justify-center"><Pencil className="size-3.5"/></Link>
                <button onClick={() => { del(l.id); toast({ title: "Listing deleted" }); }} className="size-8 rounded-lg bg-destructive/15 text-destructive flex items-center justify-center"><Trash2 className="size-3.5"/></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </SellerShell>
  );
};

export default ManageListings;
