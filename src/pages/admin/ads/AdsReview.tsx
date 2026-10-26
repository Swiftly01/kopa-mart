import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ImageOff, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { AdminShell } from "@/components/AdminShell";
import AdStatusBadge from "@/components/ads/AdStatusBadge";
import { Input } from "@/components/ui/input";
import Pagination from "@/components/ui/pagintion";
import useGetAdminAds from "@/hooks/admin/ads/queries/useGetAdminAds";
import useGetAdminAdStats from "@/hooks/admin/ads/queries/useGetAdminAdStats";
import { AD_STATUS } from "@/lib/post-ad/adStatus";
import { formatNaira } from "@/lib/utils/formatNaira";
import type { ListingStatus } from "@/types/listing";

const PAGE_SIZE = 10;
// ads go live on their own, so live ads come first; "In review" only holds appeals
const TABS: ListingStatus[] = ["active", "pending_review", "rejected", "inactive"];

// admin list of ads: pick a tab, search by title, open one to moderate
export default function AdsReview() {
  const [searchParams, setSearchParams] = useSearchParams();
  const status = (searchParams.get("status") as ListingStatus) || "active";
  const page = Math.max(1, Number(searchParams.get("page") || "1"));
  const search = searchParams.get("search") || "";
  const [searchInput, setSearchInput] = useState(search);

  const { data, isLoading, isFetching } = useGetAdminAds({
    status,
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
  });
  const { data: stats } = useGetAdminAdStats();
  const ads = data?.data ?? [];

  const setParam = (key: string, value: string) =>
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value);
      else next.delete(key);
      if (key !== "page") next.set("page", "1");
      return next;
    });

  return (
    <AdminShell>
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Ads</h2>

        <div className="flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setParam("status", tab)}
              className={`px-3 py-1.5 text-sm rounded-full ${
                tab === status
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary"
              }`}
            >
              {AD_STATUS[tab].label}
              {stats?.[tab] !== undefined && ` (${stats[tab]})`}
            </button>
          ))}
        </div>

        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && setParam("search", searchInput)}
          placeholder="Search by title and press Enter"
        />

        {isLoading ? (
          <Loader2 className="mx-auto size-8 animate-spin text-primary" />
        ) : ads.length === 0 ? (
          <p className="py-12 text-sm text-center text-muted-foreground">
            No ads here.
          </p>
        ) : (
          <ul className={`space-y-3 ${isFetching ? "opacity-70" : ""}`}>
            {ads.map((ad) => (
              <li key={ad.id}>
                <Link
                  to={`/admin/ads/${ad.id}`}
                  className="flex gap-3 p-3 card-listing"
                >
                  <div className="flex items-center justify-center overflow-hidden rounded-lg size-20 shrink-0 bg-secondary text-muted-foreground">
                    {ad.thumbnailUrl ? (
                      <img src={ad.thumbnailUrl} alt="" className="object-cover w-full h-full" />
                    ) : (
                      <ImageOff className="size-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <p className="text-sm font-medium truncate">{ad.title}</p>
                    <p className="text-sm font-bold text-primary">{formatNaira(ad.price)}</p>
                    <p className="text-xs truncate text-muted-foreground">
                      {ad.seller?.name ?? "Unknown seller"} · {ad.lgaName}, {ad.stateName}
                    </p>
                    <div className="flex items-center gap-2">
                      <AdStatusBadge status={ad.status} />
                      <span className="text-[11px] text-muted-foreground">
                        {formatDistanceToNow(new Date(ad.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <Pagination
          currentPage={page}
          totalPages={data?.meta.totalPages ?? 1}
          onPageChange={(next) => setParam("page", String(next))}
        />
      </div>
    </AdminShell>
  );
}
