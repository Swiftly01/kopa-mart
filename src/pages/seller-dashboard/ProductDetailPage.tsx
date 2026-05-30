/**
 * ProductDetailPage.tsx
 *
 * Full-page product detail view for seller dashboard.
 * Includes image gallery, all product metadata, and a
 * delete confirmation modal wired to react-query mutations.
 *
 * Dependencies: react-query, lucide-react, react-router-dom, tailwindcss
 * Drop-in replacements for your existing formatNaira, conditionConfig,
 * statusConfig, and Product type imports.
 */

import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowLeft,
  BarChart2,
  Box,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Hash,
  MapPin,
  Package,
  Pencil,
  RefreshCw,
  Star,
  Tag,
  Trash2,
  X,
  Zap,
} from "lucide-react";

import { formatNaira } from "@/data/seed";
import { conditionConfig, statusConfig } from "@/lib/productConfig";
import { cn } from "@/lib/utils/utils";
import { Product, ProductCondition } from "@/types/product";
import useGetProduct from "@/hooks/products/queries/useGetProduct";
import useDeleteProduct from "@/hooks/products/mutations/useDeleteProduct";
import appToast from "@/lib/appToast";
import { AxiosError } from "axios";
import { handleAxiosError } from "@/lib/utils/errors/errorHandler";
import { ImageGallery } from "@/components/ui/imageGallery";
import StatPill from "@/components/ui/statPill";
import DeleteModal from "@/components/ui/deleteProductModal";
import DetailRow from "@/components/ui/detailRow";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: product, isLoading, isError, error } = useGetProduct(id);

  const deleteMutation = useDeleteProduct();
  function handleDelete() {
    deleteMutation.mutate(
      { productId: id },
      {
        onSuccess: () => {
          appToast({
            title: "Delete Product",
            description: "Product removed successfully",
          });
          navigate("/seller-dashboard/listings", { replace: true });
        },

        onError: (err: AxiosError) => {
          handleAxiosError(err);
        },
      },
    );
  }

 
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <RefreshCw className="size-7 animate-spin" />
          <p className="text-sm">Loading product…</p>
        </div>
      </div>
    );
  }

  
  if (isError || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="size-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="size-8 text-destructive" />
          </div>
          <h2 className="text-lg font-semibold mb-2">Product not found</h2>
          <p className="text-sm text-muted-foreground mb-6">
            {(error as Error)?.message ??
              "Something went wrong loading this product."}
          </p>
          <Link
            to="/seller-dashboard/listings"
            className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back to listings
          </Link>
        </div>
      </div>
    );
  }

  // ── derived values ─────────────────────────────────────────────────────────
  const condition =
    conditionConfig[product.condition?.toLowerCase()] ??
    conditionConfig[ProductCondition.FAIR];
  const status =
    statusConfig[product.status?.toLowerCase()] ?? statusConfig["active"];
  const rating = parseFloat(product.rating ?? "0");
  const discountedPrice =
    product.discountPercentage > 0
      ? parseFloat(product.price) * (1 - product.discountPercentage / 100)
      : null;

  const createdDate = new Date(product.createdAt).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const updatedDate = new Date(product.updatedAt).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="min-h-screen bg-background">
        {/* ── breadcrumb / topbar ── */}
        <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-md border-b border-border/60">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 min-w-0">
              <Link
                to="/seller-dashboard/manage-listings"
                className="size-8 rounded-xl bg-secondary hover:bg-secondary/80 flex items-center justify-center shrink-0 transition-colors"
              >
                <ArrowLeft className="size-4" />
              </Link>
              <div className="flex items-center gap-1.5 text-sm min-w-0 text-muted-foreground">
                <span className="hidden sm:block">Listings</span>
                <span className="hidden sm:block">/</span>
                <span className="font-medium text-foreground truncate">
                  {product.name}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                to={`/seller-dashboard/edit-listing/${product.id}`}
                className="h-9 px-4 rounded-xl bg-secondary hover:bg-secondary/80 text-sm font-medium flex items-center gap-1.5 transition-colors"
              >
                <Pencil className="size-3.5" />
                <span className="hidden sm:block">Edit</span>
              </Link>
              <button
                onClick={() => setDeleteOpen(true)}
                className="h-9 px-4 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 text-sm font-medium flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="size-3.5" />
                <span className="hidden sm:block">Delete</span>
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
            {/* ── left col ── */}
            <div className="space-y-6">
              <ImageGallery images={product.images} />

              {/* description */}
              {product.description && (
                <div className="bg-card border border-border/60 rounded-2xl p-5">
                  <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-3">
                    Description
                  </h3>
                  <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              )}

              {/* detail rows */}
              <div className="bg-card border border-border/60 rounded-2xl px-5 py-1">
                <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-medium pt-4 mb-1">
                  Details
                </h3>

                <DetailRow icon={Tag} label="Category">
                  {product?.category?.name}
                </DetailRow>

                <DetailRow icon={Zap} label="Condition">
                  <span
                    className={cn(
                      "inline-flex text-[11px] font-medium px-2.5 py-0.5 rounded-full",
                      condition.className,
                    )}
                  >
                    {condition.label}
                  </span>
                </DetailRow>

                <DetailRow icon={CheckCircle2} label="Status">
                  <span
                    className={cn(
                      "inline-flex text-[11px] font-medium px-2.5 py-0.5 rounded-full",
                      status.className,
                    )}
                  >
                    {status.label}
                  </span>
                </DetailRow>

                <DetailRow icon={MapPin} label="Location">
                  {product.stateName}, {product.lgaName}
                </DetailRow>

                {product.sku && (
                  <DetailRow icon={Hash} label="SKU">
                    <span className="font-mono text-xs bg-secondary px-2 py-0.5 rounded-md">
                      {product.sku}
                    </span>
                  </DetailRow>
                )}

                <DetailRow icon={Calendar} label="Listed">
                  {createdDate}
                </DetailRow>

                <DetailRow icon={RefreshCw} label="Updated">
                  {updatedDate}
                </DetailRow>
              </div>
            </div>

            {/* ── right col ── */}
            <div className="space-y-4">
              {/* title + price card */}
              <div className="bg-card border border-border/60 rounded-2xl p-5 space-y-4">
                {/* badges */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className={cn(
                      "text-[10px] font-medium px-2.5 py-0.5 rounded-full",
                      condition.className,
                    )}
                  >
                    {condition.label}
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-medium px-2.5 py-0.5 rounded-full",
                      status.className,
                    )}
                  >
                    {status.label}
                  </span>
                  {!product.isActive && (
                    <span className="text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-secondary text-muted-foreground">
                      Inactive
                    </span>
                  )}
                </div>

                <div>
                  <h1 className="text-xl font-semibold leading-snug">
                    {product.name}
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    {product.category.name}
                  </p>
                </div>

                {/* pricing */}
                <div className="flex items-end gap-3">
                  <span className="text-3xl font-bold text-primary tracking-tight">
                    {discountedPrice
                      ? formatNaira(discountedPrice)
                      : formatNaira(parseFloat(product.price))}
                  </span>
                  {discountedPrice && (
                    <div className="pb-1 flex items-center gap-2">
                      <span className="text-sm text-muted-foreground line-through">
                        {formatNaira(parseFloat(product.price))}
                      </span>
                      <span className="text-xs font-semibold text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded-md">
                        -{product.discountPercentage}%
                      </span>
                    </div>
                  )}
                </div>

                {/* rating */}
                {rating > 0 && (
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "size-4",
                          i < Math.round(rating)
                            ? "fill-amber-400 stroke-amber-400"
                            : "fill-muted stroke-muted-foreground/20",
                        )}
                      />
                    ))}
                    <span className="text-sm font-medium text-amber-500 ml-0.5">
                      {rating.toFixed(1)}
                    </span>
                    {product.reviewCount > 0 && (
                      <span className="text-sm text-muted-foreground">
                        ({product.reviewCount}{" "}
                        {product.reviewCount === 1 ? "review" : "reviews"})
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* stats grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <StatPill
                  icon={Box}
                  label="In Stock"
                  value={product.stock}
                  accent={product.stock > 0}
                />
                <StatPill
                  icon={Eye}
                  label="Views"
                  value={product.views.toLocaleString()}
                />
                <StatPill
                  icon={BarChart2}
                  label="Reviews"
                  value={product.reviewCount}
                />
                <StatPill
                  icon={Tag}
                  label="Discount"
                  value={
                    product.discountPercentage > 0
                      ? `${product.discountPercentage}% off`
                      : "None"
                  }
                />
              </div>

              {/* location card */}
              <div className="bg-card border border-border/60 rounded-2xl p-4 flex items-center gap-3">
                <div className="size-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                  <MapPin className="size-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-0.5">
                    Location
                  </p>
                  <p className="text-sm font-medium">
                    {product.lgaName}, {product.stateName}
                  </p>
                </div>
              </div>

              {/* actions */}
              <div className="flex flex-col gap-2.5">
                <Link
                  to={`/seller-dashboard/edit-listing/${product.id}`}
                  className="h-12 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
                >
                  <Pencil className="size-4" />
                  Edit listing
                </Link>
                <button
                  onClick={() => setDeleteOpen(true)}
                  className="h-12 rounded-2xl border border-destructive/30 bg-destructive/5 text-destructive text-sm font-semibold flex items-center justify-center gap-2 hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="size-4" />
                  Delete listing
                </button>
              </div>

              {/* meta */}
              <div className="text-[11px] text-muted-foreground space-y-1 px-1">
                <p>
                  Listed:{" "}
                  <span className="text-foreground/70">{createdDate}</span>
                </p>
                <p>
                  Last updated:{" "}
                  <span className="text-foreground/70">{updatedDate}</span>
                </p>
                {product.sku && (
                  <p>
                    SKU:{" "}
                    <span className="font-mono text-foreground/70">
                      {product.sku}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

     
      <DeleteModal
        product={product}
        open={deleteOpen}
        onClose={() => !deleteMutation.isPending && setDeleteOpen(false)}
        onConfirm={() => handleDelete()}
        isPending={deleteMutation.isPending}
      />
    </>
  );
}
