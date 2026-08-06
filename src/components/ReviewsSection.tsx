import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MessageSquareText, PenLine, Star } from "lucide-react";

import { StarRating } from "@/components/ui/starRating";
import { ReviewCard } from "@/components/ReviewCard";
import Pagination from "@/components/ui/pagintion";
import useUser from "@/hooks/users/queries/useUser";
import useGetProductReviews from "@/hooks/reviews/queries/useGetProductReviews";
import useGetReviewEligibility from "@/hooks/reviews/queries/useGetReviewEligibility";
import useDeleteReview from "@/hooks/reviews/mutations/useDeleteReview";
import appToast from "@/lib/appToast";
import { handleAxiosError } from "@/lib/utils/errors/errorHandler";
import { AxiosError } from "axios";

interface ReviewsSectionProps {
  productId: string;
  sellerId: string;
  slug: string;
  rating: number;
  reviewCount: number;
}

const PAGE_SIZE = 5;

export function ReviewsSection({
  productId,
  sellerId,
  slug,
  rating,
  reviewCount,
}: ReviewsSectionProps) {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const { data: user } = useUser();
  const isBuyer = user?.role === "buyer";

  const { data: reviews, isLoading } = useGetProductReviews(productId, {
    page,
    limit: PAGE_SIZE,
  });
  const { data: eligibility, isLoading: isEligibilityLoading } =
    useGetReviewEligibility(isBuyer ? sellerId : undefined, isBuyer ? productId : undefined);

  const deleteReview = useDeleteReview();
  const myReviewId = eligibility?.review?.id;

  const reviewList = reviews?.data ?? [];

  const handleDelete = (reviewId: string) => {
    deleteReview.mutate(
      { reviewId, sellerId, productId },
      {
        onSuccess: () =>
          appToast({
            title: "Review deleted",
            description: "Your review has been removed.",
          }),
        onError: (err: AxiosError) => handleAxiosError(err),
      },
    );
  };

  return (
    <div className="bg-white border shadow-sm rounded-2xl border-zinc-200 p-5 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-zinc-900 flex items-center gap-2">
            <MessageSquareText className="size-4 text-emerald-500" />
            Ratings &amp; Reviews
          </h3>
          {reviewCount > 0 && (
            <StarRating value={rating} showValue reviewCount={reviewCount} size="sm" />
          )}
        </div>

        {/* ── CTA: write / edit review ── */}
        {!user ? (
          <button
            onClick={() => navigate("/login")}
            className="text-sm font-semibold text-emerald-600 hover:text-emerald-700"
          >
            Sign in to write a review
          </button>
        ) : isBuyer && !isEligibilityLoading ? (
          eligibility?.alreadyReviewed ? (
            <Link
              to={`/listing/${slug}/review`}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
            >
              <PenLine className="size-3.5" />
              Edit your review
            </Link>
          ) : eligibility?.eligible ? (
            <Link
              to={`/listing/${slug}/review`}
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors"
            >
              <Star className="size-3.5" />
              Write a review
            </Link>
          ) : (
            <span className="text-xs text-zinc-400 max-w-[220px] text-right">
              {eligibility?.reason ?? "Contact the seller first to unlock reviews."}
            </span>
          )
        ) : null}
      </div>

      {reviewCount === 0 && !isLoading ? (
        <p className="text-sm text-zinc-400 text-center py-6">
          No reviews yet — be the first to share your experience.
        </p>
      ) : isLoading ? (
        <p className="text-sm text-zinc-400 text-center py-6">Loading reviews…</p>
      ) : (
        <>
          <div className="space-y-3">
            {reviewList.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                isOwn={review.id === myReviewId}
                onEdit={
                  review.id === myReviewId
                    ? () => navigate(`/listing/${slug}/review`)
                    : undefined
                }
                onDelete={
                  review.id === myReviewId
                    ? () => handleDelete(review.id)
                    : undefined
                }
              />
            ))}
          </div>

          {reviews && reviews.meta.totalPages > 1 && (
            <div className="flex justify-center pt-2">
              <Pagination
                currentPage={reviews.meta.currentPage}
                totalPages={reviews.meta.totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
