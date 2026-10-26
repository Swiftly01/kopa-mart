import { useRef } from "react";
import { ImagePlus, Loader2, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import appToast from "@/lib/appToast";
import { moveItem } from "@/lib/post-ad/photoHelpers";
import type { ListingImage } from "@/types/listing";

// what the photo section can do; the owner and the admin each pass their own
export interface PhotoActions {
  canAdd: boolean;
  onAdd: (files: File[]) => Promise<void>;
  onRemove: (imageId: string) => Promise<void>;
  onReorder: (imageIds: string[]) => Promise<void>;
  isBusy: boolean;
}

// photos of an existing ad: every change is saved straight away
export default function EditPhotos({
  images,
  actions,
}: {
  images: ListingImage[];
  actions: PhotoActions;
}) {
  const fileInput = useRef<HTMLInputElement>(null);

  // runs an action and shows the server's message when it fails
  const run = async (action: () => Promise<void>) => {
    try {
      await action();
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string | string[] } } })
          .response?.data?.message ?? "Something went wrong";
      appToast({
        title: "Photo change failed",
        description: Array.isArray(message) ? message.join(", ") : message,
        variant: "destructive",
      });
    }
  };

  const makeCover = (index: number) =>
    run(() =>
      actions.onReorder(moveItem(images, index, 0).map((image) => image.id)),
    );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Photos ({images.length})</p>
        {actions.canAdd && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={actions.isBusy}
            onClick={() => fileInput.current?.click()}
          >
            {actions.isBusy ? <Loader2 className="animate-spin" /> : <ImagePlus />}
            Add photos
          </Button>
        )}
      </div>

      <input
        ref={fileInput}
        type="file"
        multiple
        accept="image/*,.heic"
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = "";
          if (files.length) run(() => actions.onAdd(files));
        }}
      />

      <ul className="grid grid-cols-3 gap-2">
        {images.map((image, index) => (
          <li
            key={image.id}
            className="relative overflow-hidden rounded-lg aspect-square bg-secondary"
          >
            <img
              src={image.thumbnailUrl ?? image.url}
              alt=""
              className="object-cover w-full h-full"
            />
            {index === 0 && (
              <span className="absolute px-1.5 py-0.5 text-[10px] rounded left-1 top-1 bg-primary text-primary-foreground">
                Cover
              </span>
            )}
            <div className="absolute flex gap-1 right-1 bottom-1">
              {index !== 0 && (
                <button
                  type="button"
                  disabled={actions.isBusy}
                  onClick={() => makeCover(index)}
                  aria-label="Make cover photo"
                  className="flex items-center justify-center rounded-full size-7 bg-background/90"
                >
                  <Star className="size-4" />
                </button>
              )}
              <button
                type="button"
                disabled={actions.isBusy}
                onClick={() => run(() => actions.onRemove(image.id))}
                aria-label="Remove photo"
                className="flex items-center justify-center rounded-full size-7 bg-background/90 text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
