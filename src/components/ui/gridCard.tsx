import { statusConfig } from "@/lib/productConfig";
import { cn } from "@/lib/utils/utils";
import { Product } from "@/types/product";
import { Eye, Package, Pencil, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { StockBadge } from "./stockBadge";
import { formatNaira } from "@/data/seed";

export default function GridCard({
  product,
  onDelete,
}: {
  product: Product;
  onDelete: (id: string) => void;
}) {
  const mainImage =
    product.images.find((img) => img.isMain)?.cloudinaryUrl ??
    product.images[0]?.cloudinaryUrl;

  const status =
    statusConfig[product.status?.toLowerCase()] ?? statusConfig["active"];
  const discountedPrice =
    product.discountPercentage > 0
      ? parseFloat(product.price) * (1 - product.discountPercentage / 100)
      : null;

  return (
    <div className="group bg-card border border-border/60 rounded-2xl overflow-hidden hover:border-border hover:shadow-sm transition-all duration-200 flex flex-col">
      <div className="relative aspect-square bg-secondary overflow-hidden">
        {mainImage ? (
          <img
            src={mainImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="size-10 text-muted-foreground/30" />
          </div>
        )}
        {product.discountPercentage > 0 && (
          <span className="absolute top-2 left-2 bg-rose-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-md">
            -{product.discountPercentage}%
          </span>
        )}
        <span
          className={cn(
            "absolute top-2 right-2 text-[10px] font-medium px-2 py-0.5 rounded-full",
            status.className,
          )}
        >
          {status.label}
        </span>
        <div className="absolute inset-x-0 bottom-0 p-2 flex gap-1.5 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
          
          <Link
            to={`/seller-dashboard/listing/${product.id}`}
            className="size-8 rounded-xl bg-secondary hover:bg-primary/10 hover:text-primary flex items-center justify-center transition-colors"
            title="View listing"
          >
            <Eye className="size-3.5" />
          </Link>

          <Link
            to={`/seller-dashboard/edit-listing/${product.id}`}
            className="flex-1 h-8 rounded-lg bg-white/90 backdrop-blur-sm text-foreground hover:bg-white flex items-center justify-center gap-1 text-xs font-medium transition-colors"
          >
            <Pencil className="size-3" />
            Edit
          </Link>
          <button
            onClick={() => onDelete(product.id)}
            className="h-8 w-8 rounded-lg bg-rose-500/90 backdrop-blur-sm text-white hover:bg-rose-500 flex items-center justify-center transition-colors"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>
      <div className="p-3 flex flex-col gap-1 flex-1">
        <p className="text-xs text-muted-foreground">{product.category.name}</p>
        <p className="font-medium text-sm line-clamp-2 leading-snug flex-1">
          {product.name}
        </p>
        <div className="flex items-center justify-between mt-1">
          <span className="text-primary font-bold text-sm">
            {discountedPrice
              ? formatNaira(discountedPrice)
              : formatNaira(parseFloat(product.price))}
          </span>
          <StockBadge stock={product.stock} />
        </div>
      </div>
    </div>
  );
}
