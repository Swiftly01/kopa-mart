import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils/utils";

const sizeMap = {
  xs: "size-3",
  sm: "size-3.5",
  md: "size-5",
  lg: "size-7",
} as const;

const textSizeMap = {
  xs: "text-[11px]",
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
} as const;

interface StarRatingProps {
  /** Current rating, 0–5. Can be fractional for display mode (e.g. 4.3). */
  value: number;
  /** Star size. Defaults to "sm". */
  size?: keyof typeof sizeMap;
  /** Show the numeric rating next to the stars. */
  showValue?: boolean;
  /** Show a "(N reviews)" count after the value. Only rendered if showValue is true. */
  reviewCount?: number;
  /** Extra className for the wrapper. */
  className?: string;

  // ── Interactive mode ────────────────────────────────────────────────────
  /** If provided, the component becomes an interactive picker with hover states. */
  onChange?: (value: number) => void;
  disabled?: boolean;
}

/**
 * StarRating
 *
 * Read-only by default — renders a row of filled/half/empty stars for
 * displaying a product or seller's average rating anywhere in the app
 * (product cards, product detail, seller reviews).
 *
 * Pass `onChange` to turn it into an interactive 1–5 star picker with
 * hover and selected states, used on the buyer review form.
 */
export function StarRating({
  value,
  size = "sm",
  showValue = false,
  reviewCount,
  className,
  onChange,
  disabled = false,
}: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const interactive = !!onChange && !disabled;
  const displayValue = hovered ?? value;

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div
        className="flex items-center gap-0.5"
        onMouseLeave={() => interactive && setHovered(null)}
        role={interactive ? "radiogroup" : "img"}
        aria-label={
          interactive
            ? "Select a star rating"
            : `Rated ${value.toFixed(1)} out of 5 stars`
        }
      >
        {Array.from({ length: 5 }).map((_, i) => {
          const starIndex = i + 1;
          const filled = starIndex <= Math.round(displayValue);

          const star = (
            <Star
              className={cn(
                sizeMap[size],
                "transition-all duration-150",
                filled
                  ? "fill-amber-400 stroke-amber-400"
                  : "fill-muted stroke-muted-foreground/25",
                interactive && "hover:scale-110",
              )}
            />
          );

          if (!interactive) {
            return <span key={starIndex}>{star}</span>;
          }

          return (
            <button
              key={starIndex}
              type="button"
              disabled={disabled}
              onMouseEnter={() => setHovered(starIndex)}
              onFocus={() => setHovered(starIndex)}
              onBlur={() => setHovered(null)}
              onClick={() => onChange(starIndex)}
              className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed"
              aria-label={`${starIndex} star${starIndex > 1 ? "s" : ""}`}
              aria-checked={starIndex === Math.round(value)}
              role="radio"
            >
              {star}
            </button>
          );
        })}
      </div>

      {showValue && (
        <span className={cn("font-medium text-amber-600", textSizeMap[size])}>
          {value.toFixed(1)}
          {typeof reviewCount === "number" && reviewCount > 0 && (
            <span className="ml-1 font-normal text-muted-foreground">
              ({reviewCount.toLocaleString()}{" "}
              {reviewCount === 1 ? "review" : "reviews"})
            </span>
          )}
        </span>
      )}
    </div>
  );
}
