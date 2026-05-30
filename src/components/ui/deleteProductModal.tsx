import { formatNaira } from "@/data/seed";
import { Product } from "@/types/product";
import { AlertTriangle, Package, RefreshCw, Trash2, X } from "lucide-react";

export default function DeleteModal({
  product,
  open,
  onClose,
  onConfirm,
  isPending,
}: {
  product: Product;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
}) {
  if (!open) return null;

  return (
    /* backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && !isPending && onClose()}
    >
      {/* blur overlay */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

      {/* panel */}
      <div className="relative z-10 w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      

        <div className="p-6">
          {/* close */}
          <button
            onClick={onClose}
            disabled={isPending}
            className="absolute top-5 right-5 size-8 rounded-xl bg-secondary hover:bg-secondary/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            <X className="size-4" />
          </button>

          {/* icon */}
          <div className="mb-5 size-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
            <AlertTriangle className="size-7 text-rose-500" />
          </div>

          <h2 className="text-lg font-semibold text-foreground mb-1">
            Delete listing?
          </h2>
          <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
            This will permanently remove{" "}
            <span className="font-medium text-foreground">
              &ldquo;{product.name}&rdquo;
            </span>{" "}
            from your listings. This action cannot be undone.
          </p>

          {/* product preview */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/60 border border-border/50 mb-6">
            {product.images[0]?.cloudinaryUrl ? (
              <img
                src={product.images[0].cloudinaryUrl}
                alt={product.name}
                className="size-12 rounded-lg object-cover shrink-0"
              />
            ) : (
              <div className="size-12 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                <Package className="size-5 text-muted-foreground/50" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-medium line-clamp-1">{product.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatNaira(parseFloat(product.price))}
              </p>
            </div>
          </div>

          {/* actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isPending}
              className="flex-1 h-11 rounded-xl border border-border bg-secondary hover:bg-secondary/70 text-sm font-medium transition-colors disabled:opacity-50"
            >
              Keep listing
            </button>
            <button
              onClick={onConfirm}
              disabled={isPending}
              className="flex-1 h-11 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
            >
              {isPending ? (
                <>
                  <RefreshCw className="size-4 animate-spin" />
                  Deleting…
                </>
              ) : (
                <>
                  <Trash2 className="size-4" />
                  Yes, delete
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
