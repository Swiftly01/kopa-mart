import { getByPath } from "@/lib/post-ad/formHelpers";
import type { FormField, ListingDetailData } from "@/types/listing";

export interface DetailRow {
  label: string;
  value: string;
}

// "furnishing_status" -> "Furnishing status" (used when the form description is not loaded)
const humanize = (key: string) =>
  key.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());

function formatValue(value: unknown, field?: FormField): string {
  if (Array.isArray(value)) {
    return value.map((item) => formatValue(item, field)).join(", ");
  }
  if (typeof value === "boolean") return value ? "Yes" : "No";
  const option = field?.options?.find((o) => o.value === value);
  return option ? option.label : String(value);
}

// label/value rows for the category-specific part of an ad (bedrooms, furnishing, ...)
export function buildDetailRows(
  listing: ListingDetailData,
  fields: FormField[] | undefined,
): DetailRow[] {
  const details = listing.details ?? {};

  // with the form description we get nice labels and keep the form's order
  if (fields) {
    return fields
      .filter((field) => field.key.startsWith("details."))
      .flatMap((field) => {
        const value = getByPath({ details }, field.key);
        const empty =
          value === undefined ||
          value === null ||
          value === "" ||
          (Array.isArray(value) && value.length === 0);
        return empty ? [] : [{ label: field.label, value: formatValue(value, field) }];
      });
  }

  return Object.entries(details)
    .filter(([, value]) => value !== null && value !== "")
    .map(([key, value]) => ({ label: humanize(key), value: formatValue(value) }));
}
