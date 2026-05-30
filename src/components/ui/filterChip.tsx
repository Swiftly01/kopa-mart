import { X } from "lucide-react";


export default  function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-[11px] font-medium px-2.5 py-1 rounded-full">
      {label}
      <button
        onClick={onRemove}
        className="hover:text-primary/70 transition-colors ml-0.5"
      >
        <X className="size-3" />
      </button>
    </span>
  );
}
