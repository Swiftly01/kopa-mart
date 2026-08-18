import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/utils";
import {
  CATEGORY_ICON_MAP,
  CATEGORY_ICON_NAMES,
} from "@/lib/categoryIcons";
import { CategoryIcon } from "@/components/ui/CategoryIcon";

interface IconPickerProps {
  value?: string;
  onChange: (iconName: string) => void;
  disabled?: boolean;
  className?: string;
}

/** Splits "FaMapLocationDot" -> "Map Location Dot" for search matching / display. */
const humanizeIconName = (name: string) =>
  name
    .replace(/^Fa/, "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2");

export const IconPicker = ({
  value,
  onChange,
  disabled,
  className,
}: IconPickerProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filteredNames = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CATEGORY_ICON_NAMES;
    return CATEGORY_ICON_NAMES.filter((name) =>
      humanizeIconName(name).toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <Popover
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setQuery("");
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex h-10 w-full items-center gap-2 rounded-md border border-input bg-background px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
        >
          <span className="flex items-center justify-center rounded-md size-6 bg-secondary text-base shrink-0">
            <CategoryIcon icon={value} />
          </span>
          <span className="flex-1 text-left truncate">
            {value ? humanizeIconName(value) : "Choose an icon"}
          </span>
          <ChevronDown className="size-4 text-muted-foreground shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-2 border-b">
          <Input
            autoFocus
            placeholder="Search icons…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-9"
          />
        </div>
        <div className="grid grid-cols-6 gap-1 p-2 overflow-y-auto max-h-64">
          {filteredNames.length === 0 && (
            <p className="col-span-6 py-6 text-xs text-center text-muted-foreground">
              No icons match "{query}"
            </p>
          )}
          {filteredNames.map((name) => {
            const Icon = CATEGORY_ICON_MAP[name];
            const selected = name === value;
            return (
              <button
                key={name}
                type="button"
                title={humanizeIconName(name)}
                onClick={() => {
                  onChange(name);
                  setOpen(false);
                  setQuery("");
                }}
                className={cn(
                  "flex items-center justify-center rounded-md size-11 text-lg transition-colors hover:bg-secondary",
                  selected
                    ? "bg-primary/15 text-primary ring-1 ring-primary"
                    : "text-foreground",
                )}
              >
                <Icon />
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default IconPicker;
