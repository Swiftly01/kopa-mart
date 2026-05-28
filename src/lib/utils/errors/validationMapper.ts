import { FieldError } from "react-hook-form";

type ValidationMessage = {
  field: string;
  message: string;
};

export function nestValidationError<TField extends string>(
  messages: ValidationMessage[],
  setError: (field: TField, error: FieldError) => void,
) {
  messages.forEach((err) => {
    if (!err.field || !err.message) return;

    setError(err.field as TField, {
      type: "server",
      message: err.message,
    });
  });
}