import { useMemo, useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ShieldCheck, SlidersHorizontal, X } from "lucide-react";
import { useStore, useCurrentUser } from "@/store/useStore";
import { ListingCard } from "@/components/ListingCard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import heroImg from "@/assets/hero.jpg";
import nyscLogo from "@/assets/kopa_logo.jpeg";
import { useIsMobile } from "@/hooks/use-mobile";
import useUser from "@/hooks/users/queries/useUser";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const listings = useStore((s) => s.listings);
  const pinned = useStore((s) => s.pinned);
  const categories = useStore((s) => s.categories);
  const states = useStore((s) => s.states);
  const lgas = useStore((s) => s.lgas);
  //const user = useCurrentUser();
  const [q, setQ] = useState("");
  const [selCat, setSelCat] = useState("");
  const [selState, setSelState] = useState("");
  const [selLga, setSelLga] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const allLgas = useMemo(() => {
    if (selState) return lgas[selState] ?? [];
    return states.flatMap((s) => lgas[s] ?? []);
  }, [states, lgas, selState]);

  const ordered = useMemo(() => {
    const pinnedSet = new Set(pinned);
    const pinnedItems = pinned
      .map((id) => listings.find((l) => l.id === id))
      .filter(Boolean) as typeof listings;
    const rest = [...listings]
      .filter((l) => !pinnedSet.has(l.id))
      .sort((a, b) => b.createdAt - a.createdAt);
    return [...pinnedItems, ...rest];
  }, [listings, pinned]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return ordered
      .filter(
        (l) =>
          (!term ||
            l.title.toLowerCase().includes(term) ||
            l.location.toLowerCase().includes(term) ||
            l.category.toLowerCase().includes(term)) &&
          (!selCat || l.category === selCat) &&
          (!selLga || l.location === selLga),
      )
      .slice(0, 50);
  }, [ordered, q, selCat, selLga]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (selCat) p.set("category", selCat);
    if (selLga) p.set("location", selLga);
    navigate(`/listings?${p.toString()}`);
  };

  const activeFilters =
    (selCat ? 1 : 0) + (selLga ? 1 : 0) + (selState ? 1 : 0);

  // Alternating scroll animation directions
  const getAnimDirection = (i: number) => {
    const dirs = [
      "translate-y-8",
      "-translate-x-8",
      "translate-y-8",
      "translate-x-8",
    ];
    return dirs[i % 4];
  };

  const gridRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            el.classList.add("opacity-100");
            el.classList.remove("opacity-0");
            el.style.transform = "translate(0, 0)";
          }
        });
      },
      { threshold: 0.05, rootMargin: "50px" },
    );
    const cards = gridRef.current?.querySelectorAll(".listing-animate");
    cards?.forEach((card, index) => {
      const el = card as HTMLElement;
      el.classList.add("opacity-0");
      el.classList.remove("opacity-100");
      el.style.transform =
        index % 4 === 0
          ? "translateY(2rem)"
          : index % 4 === 1
            ? "translateX(-2rem)"
            : index % 4 === 2
              ? "translateY(2rem)"
              : "translateX(2rem)";
    });
    cards?.forEach((c) => observer.observe(c));
    return () => observer.disconnect();
  }, [filtered, isMobile]);

  const filterSection = (
    <div className="space-y-2">
      <Select
        value={selState}
        onValueChange={(v) => {
          setSelState(v === "__all__" ? "" : v);
          setSelLga("");
        }}
      >
        <SelectTrigger className="h-9 text-xs rounded-full bg-secondary border-0">
          <SelectValue placeholder="State" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">All States</SelectItem>
          {states.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={selLga}
        onValueChange={(v) => setSelLga(v === "__all__" ? "" : v)}
      >
        <SelectTrigger className="h-9 text-xs rounded-full bg-secondary border-0">
          <SelectValue placeholder="Location" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">All Locations</SelectItem>
          {allLgas.map((l) => (
            <SelectItem key={l} value={l}>
              {l}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={selCat}
        onValueChange={(v) => setSelCat(v === "__all__" ? "" : v)}
      >
        <SelectTrigger className="h-9 text-xs rounded-full bg-secondary border-0">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">All Categories</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.name} value={c.name}>
              {c.emoji} {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {activeFilters > 0 && (
        <button
          onClick={() => {
            setSelCat("");
            setSelLga("");
            setSelState("");
          }}
          className="text-[11px] text-primary font-medium flex items-center gap-1"
        >
          <X className="size-3" />
          Clear filters
        </button>
      )}
    </div>
  );

  const { data: user, isLoading } = useUser();

  return (
    <div>
      {/* Sticky search header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/" className="shrink-0 flex items-center gap-2">
            <img
              src={nyscLogo}
              alt="NYSC logo"
              width={36}
              height={36}
              className="size-9 rounded-lg object-cover ring-1 ring-border"
            />
          </Link>
          <form onSubmit={submit} className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products, services..."
              className="pl-10 h-11 rounded-2xl bg-secondary border-0"
            />
          </form>
          {/* Filter toggle button (mobile) */}
          {isMobile && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`shrink-0 size-11 rounded-2xl flex items-center justify-center transition-colors ${showFilters || activeFilters > 0 ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
            >
              <SlidersHorizontal className="size-4" />
              {activeFilters > 0 && !showFilters && (
                <span className="absolute -top-1 -right-1 size-4 rounded-full bg-destructive text-destructive-foreground text-[9px] flex items-center justify-center">
                  {activeFilters}
                </span>
              )}
            </button>
          )}
          {!user ? (
            <Link
              to="/login"
              className="shrink-0 text-sm font-medium text-primary"
            >
              Sign in
            </Link>
          ) : (
            <Link
              to="/profile"
              className="shrink-0 size-9 rounded-full bg-secondary flex items-center justify-center text-sm font-bold text-secondary-foreground overflow-hidden"
            >
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                user.firstName?.toUpperCase()
              )}
            </Link>
          )}
        </div>
        {/* Mobile filter dropdown */}
        {isMobile && showFilters && (
          <div className="max-w-7xl mx-auto px-4 pb-3">
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={selState}
                onValueChange={(v) => {
                  setSelState(v === "__all__" ? "" : v);
                  setSelLga("");
                }}
              >
                <SelectTrigger className="h-8 w-[120px] text-xs rounded-full bg-secondary border-0">
                  <SelectValue placeholder="State" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All States</SelectItem>
                  {states.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={selLga}
                onValueChange={(v) => setSelLga(v === "__all__" ? "" : v)}
              >
                <SelectTrigger className="h-8 w-[130px] text-xs rounded-full bg-secondary border-0">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All Locations</SelectItem>
                  {allLgas.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={selCat}
                onValueChange={(v) => setSelCat(v === "__all__" ? "" : v)}
              >
                <SelectTrigger className="h-8 w-[140px] text-xs rounded-full bg-secondary border-0">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All Categories</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.name} value={c.name}>
                      {c.emoji} {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {activeFilters > 0 && (
                <button
                  onClick={() => {
                    setSelCat("");
                    setSelLga("");
                    setSelState("");
                  }}
                  className="text-[11px] text-primary font-medium flex items-center gap-1"
                >
                  <X className="size-3" />
                  Clear
                </button>
              )}
            </div>
          </div>
        )}
        {/* Desktop: "Supporting the youth" */}
        {!isMobile && (
          <div className="max-w-7xl mx-auto px-4 pb-2">
            <p className="text-[11px] text-muted-foreground">
              Supporting the youth
            </p>
          </div>
        )}
        {isMobile && !showFilters && (
          <div className="max-w-7xl mx-auto px-4 pb-2">
            <p className="text-[11px] text-muted-foreground">
              Supporting the youth
            </p>
          </div>
        )}
      </header>

      <div className="max-w-7xl mx-auto px-4 pt-4 space-y-6">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-hero text-primary-foreground shadow-elevated">
          <div className="flex items-center">
            <div className="relative z-10 p-5 flex-1 max-w-[60%] md:max-w-[50%]">
              <p className="text-xs font-medium opacity-90 mb-1">
                Trusted by Corpers 🇳🇬
              </p>
              <h1 className="text-xl md:text-2xl font-bold leading-tight mb-3">
                Buy & Sell Easily as a Corper
              </h1>
              <button
                onClick={() => navigate("/seller-onboarding/intro")}
                className="bg-background text-foreground text-sm font-semibold px-4 py-2 rounded-full shadow-soft hover:shadow-elevated transition-shadow"
              >
                Become a Seller →
              </button>
            </div>
            <div className="flex-1 relative h-48 md:h-56">
              <img
                src={heroImg}
                alt="NYSC corps members shopping"
                className="absolute inset-0 w-full h-full object-cover object-center opacity-70 rounded-r-3xl"
              />
            </div>
          </div>
        </section>

        {/* Categories */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Categories</h2>
            <Link to="/listings" className="text-xs text-primary font-medium">
              See all
            </Link>
          </div>
          {isMobile ? (
            /* Mobile: auto-scrolling marquee */
            <div className="overflow-hidden relative">
              <div className="flex gap-3 animate-marquee">
                {[...categories, ...categories].map((c, i) => (
                  <Link
                    key={`${c.name}-${i}`}
                    to={`/listings?category=${encodeURIComponent(c.name)}`}
                    className="flex flex-col items-center gap-2 w-[72px] shrink-0"
                  >
                    <div className="size-16 rounded-2xl bg-secondary flex items-center justify-center text-2xl">
                      {c.emoji}
                    </div>
                    <span className="text-[11px] text-center leading-tight">
                      {c.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            /* Desktop: wrap into rows */
            <div className="flex flex-wrap gap-3">
              {categories.map((c) => (
                <Link
                  key={c.name}
                  to={`/listings?category=${encodeURIComponent(c.name)}`}
                  className="flex flex-col items-center gap-2 w-[72px]"
                >
                  <div className="size-16 rounded-2xl bg-secondary flex items-center justify-center text-2xl hover:scale-105 transition-transform">
                    {c.emoji}
                  </div>
                  <span className="text-[11px] text-center leading-tight">
                    {c.name}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Safety banner */}
        <div className="flex items-start gap-3 p-3 rounded-xl bg-warning/10 border border-warning/20">
          <ShieldCheck className="size-5 text-warning shrink-0 mt-0.5" />
          <p className="text-xs text-foreground/80">
            <strong>Stay safe:</strong> Always meet sellers in a safe public
            place. Verify items before paying.
          </p>
        </div>

        {/* Desktop: sidebar filters + grid | Mobile: just grid */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Latest listings</h2>
            <Link to="/listings" className="text-xs text-primary font-medium">
              View all
            </Link>
          </div>

          {!isMobile ? (
            <div className="flex gap-6">
              {/* Desktop sidebar filters */}
              <aside className="w-[200px] shrink-0 space-y-3 sticky top-24 self-start">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Filters
                </p>
                {filterSection}
              </aside>
              <div className="flex-1">
                <div ref={gridRef} className="grid grid-cols-4 gap-3">
                  {filtered.map((l, i) => (
                    <div
                      key={l.id}
                      className={`listing-animate opacity-0 transition-all duration-700 ease-out`}
                      style={{
                        transform:
                          i % 4 === 0
                            ? "translateY(2rem)"
                            : i % 4 === 1
                              ? "translateX(-2rem)"
                              : i % 4 === 2
                                ? "translateY(2rem)"
                                : "translateX(2rem)",
                        transitionDelay: `${(i % 4) * 80}ms`,
                      }}
                    >
                      <ListingCard listing={l} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div ref={gridRef} className="grid grid-cols-2 gap-3">
              {filtered.map((l, i) => (
                <div
                  key={l.id}
                  className={`listing-animate opacity-0 transition-all duration-700 ease-out`}
                  style={{
                    transform:
                      i % 4 === 0
                        ? "translateY(2rem)"
                        : i % 4 === 1
                          ? "translateX(-2rem)"
                          : i % 4 === 2
                            ? "translateY(2rem)"
                            : "translateX(2rem)",
                    transitionDelay: `${(i % 2) * 100}ms`,
                  }}
                >
                  <ListingCard listing={l} />
                </div>
              ))}
            </div>
          )}
          {filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground text-sm">
              No listings match your filters.
            </div>
          )}
        </section>

        <footer className="pt-6 pb-2 text-center text-xs text-muted-foreground">
          © Kopa Marketplace · Supporting the youth
        </footer>
      </div>
    </div>
  );
};

export default Index;
