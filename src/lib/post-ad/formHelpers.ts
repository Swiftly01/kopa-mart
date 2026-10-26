import type { RegisterOptions } from "react-hook-form";
import type { FormField } from "@/types/listing";

type Values = Record<string, unknown>;

// "details.bedrooms" -> ["details", "bedrooms"]
const splitPath = (path: string) => path.split(".");

// reads a value by its dotted key, e.g. getByPath(values, "details.bedrooms")
export function getByPath(source: Values, path: string): unknown {
  return splitPath(path).reduce<unknown>(
    (current, part) =>
      current && typeof current === "object"
        ? (current as Values)[part]
        : undefined,
    source,
  );
}

// writes a value by its dotted key, creating the nested objects on the way
export function setByPath(target: Values, path: string, value: unknown): void {
  const parts = splitPath(path);
  const last = parts.pop() as string;

  let current = target;
  for (const part of parts) {
    if (typeof current[part] !== "object" || current[part] === null) {
      current[part] = {};
    }
    current = current[part] as Values;
  }
  current[last] = value;
}

// the empty form: every field gets a sensible starting value
export function buildDefaultValues(fields: FormField[]): Values {
  const values: Values = {};

  for (const field of fields) {
    if (field.type === "location") {
      values.stateCode = "";
      values.stateName = "";
      values.lgaName = "";
    } else if (field.type === "photos") {
      setByPath(values, field.key, []);
    } else if (field.type === "multiselect") {
      setByPath(values, field.key, []);
    } else if (field.type === "checkbox") {
      setByPath(values, field.key, field.defaultValue ?? false);
    } else {
      setByPath(values, field.key, field.defaultValue ?? "");
    }
  }
  return values;
}

// the form filled with an existing ad's values (edit mode); photos are managed separately
export function buildValuesFromListing(
  fields: FormField[],
  listing: Values,
): Values {
  const values = buildDefaultValues(fields);

  for (const field of fields) {
    if (field.type === "photos") continue;
    if (field.type === "location") {
      values.stateCode = listing.stateCode ?? "";
      values.stateName = listing.stateName ?? "";
      values.lgaName = listing.lgaName ?? "";
      continue;
    }
    const value = getByPath(listing, field.key);
    if (value !== undefined && value !== null) {
      setByPath(values, field.key, value);
    }
  }
  return values;
}

// empty answers are left out so the server sees them as "not provided"
const isEmpty = (value: unknown) =>
  value === undefined ||
  value === null ||
  value === "" ||
  (Array.isArray(value) && value.length === 0);

// turns the form values into the JSON body the API expects (photos go separately)
export function buildPayload(fields: FormField[], values: Values): Values {
  const payload: Values = {};

  for (const field of fields) {
    if (field.type === "photos") continue;

    if (field.type === "location") {
      payload.stateCode = values.stateCode;
      payload.lgaName = values.lgaName;
      continue;
    }

    const value = getByPath(values, field.key);
    if (!isEmpty(value)) {
      setByPath(payload, field.key, value);
    }
  }
  return payload;
}

// the validation rules react-hook-form should apply to one field
export function buildRules(field: FormField): RegisterOptions {
  const requiredMessage = `${field.label} is required`;

  if (field.type === "photos") {
    const minItems = field.minItems ?? 0;
    return {
      validate: (files: File[]) =>
        (files?.length ?? 0) >= minItems || `Add at least ${minItems} photos`,
    };
  }

  if (field.type === "location") {
    return { required: "Select the property locality" };
  }

  if (field.type === "multiselect") {
    return field.required
      ? {
          validate: (picked: unknown[]) =>
            (picked?.length ?? 0) > 0 || requiredMessage,
        }
      : {};
  }

  const rules: RegisterOptions = {};
  if (field.required) rules.required = requiredMessage;

  if (field.type === "text" || field.type === "textarea" || field.type === "url") {
    if (field.minLength) {
      rules.minLength = {
        value: field.minLength,
        message: `${field.label} must be at least ${field.minLength} characters`,
      };
    }
    if (field.maxLength) {
      rules.maxLength = {
        value: field.maxLength,
        message: `${field.label} must be at most ${field.maxLength} characters`,
      };
    }
  }

  if (field.type === "url") {
    rules.pattern = {
      value: /^https?:\/\/\S+$/i,
      message: "Enter a valid link starting with http:// or https://",
    };
  }

  if (field.type === "number") {
    if (field.min !== undefined) {
      rules.min = { value: field.min, message: `Must be at least ${field.min}` };
    }
    if (field.max !== undefined) {
      rules.max = { value: field.max, message: `Must be at most ${field.max}` };
    }
  }

  return rules;
}
