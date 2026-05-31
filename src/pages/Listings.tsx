
import { useMemo, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import useGetProductsInfinite from "@/hooks/products/queries/useGetProductsInfinite";
import { useProductFilters } from "@/hooks/products/custom/useproductfilters";
import { FilterControls } from "@/components/ui/filterControls";
import { ProductGrid } from "@/components/ui/productGrid";

const ITEMS_PER_PAGE = 20;

const Listings = () => {
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
    const cards = gridRef.current.querySelectorAll(".listing-animate.opacity-0");
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

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // already filtering in place — nothing extra needed
  };

  return (
    <div>
      {/* ── Sticky header ── */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2">
          <Link
            to="/"
            className="size-9 rounded-full bg-secondary flex items-center justify-center shrink-0"
          >
            <ArrowLeft className="size-4" />
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
              className={`shrink-0 size-11 rounded-2xl flex items-center justify-center relative transition-colors ${
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
        </div>

        {/* Mobile: toggled filter row */}
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
      </header>

      <div className="max-w-7xl mx-auto px-4 pt-4 space-y-3">
        {/* Result count */}
        {!isLoading && (
          <p className="text-xs text-muted-foreground">
            {totalCount.toLocaleString()}{" "}
            {totalCount === 1 ? "listing" : "listings"}
            {(debouncedQ || activeFilters > 0) && " found"}
          </p>
        )}

        {!isMobile ? (
          <div className="flex gap-6">
            {/* Sidebar filters */}
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
      </div>
    </div>
  );
};

export default Listings;
