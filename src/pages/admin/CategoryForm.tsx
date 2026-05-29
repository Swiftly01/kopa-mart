import { AdminShell } from "@/components/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import useStoreCategory from "@/hooks/admin/categories/mutations/useStoreCategory";
import useGetCategories from "@/hooks/admin/categories/queries/useGetCategories";
import appToast from "@/lib/appToast";
import { handleAxiosError } from "@/lib/utils/errors/errorHandler";
import { cn } from "@/lib/utils/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import {
  AlignLeft,
  ArrowUpDown,
  ChevronRight,
  Hash,
  Layers,
  Star,
  Tag,
} from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

const categorySchema = z.object({
  code: z
    .string()
    .min(2, "Code must be at least 2 characters")
    .max(32, "Code must be at most 32 characters")
    .regex(
      /^[a-z0-9-_]+$/,
      "Only lowercase letters, numbers, hyphens and underscores",
    ),
  icon: z
    .string()
    .min(1, "Icon emoji is required")
    .max(8, "Keep it to one emoji"),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(64, "Name must be at most 64 characters"),
  description: z
    .string()
    .max(256, "Description must be at most 256 characters")
    .optional(),
  parentId: z.string().nullable().default(null),
  isFeatured: z.boolean().default(false),
  sortOrder: z
    .number({ invalid_type_error: "Must be a number" })
    .int("Must be a whole number")
    .min(0, "Must be 0 or greater")
    .default(0),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

// ─── Field wrapper ────────────────────────────────────────────────────────────

interface FieldProps {
  label: string;
  icon?: React.ReactNode;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}

const Field = ({
  label,
  icon,
  error,
  required,
  children,
  hint,
}: FieldProps) => (
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

// ─── Main component ───────────────────────────────────────────────────────────

const CategoryForm = () => {
  const { data: categories } = useGetCategories();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    setError,
    formState: { errors, isDirty, isValid },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      code: "",
      icon: "✨",
      name: "",
      description: "",
      parentId: null,
      isFeatured: false,
      sortOrder: 0,
    },
    mode: "onChange",
  });

  const watchedIcon = watch("icon");
  const watchedName = watch("name");
  const watchedParentId = watch("parentId");

  // Auto-generate code from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const auto = name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-_]/g, "");
    setValue("code", auto, { shouldValidate: true });
  };

  //const categories = useMemo(() => data?.data ?? [], [data]);

  const parentCategory = categories?.data?.find((c) => c.id === watchedParentId);

  const { mutate: submitCategory, isPending } = useStoreCategory();

  const onSubmit = async (data: CategoryFormData) => {
    submitCategory(data, {
      onSuccess: () => {
        appToast({
          title: "Create Category",
          description: "Category created successfully",
        });
      },
      onError: (err: AxiosError) => {
        handleAxiosError(err, setError);
      },
    });
  };

  return (
    <AdminShell>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
          <span>Settings</span>
          <ChevronRight className="size-3" />
          <span>Categories</span>
          <ChevronRight className="size-3" />
          <span className="text-foreground font-medium">New Category</span>
        </div>

        {/* Preview badge */}
        <div className="card-listing p-4 mb-6 flex items-center gap-3">
          <div className="size-11 rounded-xl bg-secondary flex items-center justify-center text-2xl flex-shrink-0">
            {watchedIcon || "✨"}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">
              {watchedName || (
                <span className="text-muted-foreground italic">
                  Category name
                </span>
              )}
            </p>
            {parentCategory && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Layers className="size-3" />
                Subcategory of{" "}
                <span className="font-medium">{parentCategory.name}</span>
              </p>
            )}
          </div>
          <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-mono">
            {watch("code") || "code"}
          </span>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="card-listing p-5 space-y-5 mb-4">
            <h2 className="font-semibold text-sm">Basic Info</h2>

            {/* Icon + Name row */}
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
                    {...register("name", { onChange: handleNameChange })}
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
              hint="Auto-generated from name. Only lowercase letters, numbers, hyphens, underscores."
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
              hint="Optional short description shown to customers."
            >
              <Textarea
                {...register("description")}
                placeholder="Latest gadgets and smartphones..."
                className={cn(
                  "resize-none min-h-[72px] text-sm",
                  errors.description &&
                    "border-destructive focus-visible:ring-destructive",
                )}
              />
            </Field>
          </div>

          <div className="card-listing p-5 space-y-5 mb-4">
            <h2 className="font-semibold text-sm">Organisation</h2>

            {/* Parent category */}
            <Field
              label="Parent Category"
              icon={<Layers className="size-3" />}
              hint="Leave empty to create a top-level category."
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
                      {categories?.data?.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          <span className="mr-1">{c.icon}</span> {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>

            {/* Sort order */}
            <Field
              label="Sort Order"
              icon={<ArrowUpDown className="size-3" />}
              error={errors.sortOrder?.message}
              hint="Lower numbers appear first."
            >
              <Input
                {...register("sortOrder", { valueAsNumber: true })}
                type="number"
                min={0}
                placeholder="0"
                className={cn(
                  "h-10 w-32",
                  errors.sortOrder &&
                    "border-destructive focus-visible:ring-destructive",
                )}
              />
            </Field>

            {/* Featured toggle */}
            <div className="flex items-center justify-between rounded-lg border p-3 bg-secondary/30">
              <div className="flex items-center gap-2">
                <Star className="size-4 text-amber-500" />
                <div>
                  <p className="text-sm font-medium">Featured</p>
                  <p className="text-xs text-muted-foreground">
                    Show this category in featured sections
                  </p>
                </div>
              </div>
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
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => reset()}
              disabled={!isDirty || submitting}
            >
              Reset
            </Button>
            <Button
              type="submit"
              disabled={submitting || !isValid}
              className="min-w-[120px]"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin size-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Saving…
                </span>
              ) : (
                "Create Category"
              )}
            </Button>
          </div>
        </form>
      </div>
    </AdminShell>
  );
};

export default CategoryForm;
