import { useState } from "react";
import { Button } from "./ui/button";
import { Loader2, X } from "lucide-react";

interface RejectModalProps {
  sellerName: string;
  onConfirm: (reason: string, step: number) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export const RejectModal = ({
  sellerName,
  onConfirm,
  onCancel,
  isLoading,
}: RejectModalProps) => {
  const [rejectionReason, setRejectionReason] = useState("");
  const [stepToReject, setStepToReject] = useState<string>("1");
  const [errors, setErrors] = useState<{ reason?: string; step?: string }>({});

  const validate = () => {
    const newErrors: { reason?: string; step?: string } = {};
    if (!rejectionReason.trim()) {
      newErrors.reason = "Rejection reason is required.";
    }
    const stepNum = Number(stepToReject);
    if (!stepToReject || isNaN(stepNum) || stepNum < 1 || stepNum > 3) {
      newErrors.step = "Step must be between 1 and 3.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onConfirm(rejectionReason.trim(), Number(stepToReject));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md p-6 space-y-5 border shadow-xl rounded-xl bg-card border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center rounded-full size-10 bg-red-500/15">
            <X className="text-red-600 size-5" />
          </span>
          <div>
            <h3 className="font-semibold text-foreground">
              Reject Application
            </h3>
            <p className="text-sm text-muted-foreground">
              Provide a reason for rejection
            </p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          You are rejecting the application for{" "}
          <span className="font-semibold text-foreground">{sellerName}</span>.
          Please fill in the details below.
        </p>

        {/* Rejection Reason */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
            Rejection Reason
          </label>
          <input
            type="text"
            value={rejectionReason}
            onChange={(e) => {
              setRejectionReason(e.target.value);
              if (errors.reason)
                setErrors((prev) => ({ ...prev, reason: undefined }));
            }}
            placeholder="e.g. Invalid ID, Blurry document..."
            className={`w-full px-3 py-2 text-sm rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition ${
              errors.reason
                ? "border-red-500 focus:ring-red-500/30"
                : "border-border"
            }`}
          />
          {errors.reason && (
            <p className="text-xs text-red-500">{errors.reason}</p>
          )}
        </div>

        {/* Step to Reject */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
            Step to Reject{" "}
            <span className="font-normal normal-case text-muted-foreground">
              (1 – 3)
            </span>
          </label>
          <input
            type="number"
            min={1}
            max={3}
            value={stepToReject}
            onChange={(e) => {
              setStepToReject(e.target.value);
              if (errors.step)
                setErrors((prev) => ({ ...prev, step: undefined }));
            }}
            placeholder="Enter step (1, 2, or 3)"
            className={`w-full px-3 py-2 text-sm rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition ${
              errors.step
                ? "border-red-500 focus:ring-red-500/30"
                : "border-border"
            }`}
          />
          {errors.step && <p className="text-xs text-red-500">{errors.step}</p>}
          <p className="text-xs text-muted-foreground">
            Step 1 = ID Verification · Step 2 = Face Verification · Step 3 =
            Store Info
          </p>
        </div>

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
            onClick={handleSubmit}
            disabled={isLoading}
            variant="outline"
            className="flex-1 gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-900 dark:hover:bg-red-950"
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <X className="size-4" />
            )}
            {isLoading ? "Rejecting..." : "Reject Application"}
          </Button>
        </div>
      </div>
    </div>
  );
};