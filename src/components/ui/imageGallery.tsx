import { cn } from "@/lib/utils/utils";
import { Product } from "@/types/product";
import { ChevronLeft, ChevronRight, Package } from "lucide-react";
import { useState } from "react";

export function ImageGallery({ images }: { images: Product["images"] }) {
  const sorted = [...images].sort((a, b) => {
    if (a.isMain) return -1;
    if (b.isMain) return 1;
    return a.order - b.order;
  });

  const [active, setActive] = useState(0);

  const prev = () => setActive((i) => (i - 1 + sorted.length) % sorted.length);
  const next = () => setActive((i) => (i + 1) % sorted.length);

  const current = sorted[active];

  return (
    <div className="flex flex-col gap-3">
      {/* main image */}
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-secondary border border-border/60 group">
        {current ? (
          <img
            key={current.id}
            src={current.cloudinaryUrl}
            alt={`Image ${active + 1}`}
            className="w-full h-full object-cover transition-opacity duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="size-16 text-muted-foreground/20" />
          </div>
        )}

        {current?.isMain && (
          <span className="absolute top-3 left-3 text-[10px] font-semibold uppercase tracking-wider bg-primary text-primary-foreground px-2.5 py-1 rounded-full">
            Main
          </span>
        )}

        {sorted.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 size-9 rounded-xl bg-background/80 backdrop-blur-sm border border-border/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 size-9 rounded-xl bg-background/80 backdrop-blur-sm border border-border/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
            >
              <ChevronRight className="size-4" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {sorted.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={cn(
                    "rounded-full transition-all duration-200",
                    i === active
                      ? "w-5 h-1.5 bg-white"
                      : "size-1.5 bg-white/50 hover:bg-white/75",
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* thumbnails */}
      {sorted.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {sorted.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActive(i)}
              className={cn(
                "shrink-0 size-16 rounded-xl overflow-hidden border-2 transition-all duration-150",
                i === active
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border/60 hover:border-border",
              )}
            >
              <img
                src={img.cloudinaryUrl}
                alt={`Thumb ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}