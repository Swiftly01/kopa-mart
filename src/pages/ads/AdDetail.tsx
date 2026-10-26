import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  Eye,
  Flag,
  Heart,
  MapPin,
  MessageCircle,
  Phone,
  Share2,
} from "lucide-react";
import AdGallery from "@/components/ads/AdGallery";
import AdSpecs from "@/components/ads/AdSpecs";
import { DetailSkeleton } from "@/components/detailSkeleton";
import { ReviewsSection } from "@/components/ReviewsSection";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/starRating";
import useCreateConversation from "@/hooks/chat/mutations/useCreateConversation";
import useCreateInteraction from "@/hooks/interactions/mutations/useCreateInteraction";
import useGetPublicAd from "@/hooks/listings/queries/useGetPublicAd";
import { useToggleSavedProduct } from "@/hooks/saved-products/mutations/usetoggleSavedProduct";
import { useGetSaveStatus } from "@/hooks/saved-products/queries/useGetSaveStatus";
import useGetSellerOnboardingData from "@/hooks/seller/queries/useGetSellerOnboardingData";
import useUser from "@/hooks/users/queries/useUser";
import { cn, formatNaira, timeAgo } from "@/lib/utils/utils";
import type { InteractionType } from "@/types/interaction";

const NEGOTIABLE_LABELS = { yes: "Negotiable", no: "Fixed price", not_sure: "" };

// public page of a live ad; it mirrors the product page (rating, reviews, chat, call, save)
export default function AdDetail() {
  const navigate = useNavigate();
  const { slug = "" } = useParams<{ slug: string }>();
  const { data: ad, isLoading, isError } = useGetPublicAd(slug);

  const { data: user } = useUser();
  const isBuyer = user?.role === "buyer";
  const recordInteraction = useCreateInteraction();
  const createConversation = useCreateConversation();
  const [startingChat, setStartingChat] = useState(false);

  // the save, review and contact APIs take a product id or an ad id
  const { isSaved } = useGetSaveStatus(ad?.id ?? "");
  const { mutate: toggleSave, isPending: isSavePending } =
    useToggleSavedProduct(ad?.id ?? "");
  const { data: sellerOnboarding } = useGetSellerOnboardingData(ad?.seller?.id);

  if (isLoading) return <DetailSkeleton />;

  if (isError || !ad) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#f8f8f6]">
        <p className="text-muted-foreground">This ad is not available.</p>
        <Button onClick={() => navigate("/")}>Back to home</Button>
      </div>
    );
  }

  const seller = ad.seller;
  const sellerId = seller?.id ?? "";
  const sellerName = seller?.name || "Seller";
  const sellerPhone = seller?.phoneNumber ?? "";
  const sellerJoined = seller?.joinedAt
    ? new Date(seller.joinedAt).toLocaleDateString("en-NG", {
        month: "short",
        year: "numeric",
      })
    : null;
  const waNumber = (
    sellerOnboarding?.storeProfileData?.whatsappNumber ?? sellerPhone
  ).replace(/[^\d+]/g, "");
  const waMessage = encodeURIComponent(
    `Hi, I'm interested in your "${ad.title}" ad on Kopa Marketplace.`,
  );
  const negotiable = NEGOTIABLE_LABELS[ad.negotiable];

  // only buyers are tracked, and that is what unlocks their review later
  const trackContact = (type: InteractionType) => {
    if (!isBuyer || !sellerId) return;
    recordInteraction.mutate({ productId: ad.id, sellerId, type });
  };

  const handleMessageSeller = () => {
    if (!user) return navigate("/login");
    if (!sellerId || startingChat) return;
    setStartingChat(true);
    createConversation.mutate(
      { participantIds: [sellerId, user.id] },
      {
        onSuccess: (conversation) => navigate(`/messages/${conversation.id}`),
        onSettled: () => setStartingChat(false),
      },
    );
  };

  const handleSave = () => {
    if (!user) return navigate("/login");
    toggleSave();
  };

  const share = () =>
    navigator.share?.({ title: ad.title, url: window.location.href });

  return (
    <div className="min-h-screen bg-[#f8f8f6]">
      {/* ── Top nav ── */}
      <div className="sticky top-0 z-30 bg-[#f8f8f6]/95 backdrop-blur border-b border-zinc-200/60">
        <div className="flex items-center max-w-6xl gap-3 px-4 mx-auto h-14">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center bg-white border rounded-full shadow-sm size-9 border-zinc-200"
            aria-label="Back"
          >
            <ArrowLeft className="size-4 text-zinc-700" />
          </button>
          <span className="flex-1 text-sm truncate text-zinc-500">{ad.title}</span>
          <button
            onClick={share}
            className="flex items-center justify-center bg-white border rounded-full shadow-sm size-9 border-zinc-200"
            aria-label="Share"
          >
            <Share2 className="size-4 text-zinc-700" />
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8">
        {/* ══ LEFT: photos ══ */}
        <AdGallery images={ad.images} title={ad.title}>
          <button
            type="button"
            disabled={isSavePending}
            onClick={handleSave}
            className={cn(
              "absolute top-3 right-3 size-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-md hover:scale-105 transition-transform",
              isSavePending && "opacity-60 cursor-not-allowed",
            )}
            aria-label={isSaved ? "Remove from saved" : "Save ad"}
          >
            <Heart
              className={cn(
                "size-4 transition-colors",
                isSaved ? "fill-red-500 text-red-500" : "text-zinc-500",
              )}
            />
          </button>
        </AdGallery>

        {/* ══ RIGHT: details ══ */}
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="px-3 py-1 text-xs font-medium bg-white border rounded-full border-zinc-200 text-zinc-700">
              {ad.category.name}
            </span>
            <span className="flex items-center gap-1 text-xs text-zinc-400">
              <Clock className="size-3" />
              Posted {timeAgo(ad.publishedAt ?? ad.createdAt)}
            </span>
          </div>

          <h1 className="text-2xl font-bold leading-snug text-zinc-900">{ad.title}</h1>

          <div className="flex items-center gap-2">
            {ad.reviewCount > 0 ? (
              <StarRating
                value={ad.rating}
                showValue
                reviewCount={ad.reviewCount}
                size="sm"
              />
            ) : (
              <span className="text-xs text-zinc-400">No reviews yet</span>
            )}
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-emerald-600">
              {formatNaira(ad.price)}
            </span>
            {negotiable && <span className="text-sm text-zinc-400">{negotiable}</span>}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-sm text-zinc-500">
              <MapPin className="size-4 text-emerald-500" />
              {ad.lgaName}, {ad.stateName}
            </div>
            <div className="flex items-center gap-1 text-xs text-zinc-400">
              <Eye className="size-3.5" />
              {ad.views.toLocaleString()} views
            </div>
          </div>

          <AdSpecs ad={ad} />

          {/* contact buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleMessageSeller}
              disabled={startingChat}
              className="flex items-center justify-center flex-1 h-12 gap-2 font-semibold text-white rounded-full shadow-sm bg-gradient-primary disabled:opacity-60"
            >
              <MessageCircle className="size-4" />
              {startingChat ? "Opening chat…" : "Chat Seller"}
            </button>
            {waNumber && (
              <a
                href={`https://wa.me/${waNumber}?text=${waMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackContact("whatsapp")}
                className="flex items-center justify-center h-12 gap-2 px-5 font-semibold text-white rounded-full shadow-sm bg-emerald-500 hover:bg-emerald-600"
              >
                <MessageCircle className="size-4" /> Whatsapp
              </a>
            )}
            {sellerPhone ? (
              <a
                href={`tel:${sellerPhone}`}
                onClick={() => trackContact("call")}
                className="flex items-center justify-center h-12 gap-2 px-5 font-semibold bg-white border-2 rounded-full border-zinc-200 hover:bg-zinc-50 text-zinc-700"
              >
                <Phone className="size-4" />
                Call Seller
              </a>
            ) : (
              <Link
                to={`/seller/${sellerId}`}
                className="flex items-center justify-center h-12 gap-2 px-5 font-semibold bg-white border-2 rounded-full border-zinc-200 hover:bg-zinc-50 text-zinc-700"
              >
                <Phone className="size-4" />
                Call Seller
              </Link>
            )}
          </div>

          <button
            type="button"
            disabled={isSavePending}
            onClick={handleSave}
            className={cn(
              "w-full h-11 rounded-full border-2 font-semibold text-sm flex items-center justify-center gap-2 transition-all",
              isSaved
                ? "border-red-200 bg-red-50 text-red-500"
                : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50",
              isSavePending && "opacity-60 cursor-not-allowed",
            )}
          >
            <Heart
              className={cn("size-4", isSaved && "fill-red-500 text-red-500")}
            />
            {isSaved ? "Saved" : "Save ad"}
          </button>

          <p className="flex items-center justify-center gap-1.5 text-xs text-zinc-400">
            <CheckCircle2 className="size-3.5 text-emerald-500" />
            Never pay in advance. Inspect the property or item before payment.
          </p>

          {/* seller card */}
          {seller && (
            <div className="p-4 space-y-3 bg-white border shadow-sm rounded-2xl border-zinc-200">
              <p className="text-sm font-semibold text-zinc-500">About the Seller</p>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center text-lg font-bold text-white rounded-full size-11 bg-emerald-500 shrink-0">
                  {sellerName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="text-sm font-semibold text-zinc-900">{sellerName}</p>
                    {seller.isEmailVerified && (
                      <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
                        <CheckCircle2 className="size-3" />
                        ID Verified
                      </span>
                    )}
                  </div>
                </div>
                <Link
                  to={`/seller/${seller.id}`}
                  className="flex items-center gap-1 text-xs font-semibold text-emerald-600 shrink-0"
                >
                  <Eye className="size-3" />
                  View Profile
                </Link>
              </div>
              {sellerJoined && (
                <div className="flex items-center gap-1 pt-2 text-[11px] border-t text-zinc-400 border-zinc-100">
                  <CalendarDays className="size-3" />
                  Joined {sellerJoined}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Ad ID: KPA-{ad.id.slice(0, 6).toUpperCase()}</span>
            <a
              href={`mailto:support@kopamart.com?subject=${encodeURIComponent(
                `Report: ${ad.title} (${ad.id})`,
              )}&body=${encodeURIComponent(
                `Hi Kopa Support,\n\nI would like to report this ad:\n\nAd: ${ad.title}\nAd ID: ${ad.id}\nSeller ID: ${sellerId}\nURL: ${window.location.href}\n\nReason for report:\n[Please describe the issue here]\n\nThank you.`,
              )}`}
              className="flex items-center gap-1 font-medium text-red-400 hover:text-red-500"
            >
              <Flag className="size-3" />
              Report this ad
            </a>
          </div>
        </div>
      </div>

      {/* ── Ratings & reviews ── */}
      <div className="max-w-6xl px-4 pb-12 mx-auto">
        <ReviewsSection
          productId={ad.id}
          sellerId={sellerId}
          slug={ad.slug}
          reviewPath={`/ad/${ad.slug}/review`}
          rating={ad.rating}
          reviewCount={ad.reviewCount}
        />
      </div>
    </div>
  );
}
