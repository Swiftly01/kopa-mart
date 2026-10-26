import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ListingService } from "@/services/listingService";
import { listingKeys } from "../listingKeys";
import type { PhotoActions } from "@/components/post-ad/EditPhotos";

// photo changes on the owner's own ad (add, remove, reorder)
export default function useOwnerPhotoActions(listingId: string): PhotoActions {
  const queryClient = useQueryClient();
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: listingKeys.all });

  const add = useMutation({
    mutationFn: (files: File[]) => ListingService.uploadImages(listingId, files),
    onSuccess: refresh,
  });
  const remove = useMutation({
    mutationFn: (imageId: string) =>
      ListingService.deleteImage(listingId, imageId),
    onSuccess: refresh,
  });
  const reorder = useMutation({
    mutationFn: (imageIds: string[]) =>
      ListingService.reorderImages(listingId, imageIds),
    onSuccess: refresh,
  });

  return {
    canAdd: true,
    onAdd: (files) => add.mutateAsync(files).then(() => undefined),
    onRemove: (imageId) => remove.mutateAsync(imageId).then(() => undefined),
    onReorder: (imageIds) => reorder.mutateAsync(imageIds).then(() => undefined),
    isBusy: add.isPending || remove.isPending || reorder.isPending,
  };
}
