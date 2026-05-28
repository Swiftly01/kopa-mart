import { useState, useMemo } from "react";
import { useStore, useCurrentUser, isSuperAdmin } from "@/store/useStore";
import { AdminShell } from "@/components/AdminShell";
import { formatNaira } from "@/data/seed";
import { Trash2, Search, Pin, PinOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const AdminListings = () => {
  const user = useCurrentUser();
  const listings = useStore((s) => s.listings);
  const pinned = useStore((s) => s.pinned);
  const del = useStore((s) => s.deleteListing);
  const togglePin = useStore((s) => s.togglePinListing);
  const [q, setQ] = useState("");
  const canPin = isSuperAdmin(user);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    const sorted = [...listings].sort((a, b) => {
      const ap = pinned.includes(a.id) ? 1 : 0;
      const bp = pinned.includes(b.id) ? 1 : 0;
      if (ap !== bp) return bp - ap;
      return b.createdAt - a.createdAt;
    });
    if (!t) return sorted;
    return sorted.filter((l) => l.title.toLowerCase().includes(t) || l.vendorName.toLowerCase().includes(t) || l.location.toLowerCase().includes(t) || l.category.toLowerCase().includes(t));
  }, [listings, pinned, q]);

  return (
    <AdminShell>
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"/>
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search listings, sellers..." className="pl-10 h-11 rounded-2xl bg-secondary border-0"/>
      </div>
      <p className="text-xs text-muted-foreground mb-2">{filtered.length} listings · {pinned.length} pinned</p>
      <div className="space-y-2">
        {filtered.map((l) => {
          const isPinned = pinned.includes(l.id);
          return (
            <div key={l.id} className={`card-listing p-3 flex gap-3 ${isPinned ? "ring-1 ring-primary/30" : ""}`}>
              <Link to={`/listing/${l.id}`}><img src={l.images[0]} alt="" className="size-16 rounded-lg object-cover"/></Link>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm line-clamp-1">{l.title} {isPinned && <span className="text-[10px] text-primary">· pinned</span>}</p>
                <p className="text-primary font-bold text-sm">{formatNaira(l.price)}</p>
                <p className="text-[11px] text-muted-foreground">{l.vendorName} · {l.location} · {l.category}</p>
              </div>
              <div className="flex flex-col gap-1.5 self-center">
                {canPin && (
                  <button onClick={() => { togglePin(l.id); toast({ title: isPinned ? "Unpinned" : "Pinned to top" }); }} className={`size-8 rounded-lg flex items-center justify-center ${isPinned ? "bg-primary text-primary-foreground" : "bg-secondary"}`} title={isPinned ? "Unpin" : "Pin to top"}>
                    {isPinned ? <PinOff className="size-3.5"/> : <Pin className="size-3.5"/>}
                  </button>
                )}
                <button onClick={() => { del(l.id); toast({ title: "Listing deleted" }); }} className="size-8 rounded-lg bg-destructive/15 text-destructive flex items-center justify-center"><Trash2 className="size-3.5"/></button>
              </div>
            </div>
          );
        })}
      </div>
    </AdminShell>
  );
};

export default AdminListings;
