import { ListingService } from "@/services/listingService";
import { useMutation } from "@tanstack/react-query";

export default function useCreateListing() {
  return useMutation({ mutationFn: ListingService.createListing });
}
