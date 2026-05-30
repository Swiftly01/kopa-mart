import { SellerShell } from "@/components/SellerShell";
import { Button } from "@/components/ui/button";
import DeleteModal from "@/components/ui/deleteProductModal";
import FilterChip from "@/components/ui/filterChip";
import FilterPanel from "@/components/ui/filterPanel";
import GridCard from "@/components/ui/gridCard";
import { Input } from "@/components/ui/input";
import ListingCard from "@/components/ui/listingCard";
import Pagination from "@/components/ui/pagintion";
import useDeleteProduct from "@/hooks/products/mutations/useDeleteProduct";
import useGetSellerProducts from "@/hooks/products/queries/useGetSellerProducts";
import { toast } from "@/hooks/use-toast";
import useUser from "@/hooks/users/queries/useUser";
import appToast from "@/lib/appToast";
import {
  conditionConfig,
  countActiveFilters,
  sortByOptions,
} from "@/lib/productConfig";
import { handleAxiosError } from "@/lib/utils/errors/errorHandler";
import { cn } from "@/lib/utils/utils";
import { Product, type FilterState } from "@/types/product";
import { QueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  AlertCircle,
  ArrowUpDown,
  LayoutGrid,
  List,
  Loader2,
  Package,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

const ITEMS_PER_PAGE = 10;

const DEFAULT_FILTERS: FilterState = {
  stateName: "",
  lgaName: "",
  minPrice: "",
  maxPrice: "",
  condition: "",
  sortBy: "",
};

const ManageListings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = Math.max(1, Number(searchParams.get("page") || "1"));
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { data: userData } = useUser();
  const sellerId = userData?.id;

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  // Debounce search so we don't fire on every keystroke
  const searchTimeout = useState<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (searchTimeout[0]) clearTimeout(searchTimeout[0]);
    searchTimeout[1](
      setTimeout(() => {
        setDebouncedSearch(value);
        setSearchParams({ page: "1" });
      }, 400),
    );
  };

  const queryParams = useMemo(
    () => ({
      page: currentPage,
      limit: ITEMS_PER_PAGE,

      sellerId,

      ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),

      ...(filters.condition ? { condition: filters.condition } : {}),
      ...(filters.stateName.trim()
        ? { stateName: filters.stateName.trim() }
        : {}),
      ...(filters.lgaName.trim() ? { lgaName: filters.lgaName.trim() } : {}),
      ...(filters.minPrice !== ""
        ? { minPrice: Number(filters.minPrice) }
        : {}),
      ...(filters.maxPrice !== ""
        ? { maxPrice: Number(filters.maxPrice) }
        : {}),
      ...(filters.sortBy ? { sortBy: filters.sortBy } : {}),
    }),
    [currentPage, sellerId, debouncedSearch, filters],
  );

  const { data, isLoading, isError, isFetching } =
    useGetSellerProducts(queryParams);

  const products = useMemo(() => data?.data ?? [], [data]);
  const totalCount = data?.meta?.totalItems ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;
  const activeFilterCount = countActiveFilters(filters);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setSearchParams({ page: "1" });
  };

  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSearchParams({ page: "1" });
  };

  const openDeleteModal = (product: Product) => {
    setSelectedProduct(product);
    setDeleteOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteOpen(false);
    setSelectedProduct(null);
  };

  const deleteMutation = useDeleteProduct();

  const handleDelete = () => {
    if (!selectedProduct) return;

    deleteMutation.mutate(
      { productId: selectedProduct.id },
      {
        onSuccess: () => {
          appToast({
            title: "Delete Product",
            description: "Product removed successfully",
          });
          closeDeleteModal();
        },

        onError: (err: AxiosError) => {
          handleAxiosError(err);
        },
      },
    );
  };

  const handlePageChange = (page: number) => {
    setSearchParams({ page: String(page) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isError) {
    return (
      <SellerShell>
        <div className="flex items-center justify-center min-h-96">
          <div className="space-y-3 text-center">
            <div className="size-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
              <AlertCircle className="size-6 text-destructive" />
            </div>
            <div className="space-y-1">
              <p className="font-medium text-sm">Failed to load listings</p>
              <p className="text-xs text-muted-foreground">
                Please refresh the page and try again.
              </p>
            </div>
          </div>
        </div>
      </SellerShell>
    );
  }

  return (
    <SellerShell>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-semibold leading-none">My Listings</h1>
          {!isLoading && (
            <p className="text-xs text-muted-foreground mt-1">
              {totalCount.toLocaleString()}{" "}
              {totalCount === 1 ? "listing" : "listings"} total
            </p>
          )}
        </div>
        <Button asChild size="sm" className="bg-gradient-primary gap-1.5">
          <Link to="/seller-dashboard/create-listing">
            <Plus className="size-3.5" />
            Add listing
          </Link>
        </Button>
      </div>

      {/* Search + controls row */}
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by name, category, location…"
            className="pl-10 h-10 rounded-2xl bg-secondary border-0 text-sm"
          />
          {/* Show spinner inside search box while fetching */}
          {isFetching && !isLoading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 size-3.5 animate-spin text-muted-foreground" />
          )}
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={cn(
            "relative h-10 px-3 rounded-2xl flex items-center gap-1.5 text-sm font-medium transition-colors border",
            showFilters
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-secondary border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          <SlidersHorizontal className="size-4" />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <span
              className={cn(
                "absolute -top-1.5 -right-1.5 size-4 rounded-full text-[10px] font-bold flex items-center justify-center",
                showFilters ? "bg-white text-primary" : "bg-primary text-white",
              )}
            >
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Quick sort (desktop) */}
        <div className="relative hidden sm:block">
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange("sortBy", e.target.value)}
            className={cn(
              "h-10 pl-8 pr-3 rounded-2xl border-0 bg-secondary text-sm appearance-none focus:outline-none cursor-pointer transition-colors",
              filters.sortBy
                ? "text-foreground font-medium"
                : "text-muted-foreground",
            )}
          >
            <option value="">Sort</option>
            {sortByOptions.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <ArrowUpDown className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
        </div>

        {/* View toggle */}
        <div className="flex bg-secondary rounded-2xl p-1 gap-0.5">
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "size-8 rounded-xl flex items-center justify-center transition-colors",
              viewMode === "list"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <List className="size-4" />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "size-8 rounded-xl flex items-center justify-center transition-colors",
              viewMode === "grid"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <LayoutGrid className="size-4" />
          </button>
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="mb-4">
          <FilterPanel
            filters={filters}
            onChange={handleFilterChange}
            onClear={handleClearFilters}
          />
        </div>
      )}

      {/* Active filter chips */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {filters.condition && (
            <FilterChip
              label={`Condition: ${conditionConfig[filters.condition]?.label}`}
              onRemove={() => handleFilterChange("condition", "")}
            />
          )}
          {filters.stateName && (
            <FilterChip
              label={`State: ${filters.stateName}`}
              onRemove={() => handleFilterChange("stateName", "")}
            />
          )}
          {filters.lgaName && (
            <FilterChip
              label={`LGA: ${filters.lgaName}`}
              onRemove={() => handleFilterChange("lgaName", "")}
            />
          )}
          {filters.minPrice && (
            <FilterChip
              label={`Min: ₦${Number(filters.minPrice).toLocaleString()}`}
              onRemove={() => handleFilterChange("minPrice", "")}
            />
          )}
          {filters.maxPrice && (
            <FilterChip
              label={`Max: ₦${Number(filters.maxPrice).toLocaleString()}`}
              onRemove={() => handleFilterChange("maxPrice", "")}
            />
          )}
          {filters.sortBy && (
            <FilterChip
              label={
                sortByOptions.find((o) => o.value === filters.sortBy)?.label ??
                ""
              }
              onRemove={() => handleFilterChange("sortBy", "")}
            />
          )}
        </div>
      )}

      {/* States */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-72">
          <div className="flex flex-col items-center gap-2.5">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading listings…</p>
          </div>
        </div>
      ) : products.length === 0 &&
        !debouncedSearch &&
        activeFilterCount === 0 ? (
        // Truly empty — no listings at all
        <div className="flex flex-col items-center justify-center text-center py-20 gap-4">
          <div className="size-14 rounded-2xl bg-secondary flex items-center justify-center">
            <Package className="size-7 text-muted-foreground/60" />
          </div>
          <div className="space-y-1">
            <p className="font-medium text-sm">No listings yet</p>
            <p className="text-xs text-muted-foreground max-w-56">
              Create your first listing to start selling.
            </p>
          </div>
          <Button asChild size="sm" className="bg-gradient-primary">
            <Link to="/seller-dashboard/create-listing">
              <Plus className="size-4 mr-1" />
              Create listing
            </Link>
          </Button>
        </div>
      ) : products.length === 0 ? (
        // Filtered — no matches
        <div className="flex flex-col items-center justify-center text-center py-20 gap-4">
          <div className="size-14 rounded-2xl bg-secondary flex items-center justify-center">
            <Search className="size-7 text-muted-foreground/60" />
          </div>
          <div className="space-y-1">
            <p className="font-medium text-sm">No results found</p>
            <p className="text-xs text-muted-foreground max-w-56">
              Try adjusting your search or filters.
            </p>
          </div>
          <button
            onClick={() => {
              handleClearFilters();
              setSearchQuery("");
              setDebouncedSearch("");
            }}
            className="text-xs text-primary underline underline-offset-2"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Result count when filtering */}
          {(debouncedSearch || activeFilterCount > 0) && (
            <p className="text-xs text-muted-foreground">
              {totalCount} result{totalCount !== 1 ? "s" : ""}
            </p>
          )}

          {viewMode === "list" ? (
            <div className="space-y-2.5">
              {products.map((product) => (
                <ListingCard
                  key={product.id}
                  product={product}
                  onDelete={() => openDeleteModal(product)}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {products.map((product) => (
                <GridCard
                  key={product.id}
                  product={product}
                  onDelete={() => openDeleteModal(product)}
                />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <span className="text-xs text-muted-foreground">
                {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of{" "}
                {totalCount.toLocaleString()} listings
              </span>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      )}

      <DeleteModal
        product={selectedProduct}
        open={deleteOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        isPending={false}
      />
    </SellerShell>
  );
};

export default ManageListings;
