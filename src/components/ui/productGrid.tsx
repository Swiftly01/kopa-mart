import { Loader2 } from "lucide-react";
import { ListingCard } from "@/components/ListingCard";

interface ProductGridProps {
  products: any[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean | undefined;
  activeFilters: number;
  onClearFilters: () => void;
  gridRef: React.RefObject<HTMLDivElement>;
  sentinelRef: React.RefObject<HTMLDivElement>;
  cols: 2 | 4;
}

export const ProductGrid = ({
  products,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  activeFilters,
  onClearFilters,
  gridRef,
  sentinelRef,
  cols,
}: ProductGridProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-72">
        <div className="flex flex-col items-center gap-2.5">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading listings…</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16 space-y-2 text-muted-foreground text-sm">
        <p>No listings match your filters.</p>
        {activeFilters > 0 && (
          <button
            onClick={onClearFilters}
            className="text-xs text-primary underline underline-offset-2"
          >
            Clear filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        ref={gridRef}
        className={`grid gap-3 ${cols === 4 ? "grid-cols-4" : "grid-cols-2"}`}
      >
        {products.map((l, i) => (
          <div
            key={l.id}
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
              transitionDelay: `${(i % cols) * 80}ms`,
            }}
          >
            <ListingCard listing={l} />
          </div>
        ))}
      </div>

      {/* Sentinel: triggers fetch before user hits the bottom */}
      <div ref={sentinelRef} className="h-px" aria-hidden="true" />

      {isFetchingNextPage && (
        <div className="flex items-center justify-center gap-2 py-5 text-xs text-muted-foreground">
          <Loader2 className="size-4 animate-spin shrink-0" />
          <span>Loading more listings…</span>
        </div>
      )}

      {!hasNextPage && !isFetchingNextPage && products.length > 0 && (
        <p className="text-center text-xs text-muted-foreground py-5">
          You've seen all {products.length} listings 🎉
        </p>
      )}
    </div>
  );
};
