import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const MIN_REASON = 5;
const MAX_REASON = 500;

interface RejectAdDialogProps {
  open: boolean;
  adTitle: string;
  isLoading: boolean;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}

// asks the admin why the ad is rejected; the owner reads this reason
export default function RejectAdDialog({
  open,
  adTitle,
  isLoading,
  onConfirm,
  onClose,
}: RejectAdDialogProps) {
  const [reason, setReason] = useState("");
  const trimmed = reason.trim();
  const valid = trimmed.length >= MIN_REASON;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject this ad?</DialogTitle>
          <DialogDescription>
            "{adTitle}" will not be public. The owner will see your reason and
            can fix the ad and submit it again.
          </DialogDescription>
        </DialogHeader>

        <Textarea
          value={reason}
          maxLength={MAX_REASON}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Photos are blurry or do not show the property"
          rows={4}
        />
        <p className="text-xs text-muted-foreground">
          {trimmed.length}/{MAX_REASON} (at least {MIN_REASON} characters)
        </p>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={!valid || isLoading}
            onClick={() => onConfirm(trimmed)}
          >
            {isLoading && <Loader2 className="animate-spin" />}
            Reject ad
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
