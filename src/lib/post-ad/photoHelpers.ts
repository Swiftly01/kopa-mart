import type { FormField } from "@/types/listing";

const BYTES_PER_MB = 1024 * 1024;

const extensionOf = (fileName: string) =>
  fileName.includes(".") ? fileName.split(".").pop()!.toLowerCase() : "";

export interface PhotoCheckResult {
  accepted: File[];
  problems: string[];
}

// keeps the files that are allowed and explains why the others were dropped
export function checkNewPhotos(
  field: FormField,
  currentCount: number,
  newFiles: File[],
): PhotoCheckResult {
  const allowedFormats = field.accept ?? [];
  const maxSize = (field.maxFileSizeMb ?? 10) * BYTES_PER_MB;
  const maxItems = field.maxItems ?? Infinity;

  const accepted: File[] = [];
  const problems: string[] = [];

  for (const file of newFiles) {
    if (allowedFormats.length && !allowedFormats.includes(extensionOf(file.name))) {
      problems.push(`${file.name}: format not supported`);
    } else if (file.size > maxSize) {
      problems.push(`${file.name}: must not exceed ${field.maxFileSizeMb ?? 10} Mb`);
    } else if (currentCount + accepted.length >= maxItems) {
      problems.push(`${file.name}: you can add at most ${maxItems} photos`);
    } else {
      accepted.push(file);
    }
  }
  return { accepted, problems };
}

// value for <input accept="...">, e.g. ".jpg,.png"
export const toAcceptAttribute = (formats: string[] = []) =>
  formats.map((format) => `.${format}`).join(",");

// moves one item to a new position (used for drag to reorder)
export function moveItem<T>(list: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) {
    return list;
  }
  const copy = [...list];
  const [moved] = copy.splice(from, 1);
  copy.splice(to, 0, moved);
  return copy;
}
