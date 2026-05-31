import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterControlsProps {
  // Values
  watchedState: string;
  watchedLga: string;
  watchedCategory: string;
  // Data
  states: { id: string; code: string; name: string }[];
  lgas: { id: string; name: string }[];
  categories: { id: string; name: string; icon: string }[];
  // Handlers
  onStateChange: (value: string) => void;
  onLgaChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onClearFilters: () => void;
  activeFilters: number;
  /** compact=true → row layout (header bar); compact=false → stacked sidebar */
  compact?: boolean;
}

export const FilterControls = ({
  watchedState,
  watchedLga,
  watchedCategory,
  states,
  lgas,
  categories,
  onStateChange,
  onLgaChange,
  onCategoryChange,
  onClearFilters,
  activeFilters,
  compact = false,
}: FilterControlsProps) => {
  const triggerClass = compact
    ? "h-8 text-xs rounded-full bg-secondary border-0"
    : "h-9 text-xs rounded-full bg-secondary border-0";

  const wrapperClass = compact
    ? "flex flex-wrap items-center gap-2"
    : "space-y-2";

  return (
    <div className={wrapperClass}>
      {/* State */}
      <Select value={watchedState || "__all__"} onValueChange={onStateChange}>
        <SelectTrigger className={`${triggerClass} ${compact ? "w-[120px]" : ""}`}>
          <SelectValue placeholder="State" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">All States</SelectItem>
          {states.map((s) => (
            <SelectItem key={s.id} value={s.code}>
              {s.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* LGA */}
      <Select
        value={watchedLga || "__all__"}
        onValueChange={onLgaChange}
        disabled={!watchedState}
      >
        <SelectTrigger className={`${triggerClass} ${compact ? "w-[130px]" : ""}`}>
          <SelectValue placeholder={watchedState ? "Location" : "Select state first"} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">All Locations</SelectItem>
          {lgas.map((l) => (
            <SelectItem key={l.id} value={l.name}>
              {l.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Category */}
      <Select value={watchedCategory || "__all__"} onValueChange={onCategoryChange}>
        <SelectTrigger className={`${triggerClass} ${compact ? "w-[140px]" : ""}`}>
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">All Categories</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.name} value={c.id}>
              {c.icon} {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Clear */}
      {activeFilters > 0 && (
        <button
          type="button"
          onClick={onClearFilters}
          className="text-[11px] text-primary font-medium flex items-center gap-1"
        >
          <X className="size-3" />
          {compact ? "Clear" : "Clear filters"}
        </button>
      )}
    </div>
  );
};