import { useQuery } from "@tanstack/react-query";
import useUser from "@/hooks/users/queries/useUser";
import { SavedProductService } from "@/services/savedProductService";
import { savedProductKeys } from "../savedProductkeys";

// the signed-in user's saved ads (card data)
export function useGetSavedAds() {
  const { data: user } = useUser();
  return useQuery({
    queryKey: savedProductKeys.ads(),
    queryFn: SavedProductService.getSavedAds,
    enabled: !!user,
  });
}
