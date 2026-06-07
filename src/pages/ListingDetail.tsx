import { DetailSkeleton } from "@/components/detailSkeleton";
import { Button } from "@/components/ui/button";
import useGetProductBySlug from "@/hooks/products/queries/useGetProductBySlug";
import { useToggleSavedProduct } from "@/hooks/saved-products/mutations/usetoggleSavedProduct";
import { useGetSaveStatus } from "@/hooks/saved-products/queries/useGetSaveStatus";
import useGetSellerOnboardingData from "@/hooks/seller/queries/useGetSellerOnboardingData";
import useUser from "@/hooks/users/queries/useUser";
import { conditionStyle } from "@/lib/productConfig";
import { cn, formatNaira, timeAgo } from "@/lib/utils/utils";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  Eye,
  Flag,
  Heart,
  MapPin,
  MapPinned,
  MessageCircle,
  Phone,
  Share2,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

const ListingDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [activeImg, setActiveImg] = useState(0);

  const { data: product, isLoading, isError } = useGetProductBySlug(slug);

  const { isSaved } = useGetSaveStatus(product?.id ?? "");
  const { mutate: toggleSave, isPending: isSavePending } =
    useToggleSavedProduct(product?.id ?? "");
  const { data: sellerOnboarding } = useGetSellerOnboardingData(
    product?.seller?.id,
  );

  if (isLoading) return <DetailSkeleton />;

  if (isError || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#f8f8f6]">
        <p className="text-muted-foreground">Listing not found.</p>
        <Button onClick={() => navigate("/")}>Back to home</Button>
      </div>
    );
  }

  const images = [...(product.images ?? [])].sort((a, b) => a.order - b.order);
  const mainImage = images[activeImg]?.cloudinaryUrl ?? "";
  const discountedPrice =
    product.discountPercentage > 0
      ? Number(product.price) * (1 - product.discountPercentage / 100)
      : null;
  const locationLabel = [product.lgaName, product.stateName]
    .filter(Boolean)
    .join(", ");
  const conditionKey = product.condition?.toLowerCase() ?? "";

  // Seller
  const seller = product.seller;
  const sellerName = seller
    ? `${seller.firstName} ${seller.lastName}`.trim()
    : "Seller";
  const sellerInitial = sellerName.charAt(0).toUpperCase();
  const sellerPhone = seller?.phoneNumber ?? "";
  const sellerJoined = seller?.createdAt
    ? new Date(seller.createdAt).toLocaleDateString("en-NG", {
        month: "short",
        year: "numeric",
      })
    : null;

  const whatsappNumber =
    sellerOnboarding?.storeProfileData?.whatsappNumber ?? sellerPhone;

  const waNumber = whatsappNumber.replace(/[^\d+]/g, "");

  const waMsg = encodeURIComponent(
    `Hi, I'm interested in your "${product.name}" listing on Kopa Marketplace.`,
  );

  return (
    <div className="min-h-screen bg-[#f8f8f6]">
      {/* ── Top nav ── */}
      <div className="sticky top-0 z-30 bg-[#f8f8f6]/95 backdrop-blur border-b border-zinc-200/60">
        <div className="flex items-center max-w-6xl gap-3 px-4 mx-auto h-14">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center transition-colors bg-white border rounded-full shadow-sm size-9 border-zinc-200 hover:bg-zinc-50"
          >
            <ArrowLeft className="size-4 text-zinc-700" />
          </button>
          <span className="flex-1 text-sm truncate text-zinc-500">
            {product.name}
          </span>
          <button
            onClick={() =>
              navigator.share?.({
                title: product.name,
                url: window.location.href,
              })
            }
            className="flex items-center justify-center transition-colors bg-white border rounded-full shadow-sm size-9 border-zinc-200 hover:bg-zinc-50"
          >
            <Share2 className="size-4 text-zinc-700" />
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8">
        {/* ══ LEFT: Images ══ */}
        <div className="space-y-3">
          <div className="relative overflow-hidden bg-white border shadow-sm rounded-2xl border-zinc-200/80">
            {mainImage ? (
              <img
                src={mainImage}
                alt={product.name}
                className="w-full aspect-[4/3] object-cover"
              />
            ) : (
              <div className="w-full aspect-[4/3] flex items-center justify-center text-zinc-400 text-sm">
                No image available
              </div>
            )}

            {/* ── Heart button — wired to real save API ── */}
            <button
              type="button"
              disabled={isSavePending}
              onClick={() => toggleSave()}
              className={cn(
                "absolute top-3 right-14 size-10 rounded-full bg-white/90 backdrop-blur",
                "flex items-center justify-center shadow-md hover:scale-105 transition-transform",
                isSavePending && "opacity-60 cursor-not-allowed",
              )}
              aria-label={isSaved ? "Remove from saved" : "Save listing"}
            >
              <Heart
                className={cn(
                  "size-4 transition-colors",
                  isSaved ? "fill-red-500 text-red-500" : "text-zinc-500",
                )}
              />
            </button>

            <button
              onClick={() =>
                navigator.share?.({
                  title: product.name,
                  url: window.location.href,
                })
              }
              className="absolute flex items-center justify-center transition-transform rounded-full shadow-md top-3 right-3 size-10 bg-white/90 backdrop-blur hover:scale-105"
            >
              <Share2 className="size-4 text-zinc-500" />
            </button>
          </div>

          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImg(i)}
                  className={cn(
                    "aspect-square rounded-xl overflow-hidden border-2 transition-all",
                    i === activeImg
                      ? "border-emerald-500 shadow-sm shadow-emerald-200"
                      : "border-transparent hover:border-zinc-300",
                  )}
                >
                  <img
                    src={img.cloudinaryUrl}
                    alt=""
                    className="object-cover w-full h-full"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ══ RIGHT: Details ══ */}
        <div className="space-y-5">
          {/* Badges + time */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 text-xs font-medium bg-white border rounded-full border-zinc-200 text-zinc-700">
                {product.category?.name ?? "—"}
              </span>
              {product.condition && (
                <span
                  className={cn(
                    "text-xs font-semibold px-3 py-1 rounded-full border",
                    conditionStyle[conditionKey] ??
                      "bg-zinc-100 text-zinc-700 border-zinc-200",
                  )}
                >
                  {product.condition}
                </span>
              )}
            </div>
            <span className="flex items-center gap-1 text-xs text-zinc-400">
              <Clock className="size-3" />
              Posted {timeAgo(product.createdAt)}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold leading-snug text-zinc-900">
            {product.name}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-emerald-600">
              {formatNaira(discountedPrice ?? product.price)}
            </span>
            {discountedPrice !== null && (
              <span className="text-base line-through text-zinc-400">
                {formatNaira(product.price)}
              </span>
            )}
          </div>

          {/* Location + Views */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            {locationLabel && (
              <div className="flex items-center gap-1.5 text-sm text-zinc-500">
                <MapPin className="size-4 text-emerald-500" />
                {locationLabel}
              </div>
            )}
            <div className="flex items-center gap-1 text-xs text-zinc-400">
              <Eye className="size-3.5" />
              {product.views.toLocaleString()} views
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="mb-2 font-semibold text-zinc-900">Description</h2>
            <p className="text-sm leading-relaxed whitespace-pre-line text-zinc-500">
              {product.description}
            </p>
          </div>

          {/* CTA buttons */}
          <div className="flex gap-3">
            <a
              href={`https://wa.me/${waNumber}?text=${waMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center flex-1 h-12 gap-2 font-semibold text-white transition-colors rounded-full shadow-sm bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700"
            >
              <MessageCircle className="size-4" />
              Chat on WhatsApp
            </a>
            {sellerPhone ? (
              <a
                href={`tel:${sellerPhone}`}
                className="flex items-center justify-center h-12 gap-2 px-5 font-semibold transition-colors bg-white border-2 rounded-full border-zinc-200 hover:bg-zinc-50 text-zinc-700"
              >
                <Phone className="size-4" />
                Call Seller
              </a>
            ) : (
              <Link
                to={`/seller/${product.sellerId}`}
                className="flex items-center justify-center h-12 gap-2 px-5 font-semibold transition-colors bg-white border-2 rounded-full border-zinc-200 hover:bg-zinc-50 text-zinc-700"
              >
                <Phone className="size-4" />
                Call Seller
              </Link>
            )}
          </div>

          {/* Save CTA — visible alternative to the floating heart */}
          <button
            type="button"
            disabled={isSavePending}
            onClick={() => toggleSave()}
            className={cn(
              "w-full h-11 rounded-full border-2 font-semibold text-sm flex items-center justify-center gap-2 transition-all",
              isSaved
                ? "border-red-200 bg-red-50 text-red-500 hover:bg-red-100"
                : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50",
              isSavePending && "opacity-60 cursor-not-allowed",
            )}
          >
            <Heart
              className={cn(
                "size-4 transition-colors",
                isSaved && "fill-red-500 text-red-500",
              )}
            />
            {isSaved ? "Saved" : "Save listing"}
          </button>

          {/* Safety micro-tip */}
          <p className="flex items-center justify-center gap-1.5 text-xs text-zinc-400">
            <CheckCircle2 className="size-3.5 text-emerald-500" />
            Never pay in advance. Inspect the item before payment.
          </p>

          {/* Seller card */}
          <div className="p-4 space-y-3 bg-white border shadow-sm rounded-2xl border-zinc-200">
            <p className="text-sm font-semibold text-zinc-500">
              About the Seller
            </p>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center text-lg font-bold text-white rounded-full size-11 bg-emerald-500 shrink-0">
                {sellerInitial}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="text-sm font-semibold text-zinc-900">
                    {sellerName}
                  </p>
                  {seller?.isEmailVerified && (
                    <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
                      <CheckCircle2 className="size-3" />
                      ID Verified
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-400 mt-0.5 capitalize">
                  {seller?.role ?? "NYSC Member"}
                </p>
              </div>
              <Link
                to={`/seller/${product.sellerId}`}
                className="flex items-center gap-1 text-xs font-semibold transition-colors text-emerald-600 hover:text-emerald-700 shrink-0"
              >
                <Eye className="size-3" />
                View Profile
              </Link>
            </div>
            <div className="flex items-center gap-5 pt-2 border-t border-zinc-100">
              {sellerJoined && (
                <span className="flex items-center gap-1 text-[11px] text-zinc-400">
                  <CalendarDays className="size-3" />
                  Joined {sellerJoined}
                </span>
              )}
              {sellerPhone && (
                <a
                  href={`tel:${sellerPhone}`}
                  className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium hover:underline"
                >
                  <Phone className="size-3" />
                  {sellerPhone}
                </a>
              )}
            </div>
          </div>

          {/* Ad ID + Report */}
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Ad ID: KPA-{product.id.slice(0, 6).toUpperCase()}</span>
            <a
              href={`mailto:support@kopamart.com?subject=${encodeURIComponent(
                `Report: ${product.name} (${product.id})`,
              )}&body=${encodeURIComponent(
                `Hi Kopa Support,\n\nI would like to report the following listing:\n\nListing: ${product.name}\nListing ID: ${product.id}\nSeller ID: ${product.sellerId}\nURL: ${window.location.href}\n\nReason for report:\n[Please describe the issue here]\n\nThank you.`,
              )}`}
              className="flex items-center gap-1 font-medium text-red-400 transition-colors hover:text-red-500"
            >
              <Flag className="size-3" />
              Report this listing
            </a>
          </div>
        </div>
      </div>

      {/* ── Safety tips ── */}
      <div className="max-w-6xl px-4 pb-12 mx-auto">
        <div className="p-6 bg-white border shadow-sm rounded-2xl border-zinc-200">
          <div className="flex items-center gap-2 mb-5">
            <ShieldCheck className="size-5 text-emerald-500" />
            <h3 className="font-semibold text-zinc-800">
              Safety Tips for Buyers
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              {
                icon: <MapPinned className="size-5 text-emerald-500" />,
                title: "Meet in Public",
                desc: "Always arrange to meet sellers in safe, public locations like the NYSC camp, a busy mall, or a well-lit eatery.",
              },
              {
                icon: <Eye className="size-5 text-emerald-500" />,
                title: "Inspect Before Payment",
                desc: "Never pay in advance. Thoroughly check the item to ensure it matches the description before handing over any money.",
              },
              {
                icon: <ShieldCheck className="size-5 text-emerald-500" />,
                title: "Trust the Badge",
                desc: 'Prioritize sellers with the green "ID Verified" badge. This means Kopa Market has verified their government ID and face scan.',
              },
            ].map((tip) => (
              <div
                key={tip.title}
                className="rounded-xl border border-zinc-100 bg-[#f8f8f6] p-4 space-y-2"
              >
                <div className="flex items-center justify-center border rounded-full size-9 bg-emerald-50 border-emerald-100">
                  {tip.icon}
                </div>
                <p className="text-sm font-semibold text-zinc-800">
                  {tip.title}
                </p>
                <p className="text-xs leading-relaxed text-zinc-500">
                  {tip.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;
