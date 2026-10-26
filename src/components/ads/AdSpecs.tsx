import useGetListingForm from "@/hooks/listings/queries/useGetListingForm";
import { buildDetailRows } from "@/lib/post-ad/detailRows";
import type { ListingDetailData } from "@/types/listing";

// category details (bedrooms, condition, ...), the description and the video link
export default function AdSpecs({ ad }: { ad: ListingDetailData }) {
  const { data: schema } = useGetListingForm(ad.category.id);
  const rows = buildDetailRows(ad, schema?.fields);

  return (
    <div className="space-y-4">
      {rows.length > 0 && (
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 p-3 bg-white border rounded-xl">
          {rows.map((row) => (
            <div key={row.label}>
              <dt className="text-xs text-muted-foreground">{row.label}</dt>
              <dd className="text-sm font-medium">{row.value}</dd>
            </div>
          ))}
        </dl>
      )}

      <div>
        <h2 className="mb-2 font-semibold">Description</h2>
        <p className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
          {ad.description}
        </p>
      </div>

      {ad.videoUrl && (
        <a
          href={ad.videoUrl}
          target="_blank"
          rel="noreferrer"
          className="text-sm underline text-primary"
        >
          Watch video
        </a>
      )}
    </div>
  );
}
