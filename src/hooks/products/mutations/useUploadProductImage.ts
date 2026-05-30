import { ProductService } from "@/services/productService";
import { useMutation } from "@tanstack/react-query";
import { productKeys } from "../productKeys";

interface UploadProductImagesPayload {
  productId: string;
  files: File[];
}

export default function useUploadProductImage() {
  return useMutation({
    mutationKey: productKeys.uploadImages(),

    mutationFn: async ({ productId, files }: UploadProductImagesPayload) => {
      const formData = new FormData();

      files.forEach((file) => {
        formData.append("images", file);
      });

      return ProductService.uploadProductImages(productId, formData);
    },
  });
}
