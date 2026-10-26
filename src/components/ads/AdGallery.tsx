import { useState, type ReactNode } from "react";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import type { ListingImage } from "@/types/listing";

// big photo with a thumbnail strip; `children` are buttons floated over the photo (save, share)
export default function AdGallery({
  images,
  title,
  children,
}: {
  images: ListingImage[];
  title: string;
  children?: ReactNode;
}) {
  const [active, setActive] = useState(0);
  const image = images[active] ?? images[0];

  return (
    <div className="space-y-3">
      <div className="relative flex items-center justify-center overflow-hidden bg-white border shadow-sm rounded-2xl border-zinc-200/80 aspect-[4/3] text-muted-foreground">
        {image ? (
          <img src={image.url} alt={title} className="object-cover w-full h-full" />
        ) : (
          <ImageOff className="size-8" />
        )}
        {children}
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActive(index)}
              className={cn(
                "aspect-square rounded-xl overflow-hidden border-2 transition-all",
                index === active ? "border-emerald-500" : "border-transparent",
              )}
            >
              <img
                src={item.thumbnailUrl ?? item.url}
                alt=""
                className="object-cover w-full h-full"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
