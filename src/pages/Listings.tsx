import { useMemo, useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Search, X, SlidersHorizontal } from "lucide-react";
import { useStore } from "@/store/useStore";
import { ListingCard } from "@/components/ListingCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";

const Listings = () => {
  const [params, setParams] = useSearchParams();
  const isMobile = useIsMobile();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [cat, setCat] = useState(params.get("category") ?? "");
  const [loc, setLoc] = useState(params.get("location") ?? "");
  const [selState, setSelState] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const listings = useStore((s) => s.listings);
  const pinned = useStore((s) => s.pinned);
  const categories = useStore((s) => s.categories);
  const states = useStore((s) => s.states);
  const lgas = useStore((s) => s.lgas);
  const allLgas = useMemo(() => {
    if (selState) return lgas[selState] ?? [];
    return states.flatMap((s) => lgas[s] ?? []);
  }, [states, lgas, selState]);

  const filtered = useMemo(() => {
    const pinnedSet = new Set(pinned);
    const term = q.trim().toLowerCase();
    const sorted = [...listings].sort((a, b) => {
      const ap = pinnedSet.has(a.id) ? 1 : 0;
      const bp = pinnedSet.has(b.id) ? 1 : 0;
      if (ap !== bp) return bp - ap;
      return b.createdAt - a.createdAt;
    });
    return sorted
      .filter((l) => !cat || l.category === cat)
      .filter((l) => !loc || l.location === loc)
      .filter(
        (l) =>
          !term ||
          l.title.toLowerCase().includes(term) ||
          l.location.toLowerCase().includes(term) ||
          l.description.toLowerCase().includes(term),
      );
  }, [listings, pinned, q, cat, loc]);

  const sync = (next: { cat?: string; loc?: string; q?: string }) => {
    const p = new URLSearchParams(params);
    const c = next.cat ?? cat; c ? p.set("category", c) : p.delete("category");
    const l = next.loc ?? loc; l ? p.set("location", l) : p.delete("location");
    const qq = next.q ?? q; qq ? p.set("q", qq) : p.delete("q");
    setParams(p, { replace: true });
  };

  const activeCount = (cat ? 1 : 0) + (loc ? 1 : 0) + (selState ? 1 : 0);

  const gridRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in");
            entry.target.classList.remove("opacity-0");
            (entry.target as HTMLElement).style.transform = "translate(0, 0)";
          }
        });
      },
      { threshold: 0.1, rootMargin: "50px" }
    );
    const cards = gridRef.current?.querySelectorAll(".listing-animate");
    cards?.forEach((card, index) => {
      const el = card as HTMLElement;
      el.classList.add("opacity-0");
      el.classList.remove("animate-fade-in");
      el.style.transform = index % 4 === 0 ? "translateY(1.5rem)" : index % 4 === 1 ? "translateX(-1.5rem)" : index % 4 === 2 ? "translateY(1.5rem)" : "translateX(1.5rem)";
    });
    cards?.forEach((c) => observer.observe(c));
    return () => observer.disconnect();
  }, [filtered, isMobile]);

  const filterControls = (
    <>
      <Select value={selState} onValueChange={(v) => { setSelState(v === "__all__" ? "" : v); setLoc(""); sync({ loc: "" }); }}>
        <SelectTrigger className="h-8 w-full md:w-auto text-xs rounded-full bg-secondary border-0">
          <SelectValue placeholder="State" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">All States</SelectItem>
          {states.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={loc} onValueChange={(v) => { const val = v === "__all__" ? "" : v; setLoc(val); sync({ loc: val }); }}>
        <SelectTrigger className="h-8 w-full md:w-auto text-xs rounded-full bg-secondary border-0">
          <SelectValue placeholder="Location" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">All Locations</SelectItem>
          {allLgas.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={cat} onValueChange={(v) => { const val = v === "__all__" ? "" : v; setCat(val); sync({ cat: val }); }}>
        <SelectTrigger className="h-8 w-full md:w-auto text-xs rounded-full bg-secondary border-0">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">All Categories</SelectItem>
          {categories.map((c) => <SelectItem key={c.name} value={c.name}>{c.emoji} {c.name}</SelectItem>)}
        </SelectContent>
      </Select>
      {activeCount > 0 && (
        <button onClick={() => { setCat(""); setLoc(""); setSelState(""); sync({ cat: "", loc: "" }); }} className="text-[11px] text-primary font-medium flex items-center gap-1">
          <X className="size-3"/>Clear filters
        </button>
      )}
    </>
  );

  return (
    <div>
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2">
          <Link to="/" className="size-9 rounded-full bg-secondary flex items-center justify-center shrink-0"><ArrowLeft className="size-4"/></Link>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => { setQ(e.target.value); sync({ q: e.target.value }); }} placeholder="Search..." className="pl-10 h-11 rounded-2xl bg-secondary border-0" />
          </div>
          {isMobile && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`shrink-0 size-11 rounded-2xl flex items-center justify-center relative transition-colors ${showFilters || activeCount > 0 ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
            >
              <SlidersHorizontal className="size-4"/>
              {activeCount > 0 && !showFilters && (
                <span className="absolute -top-1 -right-1 size-4 rounded-full bg-destructive text-destructive-foreground text-[9px] flex items-center justify-center">{activeCount}</span>
              )}
            </button>
          )}
        </div>

        {/* Mobile: toggled filters */}
        {isMobile && showFilters && (
          <div className="max-w-7xl mx-auto px-4 pb-3 flex flex-wrap items-center gap-2">
            {filterControls}
          </div>
        )}
      </header>

      <div className="max-w-7xl mx-auto px-4 pt-4 space-y-3">
        <p className="text-xs text-muted-foreground">{filtered.length} results</p>

        {!isMobile ? (
          <div className="flex gap-6">
            <aside className="w-[200px] shrink-0 space-y-3 sticky top-24 self-start">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Filters</p>
              {filterControls}
            </aside>
            <div className="flex-1">
              <div ref={gridRef} className="grid grid-cols-4 gap-3">
                {filtered.map((l, i) => (
                  <div key={l.id} className="listing-animate opacity-0 transition-all duration-500" style={{ transitionDelay: `${(i % 4) * 80}ms` }}>
                    <ListingCard listing={l} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div ref={gridRef} className="grid grid-cols-2 gap-3">
            {filtered.map((l, i) => (
              <div key={l.id} className="listing-animate opacity-0 transition-all duration-500" style={{ transitionDelay: `${(i % 2) * 80}ms` }}>
                <ListingCard listing={l} />
              </div>
            ))}
          </div>
        )}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground text-sm">No listings match your filters.</div>
        )}
      </div>
    </div>
  );
};

export default Listings;
