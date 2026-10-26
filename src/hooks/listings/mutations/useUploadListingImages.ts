import { ListingService } from "@/services/listingService";
import { useMutation } from "@tanstack/react-query";

interface UploadListingImagesVariables {
  listingId: string;
  files: File[];
}

export default function useUploadListingImages() {
  return useMutation({
    mutationFn: ({ listingId, files }: UploadListingImagesVariables) =>
      ListingService.uploadImages(listingId, files),
  });
}
