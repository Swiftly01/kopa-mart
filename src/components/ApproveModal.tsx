import { Check, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "./ui/button";

interface ApproveModalProps {
  sellerName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

export const ApproveModal = ({
  sellerName,
  onConfirm,
  onCancel,
  isLoading,
}: ApproveModalProps) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    onClick={onCancel}
  >
    <div
      className="w-full max-w-md p-6 space-y-5 border shadow-xl rounded-xl bg-card border-border"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-3">
        <span className="flex items-center justify-center rounded-full size-10 bg-green-500/15">
          <CheckCircle2 className="text-green-600 size-5" />
        </span>
        <div>
          <h3 className="font-semibold text-foreground">Approve Seller</h3>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone
          </p>
        </div>
      </div>

      <p className="text-sm text-foreground">
        Are you sure you want to approve{" "}
        <span className="font-semibold">{sellerName}</span> as a verified
        seller? They will gain full access to sell on the platform.
      </p>

      <div className="flex gap-3 pt-1">
        <Button
          variant="outline"
          className="flex-1"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isLoading}
          className="flex-1 gap-2 text-white bg-green-600 hover:bg-green-700"
        >
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Check className="size-4" />
          )}
          {isLoading ? "Approving..." : "Yes, Approve"}
        </Button>
      </div>
    </div>
  </div>
);
