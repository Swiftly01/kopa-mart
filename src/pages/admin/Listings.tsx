import { useState, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { AdminShell } from "@/components/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Trash2,
  AlertCircle,
  Loader2,
  ChevronRight,
  User,
  MapPin,
  Tag,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Pagination from "@/components/ui/pagintion";
import useGetAllListing from "@/hooks/admin/products/queries/useGetAllListing";
import useDeleteListing from "@/hooks/admin/products/mutations/useDeleteListing";
import { ITEMS_PER_PAGE } from "@/lib/utils/config";
import { formatNaira } from "@/lib/utils/utils";
import { AdminDeleteProductModal } from "@/components/ui/adminDeleteProductModal";

const AdminListings = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL-driven filter state
  const currentPage = Math.max(1, Number(searchParams.get("page") || "1"));
  const search = searchParams.get("search") || "";
  const sellerId = searchParams.get("sellerId") || undefined;
  const categoryId = searchParams.get("categoryId") || undefined;

  // Local state for the search input (debounced via URL)
  const [searchInput, setSearchInput] = useState(search);

  // Confirmation modal state
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const { data, isLoading, isError, isFetching } = useGetAllListing({
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    search: search || undefined,
    sellerId,
    categoryId,
  });

  const { mutate: deleteListing, isPending: isDeleting } = useDeleteListing();

  const listings = data?.data ?? [];
  const totalCount = data?.meta?.totalItems ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;

  const applySearch = useCallback(
    (value: string) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (value) {
          next.set("search", value);
        } else {
          next.delete("search");
        }
        next.set("page", "1");
        return next;
      });
    },
    [setSearchParams],
  );

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") applySearch(searchInput);
  };

  const handlePageChange = (page: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("page", String(page));
      return next;
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteListing(deleteTarget.id, {
      onSettled: () => setDeleteTarget(null),
    });
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (isError) {
    return (
      <AdminShell>
        <div className="flex items-center justify-center min-h-96">
          <div className="space-y-2 text-center">
            <AlertCircle className="mx-auto size-8 text-destructive" />
            <p className="text-sm text-muted-foreground">
              Failed to load listings
            </p>
          </div>
        </div>
      </AdminShell>
    );
  }

  return (
    <>
      {deleteTarget && (
        <AdminDeleteProductModal
          productTitle={deleteTarget.title}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          isDeleting={isDeleting}
        />
      )}

      <AdminShell>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Listings</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Browse and manage all product listings
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-lg">
              <span className="text-sm font-medium text-muted-foreground">
                Total:
              </span>
              <span className="text-lg font-semibold text-foreground">
                {totalCount}
              </span>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              onBlur={() => applySearch(searchInput)}
              placeholder="Search listings by title, seller, location… (press Enter)"
              className="pl-10 border-0 rounded-lg h-11 bg-secondary hover:bg-secondary/80 focus:bg-background"
            />
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex items-center justify-center min-h-96">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Loading listings…
                </p>
              </div>
            </div>
          ) : listings.length === 0 ? (
            <div className="flex items-center justify-center min-h-96">
              <div className="space-y-2 text-center">
                <p className="text-sm font-medium text-foreground">
                  No listings found
                </p>
                <p className="text-xs text-muted-foreground">
                  Try adjusting your search query
                </p>
              </div>
            </div>
          ) : (
            <div
              className={`overflow-x-auto border rounded-lg border-border bg-card transition-opacity ${
                isFetching ? "opacity-60" : "opacity-100"
              }`}
            >
              <table className="w-full">
                <thead className="border-b bg-secondary/50 border-border">
                  <tr>
                    <th className="px-6 py-3 text-xs font-semibold tracking-wide text-left uppercase text-muted-foreground">
                      Product
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold tracking-wide text-left uppercase text-muted-foreground">
                      Seller
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold tracking-wide text-left uppercase text-muted-foreground">
                      Price
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold tracking-wide text-left uppercase text-muted-foreground">
                      Location
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold tracking-wide text-left uppercase text-muted-foreground">
                      Listed
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold tracking-wide text-right uppercase text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((listing) => (
                    <tr
                      key={listing.id}
                      className="border-b border-border hover:bg-secondary/30 transition-colors"
                    >
                      {/* Product */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {(() => {
                            const mainImg =
                              listing.images?.find((img) => img.isMain) ??
                              listing.images?.[0];
                            return mainImg?.cloudinaryUrl ? (
                              <img
                                src={mainImg.cloudinaryUrl}
                                alt={listing.name}
                                className="size-12 rounded-lg object-cover shrink-0 bg-secondary"
                              />
                            ) : (
                              <div className="size-12 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                                <Tag className="size-4 text-muted-foreground" />
                              </div>
                            );
                          })()}
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground line-clamp-1">
                              {listing.name}
                            </p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {listing.category?.name ?? "—"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Seller profile */}
                      <td className="px-6 py-4">
                        <Link
                          to={`/admin/users/${listing.seller?.id}`}
                          className="flex items-center gap-2 group w-fit"
                        >
                          {listing.seller?.profilePictureUrl ? (
                            <img
                              src={listing.seller.profilePictureUrl}
                              alt={listing.seller.firstName}
                              className="size-8 rounded-full object-cover ring-1 ring-border"
                            />
                          ) : (
                            <div className="size-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center ring-1 ring-border shrink-0">
                              <User className="size-3.5 text-primary" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                              {listing.seller?.firstName ?? "Unknown"}{" "}
                              {listing.seller?.lastName ?? ""}
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {listing.seller?.email ?? "—"}
                            </p>
                          </div>
                        </Link>
                      </td>

                      {/* Price */}
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-primary">
                          {formatNaira(listing.price)}
                        </span>
                      </td>

                      {/* Location */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <MapPin className="size-3 opacity-50 shrink-0" />
                          <span className="line-clamp-1">
                            {[listing.lgaName, listing.stateName]
                              .filter(Boolean)
                              .join(", ") || "—"}
                          </span>
                        </div>
                      </td>

                      {/* Listed date */}
                      <td className="px-6 py-4">
                        <span className="text-sm text-muted-foreground">
                          {listing.createdAt
                            ? formatDistanceToNow(new Date(listing.createdAt), {
                                addSuffix: true,
                              })
                            : "—"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="h-8 gap-1 px-3 text-xs hover:bg-primary/10 hover:text-primary"
                          >
                            <Link to={`/admin/listings/${listing.slug}`}>
                              View <ChevronRight className="size-3" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setDeleteTarget({
                                id: listing.id,
                                title: listing.name,
                              })
                            }
                            className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive text-muted-foreground"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer / Pagination */}
          {!isLoading && listings.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of{" "}
                {totalCount} listings
              </span>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </AdminShell>
    </>
  );
};

export default AdminListings;
