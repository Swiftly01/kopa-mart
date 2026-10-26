import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import MyAdRow from "@/components/ads/MyAdRow";
import { Button } from "@/components/ui/button";
import Pagination from "@/components/ui/pagintion";
import { Skeleton } from "@/components/ui/skeleton";
import useGetMyListings from "@/hooks/listings/queries/useGetMyListings";
import { AD_STATUS } from "@/lib/post-ad/adStatus";
import { cn } from "@/lib/utils/utils";
import type { ListingStatus } from "@/types/listing";

const PAGE_SIZE = 10;
// "" = every status
const FILTERS: Array<ListingStatus | ""> = [
  "",
  "pending_review",
  "active",
  "rejected",
  "inactive",
  "draft",
];

// every ad the seller posted, with a status filter
export default function SellerAds() {
  const [status, setStatus] = useState<ListingStatus | "">("");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetMyListings({
    page,
    limit: PAGE_SIZE,
    ...(status ? { status } : {}),
  });
  const ads = data?.data ?? [];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <button
            key={item || "all"}
            onClick={() => {
              setStatus(item);
              setPage(1);
            }}
            className={cn(
              "px-3 py-1.5 text-xs rounded-full",
              item === status ? "bg-primary text-primary-foreground" : "bg-secondary",
            )}
          >
            {item ? AD_STATUS[item].label : "All"}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <Skeleton key={item} className="h-24 rounded-xl" />
          ))}
        </div>
      )}

      {!isLoading && ads.length === 0 && (
        <div className="py-16 space-y-3 text-center">
          <p className="text-sm text-muted-foreground">
            {status ? "No ads with this status." : "You have not posted any ads yet."}
          </p>
          {!status && (
            <Button asChild size="sm" className="bg-gradient-primary">
              <Link to="/post-ad">
                <Plus /> Post your first ad
              </Link>
            </Button>
          )}
        </div>
      )}

      <ul className="space-y-3">
        {ads.map((ad) => (
          <li key={ad.id}>
            <MyAdRow ad={ad} />
          </li>
        ))}
      </ul>

      <Pagination
        currentPage={page}
        totalPages={data?.meta.totalPages ?? 1}
        onPageChange={setPage}
      />
    </div>
  );
}
