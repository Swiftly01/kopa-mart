import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type { FieldValues, UseFormSetError } from "react-hook-form";
import appToast from "@/lib/appToast";
import { handleAxiosError } from "@/lib/utils/errors/errorHandler";
import { buildPayload } from "@/lib/post-ad/formHelpers";
import type { ListingFormSchema } from "@/types/listing";
import { listingKeys } from "../listingKeys";
import useCreateListing from "../mutations/useCreateListing";
import usePublishListing from "../mutations/usePublishListing";
import useUpdateListing from "../mutations/useUpdateListing";
import useUploadListingImages from "../mutations/useUploadListingImages";

// Posting an ad is three API calls: save draft -> upload photos -> publish.
// If one fails, the steps that already worked are remembered, so pressing
// "Post ad" again continues instead of starting over (no duplicate drafts).
export default function usePostAdSubmit(schema: ListingFormSchema) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createListing = useCreateListing();
  const updateListing = useUpdateListing();
  const uploadImages = useUploadListingImages();
  const publishListing = usePublishListing();

  const progress = useRef({ listingId: "", photosUploaded: false });

  const submit = async (
    values: FieldValues,
    setError: UseFormSetError<FieldValues>,
  ) => {
    try {
      const payload = buildPayload(schema.fields, values);

      // 1. draft (created once, then updated on retries)
      if (progress.current.listingId) {
        await updateListing.mutateAsync({
          listingId: progress.current.listingId,
          payload,
        });
      } else {
        const draft = await createListing.mutateAsync({
          categoryId: schema.category.id,
          ...payload,
        });
        progress.current.listingId = draft.id;
      }

      // 2. photos, in the order the user arranged them
      if (!progress.current.photosUploaded) {
        await uploadImages.mutateAsync({
          listingId: progress.current.listingId,
          files: values.images as File[],
        });
        progress.current.photosUploaded = true;
      }

      // 3. publish
      await publishListing.mutateAsync(progress.current.listingId);

      await queryClient.invalidateQueries({ queryKey: listingKeys.all });
      appToast({
        title: "Your ad is live!",
        description: "Buyers can see it now",
      });
      navigate("/my-ads");
    } catch (error) {
      handleAxiosError(error as AxiosError, setError);
    }
  };

  const isSubmitting =
    createListing.isPending ||
    updateListing.isPending ||
    uploadImages.isPending ||
    publishListing.isPending;

  return { submit, isSubmitting };
}
