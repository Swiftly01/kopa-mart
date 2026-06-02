import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { AdminProductsService } from "@/services/adminProductsService";
import { adminProductKeys } from "../adminProductKey";

export default function useDeleteListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) =>
      AdminProductsService.deleteListing(productId),
    onSuccess: () => {
      // Invalidate all admin product listing queries so the table refetches
      queryClient.invalidateQueries({ queryKey: adminProductKeys.all });
      toast({ title: "Listing deleted successfully" });
    },
    onError: () => {
      toast({
        title: "Failed to delete listing",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });
}
