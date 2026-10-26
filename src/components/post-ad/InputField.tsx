import { Controller, useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { buildRules } from "@/lib/post-ad/formHelpers";
import type { FormField } from "@/types/listing";
import FieldShell from "./FieldShell";

// handles the one-line types: text, url and number
export default function InputField({ field }: { field: FormField }) {
  const { control } = useFormContext();
  const isNumber = field.type === "number";

  return (
    <Controller
      name={field.key}
      control={control}
      rules={buildRules(field)}
      render={({ field: input }) => {
        const value = (input.value ?? "") as string | number;
        const counter = field.maxLength
          ? `${String(value).length}/${field.maxLength}`
          : undefined;

        return (
          <FieldShell field={field} counter={counter}>
            <Input
              className="h-12"
              type={field.type === "url" ? "url" : "text"}
              inputMode={isNumber ? "numeric" : undefined}
              placeholder={field.placeholder}
              maxLength={field.maxLength}
              value={value}
              name={input.name}
              ref={input.ref}
              onBlur={input.onBlur}
              onChange={(event) => {
                if (!isNumber) return input.onChange(event.target.value);
                // numbers: keep digits only, store a real number (or "" when empty)
                const digits = event.target.value.replace(/\D/g, "");
                input.onChange(digits === "" ? "" : Number(digits));
              }}
            />
          </FieldShell>
        );
      }}
    />
  );
}
