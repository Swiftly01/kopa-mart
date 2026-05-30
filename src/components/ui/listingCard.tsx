import { formatNaira } from "@/data/seed";
import { conditionConfig, statusConfig } from "@/lib/productConfig";
import { cn } from "@/lib/utils/utils";
import { Product, ProductCondition } from "@/types/product";
import { Eye, Package, Pencil, Star, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { StockBadge } from "./stockBadge";

export default function ListingCard({
  product,
  onDelete,
}: {
  product: Product;
  onDelete: (id: string) => void;
}) {


  const mainImage =
    product.images.find((img) => img.isMain)?.cloudinaryUrl ??
    product.images[0]?.cloudinaryUrl;

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

  return (
    <div className="group relative bg-card border border-border/60 rounded-2xl overflow-hidden flex gap-0 hover:border-border hover:shadow-sm transition-all duration-200">
      <div className="relative w-28 sm:w-36 shrink-0 self-stretch overflow-hidden bg-secondary">
        {mainImage ? (
          <img
            src={mainImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="size-8 text-muted-foreground/40" />
          </div>
        )}
        {product.discountPercentage > 0 && (
          <span className="absolute top-2 left-2 bg-rose-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-md">
            -{product.discountPercentage}%
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0 p-3 flex flex-col justify-between gap-1.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={cn(
              "text-[10px] font-medium px-2 py-0.5 rounded-full",
              condition.className,
            )}
          >
            {condition.label}
          </span>
          <span
            className={cn(
              "text-[10px] font-medium px-2 py-0.5 rounded-full",
              status.className,
            )}
          >
            {status.label}
          </span>
          <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
            {product.category.name}
          </span>
        </div>

        <p className="font-medium text-sm leading-snug line-clamp-2">
          {product.name}
        </p>

        <div className="flex items-baseline gap-2">
          <span className="text-primary font-bold text-base">
            {discountedPrice
              ? formatNaira(discountedPrice)
              : formatNaira(parseFloat(product.price))}
          </span>
          {discountedPrice && (
            <span className="text-xs text-muted-foreground line-through">
              {formatNaira(parseFloat(product.price))}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs text-muted-foreground">
            {product.stateName}, {product.lgaName}
          </span>
          {rating > 0 && (
            <span className="flex items-center gap-0.5 text-xs text-amber-500">
              <Star className="size-3 fill-amber-400 stroke-amber-400" />
              {rating.toFixed(1)}
              {product.reviewCount > 0 && (
                <span className="text-muted-foreground ml-0.5">
                  ({product.reviewCount})
                </span>
              )}
            </span>
          )}
          {product.views > 0 && (
            <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
              <Eye className="size-3" />
              {product.views.toLocaleString()}
            </span>
          )}
          <StockBadge stock={product.stock} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5 justify-center p-3 shrink-0">
        <Link
          to={`/seller-dashboard/listing/${product.id}`}
          className="size-8 rounded-xl bg-secondary hover:bg-primary/10 hover:text-primary flex items-center justify-center transition-colors"
          title="View listing"
        >
          <Eye className="size-3.5" />
        </Link>

        <Link
          to={`/seller-dashboard/edit-listing/${product.id}`}
          className="size-8 rounded-xl bg-secondary hover:bg-primary/10 hover:text-primary flex items-center justify-center transition-colors"
          title="Edit listing"
        >
          <Pencil className="size-3.5" />
        </Link>
        <button
          onClick={() => onDelete(product.id)}
          className="size-8 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 flex items-center justify-center transition-colors"
          title="Delete listing"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
