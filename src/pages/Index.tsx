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
import { SellerCTA } from "@/components/ui/sellerCta";

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
    useGetProductsInfinite({
      limit: ITEMS_PER_PAGE,
      ...queryParams,
    });

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
  // useEffect(() => {
  //   if (!gridRef.current) return;
  //   const observer = new IntersectionObserver(
  //     (entries) => {
  //       entries.forEach((entry) => {
  //         if (entry.isIntersecting) {
  //           const el = entry.target as HTMLElement;
  //           el.classList.add("opacity-100");
  //           el.classList.remove("opacity-0");
  //           el.style.transform = "translate(0, 0)";
  //           observer.unobserve(el);
  //         }
  //       });
  //     },
  //     { threshold: 0.05, rootMargin: "50px" },
  //   );
  //   const cards = gridRef.current.querySelectorAll(
  //     ".listing-animate.opacity-0",
  //   );
  //   cards.forEach((card, index) => {
  //     const el = card as HTMLElement;
  //     el.style.transform =
  //       index % 4 === 0
  //         ? "translateY(2rem)"
  //         : index % 4 === 1
  //           ? "translateX(-2rem)"
  //           : index % 4 === 2
  //             ? "translateY(2rem)"
  //             : "translateX(2rem)";
  //     observer.observe(el);
  //   });
  //   return () => observer.disconnect();
  // }, [products]);

  const { data: user } = useUser();
  const sellerStatus = user?.sellerOnboarding?.status ?? null;

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/listings?q=${encodeURIComponent(watchedQ)}`);
  };

  return (
    <div>
      {/* ── Sticky header ── */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur border-border">
        <div className="flex items-center gap-3 px-4 py-3 mx-auto max-w-7xl">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img
              src={nyscLogo}
              alt="Kopa logo"
              width={36}
              height={36}
              className="object-cover rounded-lg size-9 ring-1 ring-border"
            />
          </Link>

          <form onSubmit={onSearchSubmit} className="relative flex-1">
            <Search className="absolute -translate-y-1/2 left-3 top-1/2 size-4 text-muted-foreground" />
            <Input
              {...register("q")}
              onChange={(e) => handleQChange(e.target.value)}
              placeholder="Search products, services..."
              className="pl-10 border-0 h-11 rounded-2xl bg-secondary"
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
              className="text-sm font-medium shrink-0 text-primary"
            >
              Sign in
            </Link>
          ) : (
            <Link
              to="/profile"
              className="flex items-center justify-center overflow-hidden text-sm font-bold rounded-full shrink-0 size-9 bg-secondary text-secondary-foreground"
            >
              {user.profilePictureUrl ? (
                <img
                  src={user.profilePictureUrl}
                  alt=""
                  className="object-cover w-full h-full"
                />
              ) : (
                user.firstName?.charAt(0).toUpperCase()
              )}
            </Link>
          )}
        </div>

        {isMobile && showFilters && (
          <div className="px-4 pb-3 mx-auto max-w-7xl">
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
          <div className="px-4 pb-2 mx-auto max-w-7xl">
            <p className="text-[11px] text-muted-foreground">
              Supporting the youth
            </p>
          </div>
        )}
      </header>

      <div className="px-4 pt-4 mx-auto space-y-6 max-w-7xl">
        {/* ── Hero ── */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-hero text-primary-foreground shadow-elevated">
          <div className="flex items-center">
            <div className="relative z-10 p-5 flex-1 max-w-[60%] md:max-w-[50%]">
              <p className="mb-1 text-xs font-medium opacity-90">
                Trusted by Corpers 🇳🇬
              </p>
              <h1 className="mb-3 text-xl font-bold leading-tight md:text-2xl">
                Buy &amp; Sell Easily as a Corper
              </h1>
              {/* <button
                type="button"
                onClick={() => navigate("/seller-onboarding/intro")}
                className="px-4 py-2 text-sm font-semibold transition-shadow rounded-full bg-background text-foreground shadow-soft hover:shadow-elevated"
              >
                Become a Seller →
              </button> */}
              <SellerCTA status={sellerStatus} />
            </div>
            <div className="relative flex-1 h-48 md:h-56">
              <img
                src={heroImg}
                alt="NYSC corps members shopping"
                className="absolute inset-0 object-cover object-center w-full h-full opacity-70 rounded-r-3xl"
              />
            </div>
          </div>
        </section>

        {/* ── Categories ── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Categories</h2>
            <Link to="/listings" className="text-xs font-medium text-primary">
              See all
            </Link>
          </div>
          {isMobile ? (
            <div className="relative overflow-hidden">
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
                        <div className="flex items-center justify-center text-2xl size-16 rounded-2xl bg-secondary">
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
                    <div className="flex items-center justify-center text-2xl transition-transform size-16 rounded-2xl bg-secondary hover:scale-105">
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
        <div className="flex items-start gap-3 p-3 border rounded-xl bg-warning/10 border-warning/20">
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
            <Link to="/listings" className="text-xs font-medium text-primary">
              View all
            </Link>
          </div>

          {!isMobile ? (
            <div className="flex gap-6">
              <aside className="w-[200px] shrink-0 space-y-3 sticky top-24 self-start">
                <p className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
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

        <footer className="pt-6 pb-2 text-xs text-center text-muted-foreground">
          © Kopa Marketplace · Supporting the youth
        </footer>
      </div>
    </div>
  );
};

export default Index;
