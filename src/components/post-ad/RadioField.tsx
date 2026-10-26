import { Controller, useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { buildRules } from "@/lib/post-ad/formHelpers";
import type { FormField } from "@/types/listing";
import FieldShell from "./FieldShell";

// a few choices shown side by side, e.g. Yes / No / Not sure
export default function RadioField({ field }: { field: FormField }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={field.key}
      control={control}
      rules={buildRules(field)}
      render={({ field: input }) => (
        <FieldShell field={field}>
          <RadioGroup
            className="flex flex-wrap gap-x-6 gap-y-2"
            value={String(input.value ?? "")}
            onValueChange={input.onChange}
          >
            {field.options?.map((option) => {
              const id = `${field.key}-${option.value}`;
              return (
                <div key={id} className="flex items-center gap-2">
                  <RadioGroupItem id={id} value={String(option.value)} />
                  <Label htmlFor={id} className="font-normal">
                    {option.label}
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        </FieldShell>
      )}
    />
  );
}
