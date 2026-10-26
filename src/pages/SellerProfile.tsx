import { useMemo, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  ShieldCheck,
  MessageCircle,
  Phone,
} from "lucide-react";
import { ProductGrid } from "@/components/ui/productGrid";
import { StarRating } from "@/components/ui/starRating";
import useGetSellerProductsInfinite from "@/hooks/seller/queries/useGetSellerProductsInfinite";
import useGetAdsInfinite from "@/hooks/listings/queries/useGetAdsInfinite";
import useGetPublicAd from "@/hooks/listings/queries/useGetPublicAd";
import useUser from "@/hooks/users/queries/useUser";
import useCreateConversation from "@/hooks/chat/mutations/useCreateConversation";

const ITEMS_PER_PAGE = 10;

const SellerProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: currentUser } = useUser();
  const createConversation = useCreateConversation();
  // Ads (new listings system) and legacy products are both shown on the profile.
  const ads = useGetAdsInfinite({ limit: ITEMS_PER_PAGE, sellerId: id }, !!id);
  const legacy = useGetSellerProductsInfinite({
    limit: ITEMS_PER_PAGE,
    sellerId: id!,
  });

  const adItems = useMemo(
    () =>
      (ads.data?.pages.flatMap((p) => p.data) ?? []).map((data) => ({
        kind: "ad" as const,
        data,
      })),
    [ads.data],
  );
  const productItems = useMemo(
    () =>
      (legacy.data?.pages.flatMap((p) => p.data ?? []) ?? []).map((data) => ({
        kind: "product" as const,
        data,
      })),
    [legacy.data],
  );
  const products = useMemo(
    () => [...adItems, ...productItems],
    [adItems, productItems],
  );

  const isLoading = ads.isLoading || legacy.isLoading;
  const isFetchingNextPage = ads.isFetchingNextPage || legacy.isFetchingNextPage;
  const hasNextPage = ads.hasNextPage || legacy.hasNextPage;
  const fetchNextPage = () => {
    if (ads.hasNextPage) ads.fetchNextPage();
    if (legacy.hasNextPage) legacy.fetchNextPage();
  };
  const totalCount =
    (ads.data?.pages[0]?.meta.totalItems ?? 0) +
    (legacy.data?.pages[0]?.meta?.totalItems ?? 0);

  // Ad cards carry no seller info, so read it from the first ad's detail page
  const firstAd = adItems[0]?.data;
  const { data: firstAdDetail } = useGetPublicAd(firstAd?.slug ?? "");
  const firstProduct = productItems[0]?.data;

  const adSeller = firstAdDetail?.seller;
  const seller = adSeller
    ? {
        firstName: adSeller.name,
        lastName: "",
        phoneNumber: adSeller.phoneNumber,
        status: adSeller.isEmailVerified ? "active" : "",
        sellerReviewCount: 0,
        sellerAverageRating: 0,
      }
    : (firstProduct?.seller as any);
  const locationSource = firstAd ?? firstProduct;

  // ── Infinite scroll sentinel ───────────────────────────────────────────────
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

  // ── Card entrance animations ───────────────────────────────────────────────
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
  }, [products]);

  // While loading we might not have seller data yet — handle gracefully
  const name = seller
    ? `${seller.firstName} ${seller.lastName}`.trim()
    : "Seller";
  const phone = seller?.phoneNumber ?? "";
  const location = locationSource
    ? `${locationSource.lgaName}, ${locationSource.stateName}`
    : "";
  const verified = seller?.status === "active";

  // ── Not found (finished loading, still no products & no seller) ────────────
  if (!isLoading && products.length === 0) {
    return (
      <div className="p-10 text-sm text-center text-muted-foreground">
        Seller have no Listing yet.{" "}
        <Link to="/" className="text-primary">
          Go home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl px-4 pt-4 pb-10 mx-auto space-y-5">
      <div className="flex items-center gap-2">
        <Link
          to="/"
          className="flex items-center justify-center rounded-full size-9 bg-secondary"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <h1 className="font-bold">Seller profile</h1>
      </div>

      <div className="flex items-center gap-4 p-5 card-listing">
        <div className="flex items-center justify-center overflow-hidden text-2xl font-bold rounded-full size-16 bg-gradient-primary text-primary-foreground">
          {name[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-lg font-bold truncate">{name}</p>
          {location && (
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3" />
              {location}
            </p>
          )}
          {verified && (
            <span className="flex items-center gap-1 mt-1 badge-verified">
              <ShieldCheck className="size-3" />
              Verified NYSC Seller
            </span>
          )}
          {!!seller?.sellerReviewCount && (
            <div className="mt-1.5">
              <StarRating
                value={seller.sellerAverageRating ?? 0}
                showValue
                reviewCount={seller.sellerReviewCount}
                size="xs"
              />
            </div>
          )}
        </div>
      </div>

      {phone && (
        <div className="flex gap-2">
          <a
            href={`tel:${phone}`}
            className="flex items-center justify-center flex-1 gap-2 font-medium h-11 rounded-2xl bg-secondary text-secondary-foreground"
          >
            <Phone className="size-4" />
            Call
          </a>

          <button
            type="button"
            onClick={() => {
              if (!currentUser) return navigate("/login");
              if (!id) return;
              createConversation.mutate(
                { participantIds: [id] },
                { onSuccess: (conversation) => navigate(`/messages/${conversation.id}`) },
              );
            }}
            disabled={createConversation.isPending}
            className="flex items-center justify-center flex-1 gap-2 font-medium h-11 rounded-2xl bg-gradient-primary text-primary-foreground disabled:opacity-60"
          >
            <MessageCircle className="size-4" />
            Message
          </button>
        </div>
      )}
      {/* ── Listings with infinite scroll ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-semibold">Listings</h2>
            {!isLoading && totalCount > 0 && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {totalCount.toLocaleString()}{" "}
                {totalCount === 1 ? "listing" : "listings"}
              </p>
            )}
          </div>
        </div>

        <ProductGrid
          products={products}
          isLoading={isLoading}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage}
          activeFilters={0}
          onClearFilters={() => {}}
          gridRef={gridRef}
          sentinelRef={sentinelRef}
          cols={2}
        />
      </section>
    </div>
  );
};

export default SellerProfile;