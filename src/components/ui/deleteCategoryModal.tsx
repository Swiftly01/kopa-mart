import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";
import { AxiosError } from "axios";
import appToast from "@/lib/appToast";
import { Category } from "@/types/category";
import useDeleteCategory from "@/hooks/admin/categories/mutations/useDeleteCategory";
import { handleAxiosError } from "@/lib/utils/errors/errorHandler";

interface Props {
  category: Category;
  open: boolean;
  onClose: () => void;
}

const DeleteCategoryModal = ({ category, open, onClose }: Props) => {
  const { mutate: deleteCategory, isPending } = useDeleteCategory();

  const handleDelete = () => {
    deleteCategory(category.id, {
      onSuccess: () => {
        appToast({
          title: "Category Deleted",
          description: `"${category.name}" has been removed.`,
        });
        onClose();
      },
      onError: (err: AxiosError) => {
        handleAxiosError(err);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <span className="flex items-center justify-center size-10 rounded-full bg-destructive/10 text-destructive shrink-0">
              <AlertTriangle className="size-5" />
            </span>
            <DialogTitle className="text-base">Delete Category</DialogTitle>
          </div>
          <DialogDescription className="text-sm leading-relaxed pt-1">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">
              {category.icon} {category.name}
            </span>
            ? This action cannot be undone.
            {category.children && category.children.length > 0 && (
              <span className="block mt-2 text-destructive font-medium">
                ⚠ This category has {category.children.length} subcategorie(s)
                that will also be affected.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Category summary card */}
        <div className="rounded-lg border bg-muted/30 p-3 flex items-center gap-3 my-1">
          <span className="text-2xl">{category.icon}</span>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{category.name}</p>
            <p className="text-xs text-muted-foreground font-mono">
              {category.code}
            </p>
          </div>
          {category.isFeatured && (
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 font-medium whitespace-nowrap">
              Featured
            </span>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
            className="min-w-[100px]"
          >
            {isPending ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteCategoryModal;
