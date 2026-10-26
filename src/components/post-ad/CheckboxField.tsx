import { Controller, useFormContext } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { buildRules } from "@/lib/post-ad/formHelpers";
import type { FormField } from "@/types/listing";
import FieldShell from "./FieldShell";

export default function CheckboxField({ field }: { field: FormField }) {
  const { control } = useFormContext();
  const id = `field-${field.key}`;

  return (
    <Controller
      name={field.key}
      control={control}
      rules={buildRules(field)}
      render={({ field: input }) => (
        <FieldShell field={field} hideLabel>
          <div className="flex items-center gap-3">
            <Checkbox
              id={id}
              className="size-5"
              checked={input.value === true}
              onCheckedChange={(checked) => input.onChange(checked === true)}
            />
            <Label htmlFor={id} className="font-normal">
              {field.label}
            </Label>
          </div>
        </FieldShell>
      )}
    />
  );
}
