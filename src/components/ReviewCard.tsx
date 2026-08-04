import { StarRating } from "@/components/ui/starRating";
import { formatDate, formatReviewerName } from "@/lib/utils/utils";
import { Review } from "@/types/review";
import { Pencil, Trash2 } from "lucide-react";

interface ReviewCardProps {
  review: Review;
  /** Show the product name/link this review belongs to (used on the seller "all reviews" view). */
  showProduct?: boolean;
  /** Highlight + offer edit/delete actions when this is the current buyer's own review. */
  isOwn?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ReviewCard({
  review,
  showProduct = false,
  isOwn = false,
  onEdit,
  onDelete,
}: ReviewCardProps) {
  const name = formatReviewerName(review.buyer?.firstName, review.buyer?.lastName);
  const initial = name.charAt(0).toUpperCase();

  return (
    <div
      className={
        isOwn
          ? "bg-secondary/40 border border-primary/20 rounded-2xl p-4 space-y-2.5"
          : "bg-card border border-border/60 rounded-2xl p-4 space-y-2.5"
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="size-9 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center shrink-0 text-sm">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {name}
              {isOwn && (
                <span className="ml-1.5 text-xs font-normal text-primary">
                  (You)
                </span>
              )}
            </p>
            {showProduct && review.product && (
              <p className="text-xs text-muted-foreground truncate">
                on {review.product.name}
              </p>
            )}
          </div>
        </div>

        <span className="text-xs text-muted-foreground shrink-0 whitespace-nowrap">
          {formatDate(review.createdAt)}
        </span>
      </div>

      <StarRating value={review.rating} size="xs" />

      {review.comment && (
        <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
          {review.comment}
        </p>
      )}

      {isOwn && (onEdit || onDelete) && (
        <div className="flex items-center gap-2 pt-1">
          {onEdit && (
            <button
              onClick={onEdit}
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <Pencil className="size-3" />
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="inline-flex items-center gap-1 text-xs font-medium text-destructive hover:underline"
            >
              <Trash2 className="size-3" />
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
