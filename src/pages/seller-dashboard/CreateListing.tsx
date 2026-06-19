import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { SellerShell } from "@/components/SellerShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { X, Upload, Loader2 } from "lucide-react";
import useGetCategories from "@/hooks/admin/categories/queries/useGetCategories";
import useStates from "@/hooks/locations/queries/useStates";
import useLgas from "@/hooks/locations/queries/useLgas";
import useCreateProduct from "@/hooks/products/mutations/useCreateProduct";
import useUploadProductImage from "@/hooks/products/mutations/useUploadProductImage";
import useUpdateProduct from "@/hooks/products/mutations/useUpdateProduct";
//import useDeleteProductImage from "@/hooks/products/mutations/useDeleteProductImage";
import appToast from "@/lib/appToast";
import { AxiosError } from "axios";
import { handleAxiosError } from "@/lib/utils/errors/errorHandler";
import useGetProduct from "@/hooks/products/queries/useGetProduct";
import type { ProductImage } from "@/types/product"; // adjust path as needed
import useDeleteProductImage from "@/hooks/products/mutations/useDeleteProductImage";

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1 MB
const MAX_IMAGES = 6;

const ProductCondition = z.enum(["new", "like_new", "good", "fair"]);

const schema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  price: z
    .number({ invalid_type_error: "Price is required" })
    .positive("Price must be positive")
    .max(100_000_000),
  discountPercentage: z.number().min(0).max(100).default(0),
  stock: z
    .number({ invalid_type_error: "Stock is required" })
    .int()
    .min(0, "Stock cannot be negative"),
  categoryId: z.string().min(1, "Select a category"),
  stateCode: z.string().min(1, "Select a state"),
  stateName: z.string().min(1),
  lgaName: z.string().min(1, "Select an LGA"),
  description: z.string().trim().min(5).max(2000),
  condition: ProductCondition,
});

export type CreateProductPayload = z.infer<typeof schema>;

interface ImageEntry {
  file: File;
  preview: string;
}

function useNewImagePreviews() {
  const [entries, setEntries] = useState<ImageEntry[]>([]);

  const add = (files: FileList | null, currentExistingCount: number) => {
    if (!files) return;
    const valid: File[] = [];
    Array.from(files).forEach((f) => {
      if (f.size > MAX_FILE_SIZE) {
        toast({
          title: "File too large",
          description: `${f.name} exceeds 1 MB limit.`,
          variant: "destructive",
        });
      } else {
        valid.push(f);
      }
    });
    const remaining = MAX_IMAGES - currentExistingCount - entries.length;
    const toAdd = valid.slice(0, remaining).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setEntries((prev) => [...prev, ...toAdd]);
  };

  const remove = (index: number) => {
    setEntries((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  useEffect(() => {
    return () => entries.forEach((e) => URL.revokeObjectURL(e.preview));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { entries, add, remove };
}

const CONDITION_OPTIONS: {
  label: string;
  value: z.infer<typeof ProductCondition>;
}[] = [
  { label: "New", value: "new" },
  { label: "Like New", value: "like_new" },
  { label: "Good", value: "good" },
  { label: "Fair", value: "fair" },
];

const CreateListing = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditing = Boolean(id);

  const queryClient = useQueryClient();

  // Only fetch when editing
  const { data, isLoading: productLoading } = useGetProduct(id);
  const editing = isEditing ? data : undefined;

  // Track which existing server images are still present
  const [existingImages, setExistingImages] = useState<ProductImage[]>([]);

  // Sync existing images from server once data loads
  useEffect(() => {
    if (editing?.images) {
      setExistingImages(editing.images);
    }
  }, [editing]);

  const { data: categoriesData } = useGetCategories();
  const categories = useMemo(
    () => categoriesData?.data ?? [],
    [categoriesData],
  );

  const { data: statesData, isLoading: statesLoading } = useStates();
  const states: { code: string; name: string }[] = (statesData?.data ?? []).map(
    (s: { code: string; name: string }) => ({ code: s.code, name: s.name }),
  );

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    setError,
    formState: { errors },
  } = useForm<CreateProductPayload>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      price: undefined,
      discountPercentage: 0,
      stock: undefined,
      categoryId: "",
      stateCode: "",
      stateName: "",
      lgaName: "",
      description: "",
      condition: "new",
    },
  });

  // Populate form once editing data is ready
  useEffect(() => {
    if (editing) {
      reset({
        name: editing.name,
        price: parseFloat(editing.price), // price comes as string per interface
        discountPercentage: editing.discountPercentage ?? 0,
        stock: editing.stock ?? 0,
        categoryId: editing.categoryId ?? "",
        stateCode: editing.stateCode ?? "",
        stateName: editing.stateName ?? "",
        lgaName: editing.lgaName ?? "", // correct field name from Product interface
        description: editing.description,
        condition:
          (editing.condition as z.infer<typeof ProductCondition>) ?? "new",
      });
    }
  }, [editing, reset]);

  const selectedStateCode = watch("stateCode");
  const { data: lgasData, isLoading: lgasLoading } = useLgas(selectedStateCode);
  const lgas: string[] = (lgasData?.data?.lgas ?? []).map(
    (l: { name: string }) => l.name,
  );

  useEffect(() => {
    setValue("lgaName", "");
  }, [selectedStateCode, setValue]);

  // New (local) images not yet uploaded
  const {
    entries: newImages,
    add: addNewImages,
    remove: removeNewImage,
  } = useNewImagePreviews();

  const totalImageCount = existingImages.length + newImages.length;

  const createMutation = useCreateProduct();
  const imageMutation = useUploadProductImage();
  const updateMutation = useUpdateProduct();
  const deleteImageMutation = useDeleteProductImage();

  const isSubmitting =
    createMutation.isPending ||
    updateMutation.isPending ||
    imageMutation.isPending;

  // Delete a single existing image (fires immediately, no need to submit)
  const handleDeleteExistingImage = (image: ProductImage) => {
    deleteImageMutation.mutate(
      { productId: id!, imageId: image.id },
      {
        onSuccess: () => {
          setExistingImages((prev) =>
            prev.filter((img) => img.id !== image.id),
          );
          appToast({
            title: "Delete image",
            description: "Image removed successfully",
          });
        },
        onError: (err: AxiosError) => {
          handleAxiosError(err);
        },
      },
    );
  };

  const onSubmit = async (values: CreateProductPayload) => {
    // Require at least one image total (existing or new)
    if (totalImageCount === 0) {
      appToast({ title: "Add at least one image" });
      return;
    }

    if (isEditing && id) {
      await updateMutation.mutateAsync(
        { productId: id, payload: values },
        {
          onError: (err: AxiosError) => handleAxiosError(err, setError),
        },
      );

      if (newImages.length > 0) {
        await imageMutation.mutateAsync(
          {
            productId: id,
            files: newImages.map((e) => e.file),
          },
          {
            onError: (err: AxiosError) => handleAxiosError(err, setError),
          },
        );
      }

      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["product", id] });
      appToast({
        title: "Listing updated!",
        description: "Your changes have been saved",
      });
    } else {
      const created = await createMutation.mutateAsync(values, {
        onError: (err: AxiosError) => handleAxiosError(err, setError),
      });

      await imageMutation.mutateAsync(
        {
          productId: created.data.product.id,
          files: newImages.map((e) => e.file),
        },
        {
          onSuccess: () => {
            appToast({
              title: "Listing posted!",
              description: "Your product has been posted successfully",
            });
          },
          onError: (err: AxiosError) => handleAxiosError(err, setError),
        },
      );

      queryClient.invalidateQueries({ queryKey: ["listings"] });
    }

    navigate("/seller-dashboard/manage-listings");
  };

  // Show loader while fetching product data in edit mode
  if (isEditing && productLoading) {
    return (
      <SellerShell>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      </SellerShell>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <SellerShell>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pb-10">
        {/* ── Basic details ─────────────────────────────────────────────── */}
        <div>
          <Label>Product name</Label>
          <Input {...register("name")} className="h-12 mt-1" />
          {errors.name && (
            <p className="text-destructive text-xs mt-1">
              {errors.name.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Price (₦)</Label>
            <Input
              type="number"
              min={0}
              className="h-12 mt-1"
              {...register("price", { valueAsNumber: true })}
            />
            {errors.price && (
              <p className="text-destructive text-xs mt-1">
                {errors.price.message}
              </p>
            )}
          </div>
          <div>
            <Label>
              Discount (%){" "}
              <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                optional
              </span>
            </Label>
            <Input
              type="number"
              min={0}
              max={100}
              placeholder="0"
              className="h-12 mt-1"
              {...register("discountPercentage", {
                valueAsNumber: true,
                setValueAs: (v) => (isNaN(v) ? 0 : v),
              })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Stock</Label>
            <Input
              type="number"
              min={0}
              className="h-12 mt-1"
              {...register("stock", { valueAsNumber: true })}
            />
            {errors.stock && (
              <p className="text-destructive text-xs mt-1">
                {errors.stock.message}
              </p>
            )}
          </div>
          <div>
            <Label>Condition</Label>
            <Controller
              control={control}
              name="condition"
              render={({ field }) => (
                <Select
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="h-12 mt-1">
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONDITION_OPTIONS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.condition && (
              <p className="text-destructive text-xs mt-1">
                {errors.condition.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <Label>Category</Label>
          <Controller
            control={control}
            name="categoryId"
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <SelectTrigger className="h-12 mt-1">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.icon} {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.categoryId && (
            <p className="text-destructive text-xs mt-1">
              {errors.categoryId.message}
            </p>
          )}
        </div>

        <div>
          <Label>Description</Label>
          <Textarea rows={4} {...register("description")} className="mt-1" />
          {errors.description && (
            <p className="text-destructive text-xs mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* ── Location ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>State</Label>
            <Controller
              control={control}
              name="stateCode"
              render={({ field }) => (
                <Select
                  value={field.value ?? ""}
                  disabled={statesLoading}
                  onValueChange={(code) => {
                    field.onChange(code);
                    const state = states.find((s) => s.code === code);
                    if (state) setValue("stateName", state.name);
                  }}
                >
                  <SelectTrigger className="h-12 mt-1">
                    <SelectValue
                      placeholder={statesLoading ? "Loading…" : "Select state"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((s) => (
                      <SelectItem key={s.code} value={s.code}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.stateCode && (
              <p className="text-destructive text-xs mt-1">
                {errors.stateCode.message}
              </p>
            )}
          </div>

          <div>
            <Label>LGA</Label>
            <Controller
              control={control}
              name="lgaName"
              render={({ field }) => (
                <Select
                  value={field.value ?? ""}
                  disabled={lgasLoading || !lgas.length}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="h-12 mt-1">
                    <SelectValue
                      placeholder={lgasLoading ? "Loading…" : "Select LGA"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {lgas.map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.lgaName && (
              <p className="text-destructive text-xs mt-1">
                {errors.lgaName.message}
              </p>
            )}
          </div>
        </div>

        {/* ── Images ────────────────────────────────────────────────────── */}
        <div>
          <Label>
            Photos ({totalImageCount}/{MAX_IMAGES})
            <span className="text-muted-foreground text-xs font-normal ml-2">
              {isEditing
                ? "Remove existing images or add new ones"
                : "Uploaded after product is saved"}
            </span>
          </Label>

          <div className="grid grid-cols-3 gap-2 mt-2">
            {/* Existing server images */}
            {existingImages.map((image) => (
              <div
                key={image.id}
                className="relative aspect-square rounded-lg overflow-hidden bg-muted"
              >
                <img
                  src={image.cloudinaryUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
                {/* Spinner overlay while this specific image is being deleted */}
                {deleteImageMutation.isPending &&
                (deleteImageMutation.variables as any)?.imageId === image.id ? (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="size-5 animate-spin text-white" />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleDeleteExistingImage(image)}
                    className="absolute top-1 right-1 size-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                  >
                    <X className="size-3" />
                  </button>
                )}
                {image.isMain && (
                  <span className="absolute bottom-1 left-1 text-[9px] bg-black/60 text-white px-1.5 py-0.5 rounded">
                    Main
                  </span>
                )}
              </div>
            ))}

            {/* New (local) images pending upload */}
            {newImages.map((entry, i) => (
              <div
                key={`new-${i}`}
                className="relative aspect-square rounded-lg overflow-hidden bg-muted"
              >
                <img
                  src={entry.preview}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeNewImage(i)}
                  className="absolute top-1 right-1 size-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                >
                  <X className="size-3" />
                </button>
                {/* Badge so user knows it hasn't been uploaded yet */}
                <span className="absolute bottom-1 left-1 text-[9px] bg-black/60 text-white px-1.5 py-0.5 rounded">
                  Pending
                </span>
              </div>
            ))}

            {/* Upload button — hidden once cap is reached */}
            {totalImageCount < MAX_IMAGES && (
              <label className="aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted-foreground cursor-pointer hover:border-primary hover:text-primary transition-colors">
                <Upload className="size-5" />
                <span className="text-[10px]">Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) =>
                    addNewImages(e.target.files, existingImages.length)
                  }
                />
              </label>
            )}
          </div>
        </div>

        {/* ── Submit ────────────────────────────────────────────────────── */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 bg-gradient-primary"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 mr-2 animate-spin" />
              {imageMutation.isPending
                ? "Uploading images…"
                : isEditing
                  ? "Updating…"
                  : "Posting…"}
            </>
          ) : isEditing ? (
            "Update listing"
          ) : (
            "Post listing"
          )}
        </Button>
      </form>
    </SellerShell>
  );
};

export default CreateListing;
