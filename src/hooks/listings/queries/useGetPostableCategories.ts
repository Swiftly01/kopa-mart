import { ListingService } from "@/services/listingService";
import { useQuery } from "@tanstack/react-query";
import { listingKeys } from "../listingKeys";

// the categories a user can post an ad into
export default function useGetPostableCategories() {
  return useQuery({
    queryKey: listingKeys.categories(),
    queryFn: ListingService.getPostableCategories,
  });
}
