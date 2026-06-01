import { useMemo, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Search, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import heroImg from "@/assets/hero.jpg";
import nyscLogo from "@/assets/kopa_logo.jpeg";
import useUser from "@/hooks/users/queries/useUser";
import useGetProductsInfinite from "@/hooks/products/queries/useGetProductsInfinite";
import { useProductFilters } from "@/hooks/products/custom/useproductfilters";
import { FilterControls } from "@/components/ui/filterControls";
import { ProductGrid } from "@/components/ui/productGrid";
import { ITEMS_PER_PAGE } from "@/lib/utils/config";



const Index = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [showFilters, setShowFilters] = useState(false);

  const {
    register,
    watchedState,
    watchedLga,
    watchedCategory,
    watchedQ,
    debouncedQ,
    handleQChange,
    handleStateChange,
    handleLgaChange,
    handleCategoryChange,
    clearFilters,
    activeFilters,
    states,
    lgas,
    categories,
    isLoadingCategories,
    queryParams,
  } = useProductFilters();

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useGetProductsInfinite({ limit: ITEMS_PER_PAGE, ...queryParams });

  const products = useMemo(
    () => data?.pages.flatMap((p) => p.data) ?? [],
    [data],
  );
  const totalCount = data?.pages[0]?.meta.totalItems ?? 0;

  // Infinite scroll sentinel
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Card entrance animations
  const gridRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!gridRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            el.classList.add("opacity-100");
            el.classList.remove("opacity-0");
            el.style.transform = "translate(0, 0)";
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.05, rootMargin: "50px" },
    );
    const cards = gridRef.current.querySelectorAll(
      ".listing-animate.opacity-0",
    );
    cards.forEach((card, index) => {
      const el = card as HTMLElement;
      el.style.transform =
        index % 4 === 0
          ? "translateY(2rem)"
          : index % 4 === 1
            ? "translateX(-2rem)"
            : index % 4 === 2
              ? "translateY(2rem)"
              : "translateX(2rem)";
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, [products]);

  const { data: user } = useUser();

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/listings?q=${encodeURIComponent(watchedQ)}`);
  };

  return (
    <div>
      {/* ── Sticky header ── */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/" className="shrink-0 flex items-center gap-2">
            <img
              src={nyscLogo}
              alt="Kopa logo"
              width={36}
              height={36}
              className="size-9 rounded-lg object-cover ring-1 ring-border"
            />
          </Link>

          <form onSubmit={onSearchSubmit} className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              {...register("q")}
              onChange={(e) => handleQChange(e.target.value)}
              placeholder="Search products, services..."
              className="pl-10 h-11 rounded-2xl bg-secondary border-0"
            />
          </form>

          {isMobile && (
            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              className={`relative shrink-0 size-11 rounded-2xl flex items-center justify-center transition-colors ${
                showFilters || activeFilters > 0
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary"
              }`}
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
              {user.profilePictureUrl ? (
                <img
                  src={user.profilePictureUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                user.firstName?.charAt(0).toUpperCase()
              )}
            </Link>
          )}
        </div>

        {isMobile && showFilters && (
          <div className="max-w-7xl mx-auto px-4 pb-3">
            <FilterControls
              compact
              watchedState={watchedState}
              watchedLga={watchedLga}
              watchedCategory={watchedCategory}
              states={states}
              lgas={lgas}
              categories={categories}
              onStateChange={handleStateChange}
              onLgaChange={handleLgaChange}
              onCategoryChange={handleCategoryChange}
              onClearFilters={clearFilters}
              activeFilters={activeFilters}
            />
          </div>
        )}

        {(!isMobile || !showFilters) && (
          <div className="max-w-7xl mx-auto px-4 pb-2">
            <p className="text-[11px] text-muted-foreground">
              Supporting the youth
            </p>
          </div>
        )}
      </header>

      <div className="max-w-7xl mx-auto px-4 pt-4 space-y-6">
        {/* ── Hero ── */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-hero text-primary-foreground shadow-elevated">
          <div className="flex items-center">
            <div className="relative z-10 p-5 flex-1 max-w-[60%] md:max-w-[50%]">
              <p className="text-xs font-medium opacity-90 mb-1">
                Trusted by Corpers 🇳🇬
              </p>
              <h1 className="text-xl md:text-2xl font-bold leading-tight mb-3">
                Buy &amp; Sell Easily as a Corper
              </h1>
              <button
                type="button"
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

        {/* ── Categories ── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Categories</h2>
            <Link to="/listings" className="text-xs text-primary font-medium">
              See all
            </Link>
          </div>
          {isMobile ? (
            <div className="overflow-hidden relative">
              <div className="flex gap-3 animate-marquee">
                {isLoadingCategories ? (
                  <Loader2 className="mx-auto size-12 animate-spin text-primary" />
                ) : (
                  [...categories, ...categories].map(
                    (c: { name: string; icon: string }, i: number) => (
                      <Link
                        key={`${c.name}-${i}`}
                        to={`/listings?category=${encodeURIComponent(c.name)}`}
                        className="flex flex-col items-center gap-2 w-[72px] shrink-0"
                      >
                        <div className="size-16 rounded-2xl bg-secondary flex items-center justify-center text-2xl">
                          {c.icon}
                        </div>
                        <span className="text-[11px] text-center leading-tight">
                          {c.name}
                        </span>
                      </Link>
                    ),
                  )
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {isLoadingCategories ? (
                <Loader2 className="mx-auto size-12 animate-spin text-primary" />
              ) : (
                categories.map((c: { name: string; icon: string }) => (
                  <Link
                    key={c.name}
                    to={`/listings?category=${encodeURIComponent(c.name)}`}
                    className="flex flex-col items-center gap-2 w-[72px]"
                  >
                    <div className="size-16 rounded-2xl bg-secondary flex items-center justify-center text-2xl hover:scale-105 transition-transform">
                      {c.icon}
                    </div>
                    <span className="text-[11px] text-center leading-tight">
                      {c.name}
                    </span>
                  </Link>
                ))
              )}
            </div>
          )}
        </section>

        {/* ── Safety tip ── */}
        <div className="flex items-start gap-3 p-3 rounded-xl bg-warning/10 border border-warning/20">
          <ShieldCheck className="size-5 text-warning shrink-0 mt-0.5" />
          <p className="text-xs text-foreground/80">
            <strong>Stay safe:</strong> Always meet sellers in a safe public
            place. Verify items before paying.
          </p>
        </div>

        {/* ── Latest listings ── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-semibold">Latest listings</h2>
              {!isLoading && totalCount > 0 && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {totalCount.toLocaleString()}{" "}
                  {totalCount === 1 ? "listing" : "listings"}
                  {(debouncedQ || activeFilters > 0) && " found"}
                </p>
              )}
            </div>
            <Link to="/listings" className="text-xs text-primary font-medium">
              View all
            </Link>
          </div>

          {!isMobile ? (
            <div className="flex gap-6">
              <aside className="w-[200px] shrink-0 space-y-3 sticky top-24 self-start">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Filters
                </p>
                <FilterControls
                  watchedState={watchedState}
                  watchedLga={watchedLga}
                  watchedCategory={watchedCategory}
                  states={states}
                  lgas={lgas}
                  categories={categories}
                  onStateChange={handleStateChange}
                  onLgaChange={handleLgaChange}
                  onCategoryChange={handleCategoryChange}
                  onClearFilters={clearFilters}
                  activeFilters={activeFilters}
                />
              </aside>

              <div className="flex-1">
                <ProductGrid
                  products={products}
                  isLoading={isLoading}
                  isFetchingNextPage={isFetchingNextPage}
                  hasNextPage={hasNextPage}
                  activeFilters={activeFilters}
                  onClearFilters={clearFilters}
                  gridRef={gridRef}
                  sentinelRef={sentinelRef}
                  cols={4}
                />
              </div>
            </div>
          ) : (
            <ProductGrid
              products={products}
              isLoading={isLoading}
              isFetchingNextPage={isFetchingNextPage}
              hasNextPage={hasNextPage}
              activeFilters={activeFilters}
              onClearFilters={clearFilters}
              gridRef={gridRef}
              sentinelRef={sentinelRef}
              cols={2}
            />
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
