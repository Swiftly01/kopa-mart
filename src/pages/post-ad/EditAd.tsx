import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import AdEditForm from "@/components/post-ad/AdEditForm";
import { Skeleton } from "@/components/ui/skeleton";
import useUpdateListing from "@/hooks/listings/mutations/useUpdateListing";
import useOwnerPhotoActions from "@/hooks/listings/mutations/useOwnerPhotoActions";
import useGetListingForm from "@/hooks/listings/queries/useGetListingForm";
import useGetMyListing from "@/hooks/listings/queries/useGetMyListing";
import appToast from "@/lib/appToast";
import { useQueryClient } from "@tanstack/react-query";
import { listingKeys } from "@/hooks/listings/listingKeys";

// the owner edits one of their ads (a live ad stays live)
export default function EditAd() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id = "" } = useParams<{ id: string }>();
  const { data: ad, isLoading } = useGetMyListing(id);
  const { data: schema } = useGetListingForm(ad?.category.id ?? "");
  const updateListing = useUpdateListing();
  const photoActions = useOwnerPhotoActions(id);

  const save = async (payload: Record<string, unknown>) => {
    await updateListing.mutateAsync({ listingId: id, payload });
    await queryClient.invalidateQueries({ queryKey: listingKeys.all });
    appToast({ title: "Changes saved" });
    navigate(`/my-ads/${id}`);
  };

  return (
    <div className="max-w-2xl px-4 pt-4 pb-10 mx-auto space-y-5">
      <header className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} aria-label="Back">
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="text-lg font-bold">Edit ad</h1>
      </header>

      {isLoading || !ad || !schema ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((item) => (
            <Skeleton key={item} className="h-12 rounded-md" />
          ))}
        </div>
      ) : (
        <>
          <AdEditForm
            schema={schema}
            ad={ad}
            photoActions={photoActions}
            onSave={save}
          />
        </>
      )}
    </div>
  );
}
