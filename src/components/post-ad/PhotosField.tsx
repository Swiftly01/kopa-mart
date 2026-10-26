import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { ImageOff, Plus, Star, X } from "lucide-react";
import appToast from "@/lib/appToast";
import { buildRules } from "@/lib/post-ad/formHelpers";
import {
  checkNewPhotos,
  moveItem,
  toAcceptAttribute,
} from "@/lib/post-ad/photoHelpers";
import type { FormField } from "@/types/listing";
import FieldShell from "./FieldShell";

export default function PhotosField({ field }: { field: FormField }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={field.key}
      control={control}
      rules={buildRules(field)}
      render={({ field: input }) => (
        <PhotoGrid
          field={field}
          files={(input.value as File[]) ?? []}
          onChange={input.onChange}
        />
      )}
    />
  );
}

interface PhotoGridProps {
  field: FormField;
  files: File[];
  onChange: (files: File[]) => void;
}

// the photos stay in the browser until the ad is posted
function PhotoGrid({ field, files, onChange }: PhotoGridProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragFrom, setDragFrom] = useState<number | null>(null);

  // temporary preview links, released when the photos change
  const previews = useMemo(
    () => files.map((file) => URL.createObjectURL(file)),
    [files],
  );
  useEffect(
    () => () => previews.forEach((url) => URL.revokeObjectURL(url)),
    [previews],
  );

  const handlePick = (event: ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(event.target.files ?? []);
    event.target.value = ""; // lets the user pick the same file again

    const { accepted, problems } = checkNewPhotos(field, files.length, picked);
    if (problems.length > 0) {
      appToast({
        title: "Some photos were skipped",
        description: problems.join("\n"),
        variant: "destructive",
      });
    }
    if (accepted.length > 0) onChange([...files, ...accepted]);
  };

  const removeAt = (index: number) =>
    onChange(files.filter((_, position) => position !== index));

  const canAddMore = files.length < (field.maxItems ?? Infinity);

  return (
    <FieldShell
      field={field}
      counter={field.maxItems ? `${files.length}/${field.maxItems}` : undefined}
    >
      <div className="grid grid-cols-3 gap-2">
        {files.map((file, index) => (
          <div
            key={`${file.name}-${file.size}-${index}`}
            draggable
            onDragStart={() => setDragFrom(index)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => {
              if (dragFrom !== null) onChange(moveItem(files, dragFrom, index));
              setDragFrom(null);
            }}
            className="relative overflow-hidden border rounded-lg aspect-square bg-secondary"
          >
            <PhotoPreview src={previews[index]} />

            {index === 0 && (
              <span className="absolute bottom-0 inset-x-0 py-0.5 text-[10px] font-medium text-center text-primary-foreground bg-primary/90">
                Title picture
              </span>
            )}

            <button
              type="button"
              onClick={() => removeAt(index)}
              aria-label="Remove photo"
              className="absolute flex items-center justify-center rounded-full top-1 right-1 size-6 bg-black/60 text-white"
            >
              <X className="size-3.5" />
            </button>

            {index > 0 && (
              <button
                type="button"
                onClick={() => onChange(moveItem(files, index, 0))}
                aria-label="Make title picture"
                className="absolute flex items-center justify-center rounded-full top-1 left-1 size-6 bg-black/60 text-white"
              >
                <Star className="size-3.5" />
              </button>
            )}
          </div>
        ))}

        {canAddMore && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            aria-label="Add photos"
            className="flex items-center justify-center rounded-lg aspect-square bg-primary/10 text-primary"
          >
            <Plus className="size-7" />
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        hidden
        accept={toAcceptAttribute(field.accept)}
        onChange={handlePick}
      />
    </FieldShell>
  );
}

// some formats (like HEIC) cannot be previewed in every browser
function PhotoPreview({ src }: { src: string }) {
  const [broken, setBroken] = useState(false);

  if (broken) {
    return (
      <div className="flex items-center justify-center w-full h-full text-muted-foreground">
        <ImageOff className="size-6" />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt=""
      className="object-cover w-full h-full"
      onError={() => setBroken(true)}
    />
  );
}
