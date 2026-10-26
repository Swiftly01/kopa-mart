import { ListingService } from "@/services/listingService";
import { useMutation } from "@tanstack/react-query";

export default function usePublishListing() {
  return useMutation({ mutationFn: ListingService.publishListing });
}
