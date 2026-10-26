import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { buildRules } from "@/lib/post-ad/formHelpers";
import type { FormField, OptionValue } from "@/types/listing";
import FieldShell from "./FieldShell";
import OptionPicker from "./OptionPicker";
import PickerButton from "./PickerButton";

// "select" (pick one) and "multiselect" (pick many) share this component
export default function PickerField({ field }: { field: FormField }) {
  const { control } = useFormContext();
  const [open, setOpen] = useState(false);
  const multiple = field.type === "multiselect";
  const options = field.options ?? [];

  return (
    <Controller
      name={field.key}
      control={control}
      rules={buildRules(field)}
      render={({ field: input }) => {
        // the form stores a value (single) or a list of values (multiple)
        const selected: OptionValue[] = multiple
          ? ((input.value as OptionValue[]) ?? [])
          : input.value === "" || input.value == null
            ? []
            : [input.value as OptionValue];

        const text = options
          .filter((option) => selected.includes(option.value))
          .map((option) => option.label)
          .join(", ");

        return (
          <FieldShell field={field}>
            <PickerButton
              text={text}
              placeholder={field.placeholder ?? "Select"}
              onClick={() => setOpen(true)}
            />
            <OptionPicker
              open={open}
              title={field.label}
              options={options}
              selected={selected}
              multiple={multiple}
              searchable={field.searchable}
              onClose={() => setOpen(false)}
              onSelect={(values) => {
                input.onChange(multiple ? values : (values[0] ?? ""));
                setOpen(false);
              }}
            />
          </FieldShell>
        );
      }}
    />
  );
}
