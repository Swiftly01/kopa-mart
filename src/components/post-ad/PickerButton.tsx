import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/utils";

interface PickerButtonProps {
  // what the user picked; empty means nothing yet
  text: string;
  placeholder: string;
  onClick: () => void;
}

// looks like an input, but opens a picker when tapped
export default function PickerButton({
  text,
  placeholder,
  onClick,
}: PickerButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-between w-full h-12 gap-2 px-3 text-sm text-left border rounded-md border-input bg-background"
    >
      <span className={cn("truncate", !text && "text-muted-foreground")}>
        {text || placeholder}
      </span>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
    </button>
  );
}
