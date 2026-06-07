import { useMemo, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  ShieldCheck,
  MessageCircle,
  Phone,
} from "lucide-react";
import useGetProductsInfinite from "@/hooks/products/queries/useGetProductsInfinite";
import { ProductGrid } from "@/components/ui/productGrid";
import useGetSellerProductsInfinite from "@/hooks/seller/queries/useGetSellerProductsInfinite";

const ITEMS_PER_PAGE = 10;

const SellerProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useGetSellerProductsInfinite({ limit: ITEMS_PER_PAGE, sellerId: id! });

  const products = useMemo(
    () => data?.pages.flatMap((p) => p.data) ?? [],
    [data],
  );
  const totalCount = data?.pages[0]?.meta.totalItems ?? 0;

  // Derive seller info from the first product's seller object
  const seller = products[0]?.seller;
  const firstProduct = products[0];

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
  const location = firstProduct
    ? `${firstProduct.lgaName}, ${firstProduct.stateName}`
    : "";
  const verified = seller?.status === "active";
  const wa = phone.replace(/[^\d]/g, "");

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

          <a
            href={`https://wa.me/${wa}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center flex-1 gap-2 font-medium h-11 rounded-2xl bg-gradient-primary text-primary-foreground"
          >
            <MessageCircle className="size-4" />
            WhatsApp
          </a>
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
