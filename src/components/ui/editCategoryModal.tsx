import { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tag, Hash, AlignLeft, Layers, ArrowUpDown, Star } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { AxiosError } from "axios";
import { handleAxiosError } from "@/lib/utils/errors/errorHandler";
import appToast from "@/lib/appToast";
import { Category } from "@/types/category";
import useUpdateCategory from "@/hooks/admin/categories/mutations/useUpdateCategory";
import useGetCategories from "@/hooks/admin/categories/queries/useGetCategories";

// ─── Schema (same rules as create, all fields optional for patch) ─────────────

const editSchema = z.object({
  code: z
    .string()
    .min(2)
    .max(32)
    .regex(
      /^[a-z0-9-_]+$/,
      "Only lowercase letters, numbers, hyphens and underscores",
    ),
  icon: z.string().min(1).max(8),
  name: z.string().min(2).max(64),
  description: z.string().max(256).optional(),
  parentId: z.string().nullable().default(null),
  isFeatured: z.boolean().default(false),
  sortOrder: z.number().int().min(0).default(0),
});

type EditFormData = z.infer<typeof editSchema>;

interface Props {
  category: Category;
  open: boolean;
  onClose: () => void;
}

const Field = ({
  label,
  icon,
  error,
  required,
  children,
  hint,
}: {
  label: string;
  icon?: React.ReactNode;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}) => (
  <div className="space-y-1.5">
    <Label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
      {icon}
      {label}
      {required && <span className="text-destructive">*</span>}
    </Label>
    {children}
    {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
    {error && (
      <p className="text-xs font-medium text-destructive flex items-center gap-1">
        <span className="inline-block size-1.5 rounded-full bg-destructive" />
        {error}
      </p>
    )}
  </div>
);



const EditCategoryModal = ({ category, open, onClose }: Props) => {
  const { data, isLoading, isError, isFetching } = useGetCategories();

  const categories = useMemo(() => data?.data ?? [], [data]);
  const { mutate: updateCategory, isPending } = useUpdateCategory();

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
    mode: "onChange",
  });

  // Populate form whenever the category prop changes
  useEffect(() => {
    if (category) {
      reset({
        code: category.code,
        icon: category.icon,
        name: category.name,
        description: category.description ?? "",
        parentId: category.parentId,
        isFeatured: category.isFeatured,
        sortOrder: category.sortOrder,
      });
    }
  }, [category, reset]);

  const onSubmit = (data: EditFormData) => {
    updateCategory(
      { id: category.id, data },
      {
        onSuccess: () => {
          appToast({
            title: "Category Updated",
            description: `"${data.name}" has been updated.`,
          });
          onClose();
        },
        onError: (err: AxiosError) => {
          handleAxiosError(err, setError);
        },
      },
    );
  };

  // Exclude self from parent options (can't be own parent)
  const parentOptions = categories.filter(
    (c) => c.id !== category.id && !c.parentId,
  );

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <span className="text-xl">{category.icon ?? "📁"}</span>
            Edit Category
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-5 py-2"
        >
          {/* Icon + Name */}
          <div className="flex gap-3">
            <Field label="Icon" error={errors.icon?.message} required>
              <Input
                {...register("icon")}
                placeholder="📱"
                className={cn(
                  "w-16 h-10 text-center text-lg",
                  errors.icon &&
                    "border-destructive focus-visible:ring-destructive",
                )}
                maxLength={8}
              />
            </Field>
            <div className="flex-1">
              <Field
                label="Name"
                icon={<Tag className="size-3" />}
                error={errors.name?.message}
                required
              >
                <Input
                  {...register("name")}
                  placeholder="e.g. Gadgets & Phones"
                  className={cn(
                    "h-10",
                    errors.name &&
                      "border-destructive focus-visible:ring-destructive",
                  )}
                />
              </Field>
            </div>
          </div>

          {/* Code */}
          <Field
            label="Code / Slug"
            icon={<Hash className="size-3" />}
            error={errors.code?.message}
            hint="Lowercase letters, numbers, hyphens, underscores only."
            required
          >
            <Input
              {...register("code")}
              placeholder="gadgets-phones"
              className={cn(
                "h-10 font-mono text-sm",
                errors.code &&
                  "border-destructive focus-visible:ring-destructive",
              )}
            />
          </Field>

          {/* Description */}
          <Field
            label="Description"
            icon={<AlignLeft className="size-3" />}
            error={errors.description?.message}
          >
            <Textarea
              {...register("description")}
              placeholder="Short description..."
              className={cn(
                "resize-none min-h-[72px] text-sm",
                errors.description &&
                  "border-destructive focus-visible:ring-destructive",
              )}
            />
          </Field>

          {/* Parent */}
          <Field
            label="Parent Category"
            icon={<Layers className="size-3" />}
            hint="Leave empty for top-level."
          >
            <Controller
              name="parentId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ?? "__none__"}
                  onValueChange={(v) =>
                    field.onChange(v === "__none__" ? null : v)
                  }
                >
                  <SelectTrigger className="h-10 text-sm">
                    <SelectValue placeholder="None (top-level)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">
                      <span className="text-muted-foreground">
                        None (top-level)
                      </span>
                    </SelectItem>
                    {parentOptions.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        <div className="flex items-center gap-2">
                          <span>{c.icon ?? "📁"}</span>
                          <span>{c.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>

          {/* Sort order + Featured */}
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Sort Order"
              icon={<ArrowUpDown className="size-3" />}
              error={errors.sortOrder?.message}
              hint="Lower = first."
            >
              <Input
                {...register("sortOrder", { valueAsNumber: true })}
                type="number"
                min={0}
                className={cn(
                  "h-10",
                  errors.sortOrder &&
                    "border-destructive focus-visible:ring-destructive",
                )}
              />
            </Field>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                <Star className="size-3" /> Featured
              </Label>
              <div className="flex items-center gap-3 h-10 px-3 rounded-md border bg-secondary/30">
                <Controller
                  name="isFeatured"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <span className="text-xs text-muted-foreground select-none">
                  Show on homepage
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || !isDirty}
              className="min-w-[110px]"
            >
              {isPending ? "Saving…" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditCategoryModal;
