import { Controller, useFormContext } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { buildRules } from "@/lib/post-ad/formHelpers";
import type { FormField } from "@/types/listing";
import FieldShell from "./FieldShell";

export default function TextAreaField({ field }: { field: FormField }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={field.key}
      control={control}
      rules={buildRules(field)}
      render={({ field: input }) => {
        const value = (input.value ?? "") as string;

        return (
          <FieldShell
            field={field}
            counter={field.maxLength ? `${value.length}/${field.maxLength}` : undefined}
          >
            <Textarea
              rows={6}
              placeholder={field.placeholder}
              maxLength={field.maxLength}
              value={value}
              name={input.name}
              ref={input.ref}
              onBlur={input.onBlur}
              onChange={(event) => input.onChange(event.target.value)}
            />
          </FieldShell>
        );
      }}
    />
  );
}
