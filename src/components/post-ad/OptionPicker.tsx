import { useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/utils";
import type { FormFieldOption, OptionValue } from "@/types/listing";

interface OptionPickerProps {
  open: boolean;
  title: string;
  options: FormFieldOption[];
  // values that are currently chosen
  selected: OptionValue[];
  // single: called right after a tap. multiple: called when "Select" is pressed
  onSelect: (values: OptionValue[]) => void;
  onClose: () => void;
  multiple?: boolean;
  // adds the "Find ..." search box (full screen)
  searchable?: boolean;
  loading?: boolean;
}

// Three looks, like the app screenshots:
//   short single list -> bottom sheet with radio buttons
//   searchable list   -> full screen with a search box
//   multiple choice   -> full screen with Clear / Select buttons
export default function OptionPicker(props: OptionPickerProps) {
  const { open, title, multiple, searchable, onClose } = props;
  const fullScreen = Boolean(multiple || searchable);

  if (!fullScreen) {
    return (
      <Drawer open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
          </DrawerHeader>
          <div className="pb-6 overflow-y-auto max-h-[60vh]">
            <OptionList {...props} showRadio />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return open ? <FullScreenPicker {...props} /> : null;
}

function FullScreenPicker(props: OptionPickerProps) {
  const { title, searchable, multiple, selected, onSelect, onClose } = props;
  const [query, setQuery] = useState("");
  // in multiple mode choices stay local until the user presses "Select"
  // (this component is mounted fresh each time the picker opens)
  const [draft, setDraft] = useState<OptionValue[]>(selected);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-background">
      <header className="flex items-center gap-3 px-3 py-3 bg-primary text-primary-foreground">
        <button type="button" onClick={onClose} aria-label="Back">
          <ArrowLeft className="size-5" />
        </button>
        {searchable ? (
          <Input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Find ${title.toLowerCase()}...`}
            className="h-10 text-foreground"
          />
        ) : (
          <h2 className="font-semibold">{title}</h2>
        )}
      </header>

      <div className="flex-1 overflow-y-auto">
        <OptionList
          {...props}
          selected={multiple ? draft : selected}
          query={query}
          onSelect={multiple ? setDraft : onSelect}
        />
      </div>

      {multiple && (
        <footer className="flex gap-3 p-3 border-t">
          <Button
            type="button"
            variant="outline"
            className="flex-1 h-12"
            onClick={() => setDraft([])}
          >
            Clear
          </Button>
          <Button
            type="button"
            className="flex-1 h-12"
            onClick={() => onSelect(draft)}
          >
            Select
          </Button>
        </footer>
      )}
    </div>
  );
}

interface OptionListProps extends OptionPickerProps {
  query?: string;
  showRadio?: boolean;
}

// the rows, split into "Popular" and "Other" when the backend marks popular ones
function OptionList({
  options,
  selected,
  onSelect,
  multiple,
  loading,
  query = "",
  showRadio,
}: OptionListProps) {
  if (loading) {
    return <p className="p-4 text-sm text-muted-foreground">Loading...</p>;
  }

  const needle = query.trim().toLowerCase();
  const visible = options.filter((option) =>
    option.label.toLowerCase().includes(needle),
  );

  if (visible.length === 0) {
    return <p className="p-4 text-sm text-muted-foreground">No results</p>;
  }

  const popular = visible.filter((option) => option.popular);
  const others = visible.filter((option) => !option.popular);

  const toggle = (value: OptionValue) => {
    if (!multiple) return onSelect([value]);
    onSelect(
      selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value],
    );
  };

  const renderRows = (rows: FormFieldOption[]) =>
    rows.map((option) => {
      const isSelected = selected.includes(option.value);
      return (
        <button
          key={String(option.value)}
          type="button"
          onClick={() => toggle(option.value)}
          className="flex items-center justify-between w-full px-4 py-4 text-sm text-left border-b border-border"
        >
          <span className={cn(isSelected && "font-medium text-primary")}>
            {option.label}
          </span>
          {multiple ? (
            <CheckMark checked={isSelected} />
          ) : showRadio ? (
            <RadioDot checked={isSelected} />
          ) : (
            isSelected && <Check className="size-4 text-primary" />
          )}
        </button>
      );
    });

  // no popular options: one plain list
  if (popular.length === 0) return <>{renderRows(others)}</>;

  return (
    <>
      <SectionTitle>Popular</SectionTitle>
      {renderRows(popular)}
      {others.length > 0 && <SectionTitle>Other</SectionTitle>}
      {renderRows(others)}
    </>
  );
}

const SectionTitle = ({ children }: { children: string }) => (
  <p className="px-4 py-2 text-xs font-medium uppercase bg-secondary text-muted-foreground">
    {children}
  </p>
);

const RadioDot = ({ checked }: { checked: boolean }) => (
  <span
    className={cn(
      "flex items-center justify-center rounded-full size-5 border-2",
      checked ? "border-primary" : "border-muted-foreground/50",
    )}
  >
    {checked && <span className="rounded-full size-2.5 bg-primary" />}
  </span>
);

// a plain tick box (not a <button>), because the whole row is already a button
const CheckMark = ({ checked }: { checked: boolean }) => (
  <span
    className={cn(
      "flex items-center justify-center rounded-sm size-5 border-2",
      checked
        ? "border-primary bg-primary text-primary-foreground"
        : "border-muted-foreground/50",
    )}
  >
    {checked && <Check className="size-3.5" />}
  </span>
);
