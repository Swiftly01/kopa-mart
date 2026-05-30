import {
  conditionConfig,
  countActiveFilters,
  sortByOptions,
} from "@/lib/productConfig";
import { cn } from "@/lib/utils/utils";
import { FilterState } from "@/types/product";
import { ChevronDown, X } from "lucide-react";
import { Input } from "./input";

// ── FilterPanel ───────────────────────────────────────────────────────────────
export default function FilterPanel({
  filters,
  onChange,
  onClear,
}: {
  filters: FilterState;
  onChange: (key: keyof FilterState, value: string) => void;
  onClear: () => void;
}) {
  const activeCount = countActiveFilters(filters);

  return (
    <div className="bg-secondary/60 border border-border/50 rounded-2xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-foreground">Filters</p>
        {activeCount > 0 && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="size-3" />
            Clear all ({activeCount})
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {/* Condition */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
            Condition
          </label>
          <div className="relative">
            <select
              value={filters.condition}
              onChange={(e) => onChange("condition", e.target.value)}
              className={cn(
                "w-full h-9 rounded-xl border border-border/60 bg-background text-xs px-3 pr-8 appearance-none focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors",
                filters.condition ? "text-foreground" : "text-muted-foreground",
              )}
            >
              <option value="">All conditions</option>
              {Object.entries(conditionConfig).map(([value, { label }]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Sort */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
            Sort by
          </label>
          <div className="relative">
            <select
              value={filters.sortBy}
              onChange={(e) => onChange("sortBy", e.target.value)}
              className={cn(
                "w-full h-9 rounded-xl border border-border/60 bg-background text-xs px-3 pr-8 appearance-none focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors",
                filters.sortBy ? "text-foreground" : "text-muted-foreground",
              )}
            >
              <option value="">Default</option>
              {sortByOptions.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* State */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
            State
          </label>
          <Input
            value={filters.stateName}
            onChange={(e) => onChange("stateName", e.target.value)}
            placeholder="e.g. Lagos"
            className="h-9 rounded-xl border-border/60 bg-background text-xs"
          />
        </div>

        {/* LGA */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
            LGA
          </label>
          <Input
            value={filters.lgaName}
            onChange={(e) => onChange("lgaName", e.target.value)}
            placeholder="e.g. Ikeja"
            className="h-9 rounded-xl border-border/60 bg-background text-xs"
          />
        </div>

        {/* Min price */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
            Min price (₦)
          </label>
          <Input
            type="number"
            min={0}
            value={filters.minPrice}
            onChange={(e) => onChange("minPrice", e.target.value)}
            placeholder="0"
            className="h-9 rounded-xl border-border/60 bg-background text-xs"
          />
        </div>

        {/* Max price */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
            Max price (₦)
          </label>
          <Input
            type="number"
            min={0}
            value={filters.maxPrice}
            onChange={(e) => onChange("maxPrice", e.target.value)}
            placeholder="Any"
            className="h-9 rounded-xl border-border/60 bg-background text-xs"
          />
        </div>
      </div>
    </div>
  );
}
