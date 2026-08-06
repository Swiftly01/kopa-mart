import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AxiosError } from "axios";
import { ArrowLeft, Loader2, ShieldAlert, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/ui/starRating";
import useGetProductBySlug from "@/hooks/products/queries/useGetProductBySlug";
import useUser from "@/hooks/users/queries/useUser";
import useGetReviewEligibility from "@/hooks/reviews/queries/useGetReviewEligibility";
import useCreateReview from "@/hooks/reviews/mutations/useCreateReview";
import useUpdateReview from "@/hooks/reviews/mutations/useUpdateReview";
import useDeleteReview from "@/hooks/reviews/mutations/useDeleteReview";
import appToast from "@/lib/appToast";
import { handleAxiosError } from "@/lib/utils/errors/errorHandler";

const MAX_COMMENT_LENGTH = 2000;

const WriteReview = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data: product, isLoading: isProductLoading } =
    useGetProductBySlug(slug);
  const { data: user } = useUser();
  const isBuyer = user?.role === "buyer";

  const {
    data: eligibility,
    isLoading: isEligibilityLoading,
  } = useGetReviewEligibility(
    isBuyer ? product?.sellerId : undefined,
    isBuyer ? product?.id : undefined,
  );

  const createReview = useCreateReview();
  const updateReview = useUpdateReview();
  const deleteReview = useDeleteReview();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hasHydrated, setHasHydrated] = useState(false);

  const isEditing = !!eligibility?.alreadyReviewed;
  const existingReview = eligibility?.review ?? null;

  // Pre-fill the form once when the existing review (if any) loads.
  useEffect(() => {
    if (!hasHydrated && existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment ?? "");
      setHasHydrated(true);
    }
  }, [existingReview, hasHydrated]);

  const isPending =
    createReview.isPending || updateReview.isPending || deleteReview.isPending;

  const handleSubmit = () => {
    if (!product || rating < 1) return;

    if (isEditing && existingReview) {
      updateReview.mutate(
        {
          reviewId: existingReview.id,
          payload: { rating, comment: comment.trim() || undefined },
          sellerId: product.sellerId,
          productId: product.id,
        },
        {
          onSuccess: () => {
            appToast({
              title: "Review updated",
              description: "Your changes have been saved.",
            });
            navigate(`/listing/${product.slug}`);
          },
          onError: (err: AxiosError) => handleAxiosError(err),
        },
      );
      return;
    }

    createReview.mutate(
      {
        productId: product.id,
        sellerId: product.sellerId,
        rating,
        comment: comment.trim() || undefined,
      },
      {
        onSuccess: () => {
          appToast({
            title: "Review submitted",
            description: "Thanks for sharing your experience!",
          });
          navigate(`/listing/${product.slug}`);
        },
        onError: (err: AxiosError) => handleAxiosError(err),
      },
    );
  };

  const handleDelete = () => {
    if (!product || !existingReview) return;
    deleteReview.mutate(
      {
        reviewId: existingReview.id,
        sellerId: product.sellerId,
        productId: product.id,
      },
      {
        onSuccess: () => {
          appToast({
            title: "Review deleted",
            description: "Your review has been removed.",
          });
          navigate(`/listing/${product.slug}`);
        },
        onError: (err: AxiosError) => handleAxiosError(err),
      },
    );
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isProductLoading || (isBuyer && isEligibilityLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f8f6]">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="size-7 animate-spin" />
          <p className="text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#f8f8f6]">
        <p className="text-muted-foreground">Listing not found.</p>
        <Button onClick={() => navigate("/")}>Back to home</Button>
      </div>
    );
  }

  // ── Not a buyer ──────────────────────────────────────────────────────────
  if (!isBuyer) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 bg-[#f8f8f6] text-center">
        <div className="size-16 rounded-2xl bg-amber-100 flex items-center justify-center">
          <ShieldAlert className="size-8 text-amber-500" />
        </div>
        <h1 className="text-lg font-semibold text-zinc-900">
          Only buyers can write reviews
        </h1>
        <p className="text-sm text-muted-foreground max-w-sm">
          Sign in with a buyer account to rate and review this listing.
        </p>
        <Link
          to={`/listing/${product.slug}`}
          className="text-sm font-semibold text-emerald-600 hover:text-emerald-700"
        >
          Back to listing
        </Link>
      </div>
    );
  }

  // ── Not eligible ─────────────────────────────────────────────────────────
  if (!isEditing && eligibility && !eligibility.eligible) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 bg-[#f8f8f6] text-center">
        <div className="size-16 rounded-2xl bg-amber-100 flex items-center justify-center">
          <ShieldAlert className="size-8 text-amber-500" />
        </div>
        <h1 className="text-lg font-semibold text-zinc-900">
          You can't review this listing yet
        </h1>
        <p className="text-sm text-muted-foreground max-w-sm">
          {eligibility.reason ??
            "Contact the seller via WhatsApp or a call before leaving a review."}
        </p>
        <Link
          to={`/listing/${product.slug}`}
          className="text-sm font-semibold text-emerald-600 hover:text-emerald-700"
        >
          Back to listing
        </Link>
      </div>
    );
  }

  const image = product.images?.find((i) => i.isMain) ?? product.images?.[0];

  return (
    <div className="min-h-screen bg-[#f8f8f6]">
      <div className="sticky top-0 z-30 bg-[#f8f8f6]/95 backdrop-blur border-b border-zinc-200/60">
        <div className="flex items-center max-w-2xl gap-3 px-4 mx-auto h-14">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center transition-colors bg-white border rounded-full shadow-sm size-9 border-zinc-200 hover:bg-zinc-50"
          >
            <ArrowLeft className="size-4 text-zinc-700" />
          </button>
          <span className="flex-1 text-sm font-medium truncate text-zinc-700">
            {isEditing ? "Edit your review" : "Write a review"}
          </span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Product context */}
        <div className="flex items-center gap-3 p-3 bg-white border shadow-sm rounded-2xl border-zinc-200">
          {image ? (
            <img
              src={image.cloudinaryUrl}
              alt={product.name}
              className="object-cover rounded-xl size-14 shrink-0"
            />
          ) : (
            <div className="flex items-center justify-center rounded-xl size-14 bg-secondary shrink-0" />
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate text-zinc-900">
              {product.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {isEditing
                ? "You're editing your existing review"
                : "Rate your experience with this listing"}
            </p>
          </div>
        </div>

        {/* Review form */}
        <div className="p-5 space-y-5 bg-white border shadow-sm rounded-2xl border-zinc-200">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-zinc-900">Your rating</p>
            <StarRating value={rating} onChange={setRating} size="lg" />
            {rating === 0 && (
              <p className="text-xs text-zinc-400">Tap a star to rate 1–5.</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="review-comment"
              className="text-sm font-semibold text-zinc-900"
            >
              Your review{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </label>
            <Textarea
              id="review-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, MAX_COMMENT_LENGTH))}
              placeholder="Share details about the product quality, the seller's responsiveness, or anything else that could help other buyers…"
              className="min-h-[140px] resize-none rounded-xl"
              maxLength={MAX_COMMENT_LENGTH}
            />
            <p className="text-xs text-right text-zinc-400">
              {comment.length}/{MAX_COMMENT_LENGTH}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleSubmit}
              disabled={rating < 1 || isPending}
              className="flex-1 h-11 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold"
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : isEditing ? (
                "Save changes"
              ) : (
                "Submit review"
              )}
            </Button>

            {isEditing && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="flex items-center justify-center h-11 gap-1.5 px-4 rounded-full border-2 border-destructive/30 bg-destructive/5 text-destructive text-sm font-semibold hover:bg-destructive/10 transition-colors disabled:opacity-60"
              >
                <Trash2 className="size-4" />
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WriteReview;
