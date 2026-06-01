import { useMemo, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Heart, Loader2 } from "lucide-react";
import { ListingCard } from "@/components/ListingCard";
import { Product } from "@/types/product";
import { useGetSavedProductsInfinite } from "@/hooks/saved-products/queries/usegetsavedproductsinfinite";
import { ITEMS_PER_PAGE } from "@/lib/utils/config";



const Saved = () => {
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useGetSavedProductsInfinite({
      limit: ITEMS_PER_PAGE,
    });

  // Flatten pages → extract the nested product (already typed as Product)
  const items = useMemo(
    () =>
      data?.pages.flatMap((p) =>
        p.data.map((saved) => saved.product as Product),
      ) ?? [],
    [data],
  );

  // Total from the real meta envelope
  const totalCount = data?.pages[0]?.meta.totalItems ?? 0;

  // ── Infinite scroll sentinel ──────────────────────────────────────────────
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

  // ── Card entrance animations (same pattern as Index) ─────────────────────
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
  }, [items]);

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-4 space-y-4">
        <h1 className="font-bold text-lg">Saved listings</h1>
        <div className="flex items-center justify-center min-h-72">
          <div className="flex flex-col items-center gap-2.5">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Loading saved items…
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Empty state ───────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-4 space-y-4">
        <h1 className="font-bold text-lg">Saved listings</h1>
        <div className="text-center py-20 space-y-3">
          <div className="size-16 rounded-full bg-secondary flex items-center justify-center mx-auto">
            <Heart className="size-7 text-muted-foreground/50" />
          </div>
          <div className="space-y-1">
            <p className="font-medium text-sm">No saved items yet</p>
            <p className="text-xs text-muted-foreground">
              Tap the heart on any listing to save it here.
            </p>
          </div>
          <Link
            to="/"
            className="inline-block text-primary text-sm font-medium"
          >
            Browse listings →
          </Link>
        </div>
      </div>
    );
  }

  // ── Grid ──────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 space-y-4">
      <div>
        <h1 className="font-bold text-lg">Saved listings</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          {totalCount.toLocaleString()} {totalCount === 1 ? "item" : "items"}
        </p>
      </div>

      <div ref={gridRef} className="grid grid-cols-2 gap-3">
        {items.map((product, i) => (
          <div
            key={product.id}
            className="listing-animate opacity-0 transition-all duration-700 ease-out"
            style={{
              transform:
                i % 4 === 0
                  ? "translateY(2rem)"
                  : i % 4 === 1
                    ? "translateX(-2rem)"
                    : i % 4 === 2
                      ? "translateY(2rem)"
                      : "translateX(2rem)",
              transitionDelay: `${(i % 2) * 80}ms`,
            }}
          >
            <ListingCard listing={product} />
          </div>
        ))}
      </div>

      <div ref={sentinelRef} className="h-px" aria-hidden="true" />

      {isFetchingNextPage && (
        <div className="flex items-center justify-center gap-2 py-5 text-xs text-muted-foreground">
          <Loader2 className="size-4 animate-spin shrink-0" />
          <span>Loading more…</span>
        </div>
      )}

      {!hasNextPage && !isFetchingNextPage && items.length > 0 && (
        <p className="text-center text-xs text-muted-foreground py-5">
          You've seen all {items.length} saved{" "}
          {items.length === 1 ? "item" : "items"} 🎉
        </p>
      )}
    </div>
  );
};

export default Saved;
