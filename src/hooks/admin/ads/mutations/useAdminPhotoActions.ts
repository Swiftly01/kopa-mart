import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminAdsService } from "@/services/adminAdsService";
import { listingKeys } from "@/hooks/listings/listingKeys";
import type { PhotoActions } from "@/components/post-ad/EditPhotos";
import { adAdminKeys } from "../adAdminKeys";

// photo changes made by an admin (remove, reorder; admins cannot add photos)
export default function useAdminPhotoActions(adId: string): PhotoActions {
  const queryClient = useQueryClient();
  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: adAdminKeys.all }),
      queryClient.invalidateQueries({ queryKey: listingKeys.all }),
    ]);

  const remove = useMutation({
    mutationFn: (imageId: string) => AdminAdsService.deleteImage(adId, imageId),
    onSuccess: refresh,
  });
  const reorder = useMutation({
    mutationFn: (imageIds: string[]) =>
      AdminAdsService.reorderImages(adId, imageIds),
    onSuccess: refresh,
  });

  return {
    canAdd: false,
    onAdd: async () => undefined,
    onRemove: (imageId) => remove.mutateAsync(imageId).then(() => undefined),
    onReorder: (imageIds) => reorder.mutateAsync(imageIds).then(() => undefined),
    isBusy: remove.isPending || reorder.isPending,
  };
}
