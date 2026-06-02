import { Loader2, Trash2 } from "lucide-react";
import { Button } from "./button";

interface DeleteModalProps {
  productTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

export  const AdminDeleteProductModal = ({
  productTitle,
  onConfirm,
  onCancel,
  isDeleting,
}: DeleteModalProps) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div className="bg-card border border-border rounded-xl shadow-xl p-6 w-full max-w-md mx-4 space-y-4">
      <div className="flex items-start gap-3">
        <div className="flex items-center justify-center size-10 rounded-full bg-destructive/10 shrink-0 mt-0.5">
          <Trash2 className="size-5 text-destructive" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Delete listing?
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              &ldquo;{productTitle}&rdquo;
            </span>{" "}
            will be permanently removed. This action cannot be undone.
          </p>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={isDeleting}
        >
          Cancel
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={onConfirm}
          disabled={isDeleting}
          className="gap-1.5"
        >
          {isDeleting && <Loader2 className="size-3.5 animate-spin" />}
          Delete listing
        </Button>
      </div>
    </div>
  </div>
);
