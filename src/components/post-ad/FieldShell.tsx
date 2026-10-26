import type { ReactNode } from "react";
import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { getByPath } from "@/lib/post-ad/formHelpers";
import type { FormField } from "@/types/listing";

interface FieldShellProps {
  field: FormField;
  // e.g. "12/60" shown on the right under the input
  counter?: string;
  // the form key whose error to show (defaults to field.key)
  errorKey?: string;
  // checkbox draws its own label next to the box
  hideLabel?: boolean;
  children: ReactNode;
}

// the label, helper text, counter and error message around every input
export default function FieldShell({
  field,
  counter,
  errorKey,
  hideLabel,
  children,
}: FieldShellProps) {
  const {
    formState: { errors },
  } = useFormContext();

  const error = getByPath(errors, errorKey ?? field.key) as
    | { message?: string }
    | undefined;

  return (
    <div className="space-y-1.5" data-field-error={error ? "true" : undefined}>
      {!hideLabel && (
        <Label>
          {field.label}
          {field.required && <span className="text-destructive"> *</span>}
        </Label>
      )}

      {children}

      {(error?.message || field.helperText || counter) && (
        <div className="flex justify-between gap-3 text-xs">
          <p className={error ? "text-destructive" : "text-muted-foreground"}>
            {error?.message ?? field.helperText}
          </p>
          {counter && (
            <span className="shrink-0 text-muted-foreground">{counter}</span>
          )}
        </div>
      )}
    </div>
  );
}
