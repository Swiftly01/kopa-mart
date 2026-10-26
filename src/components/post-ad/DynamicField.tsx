import type { FormField } from "@/types/listing";
import CheckboxField from "./CheckboxField";
import InputField from "./InputField";
import LocationField from "./LocationField";
import PhotosField from "./PhotosField";
import PickerField from "./PickerField";
import RadioField from "./RadioField";
import TextAreaField from "./TextAreaField";

// Picks the right input for a field described by the backend.
// New category = new fields from the API; only a brand-new field TYPE needs a case here.
export default function DynamicField({ field }: { field: FormField }) {
  switch (field.type) {
    case "text":
    case "url":
    case "number":
      return <InputField field={field} />;
    case "textarea":
      return <TextAreaField field={field} />;
    case "select":
    case "multiselect":
      return <PickerField field={field} />;
    case "radio":
      return <RadioField field={field} />;
    case "checkbox":
      return <CheckboxField field={field} />;
    case "photos":
      return <PhotosField field={field} />;
    case "location":
      return <LocationField field={field} />;
    default:
      // a field type this app version does not know yet is skipped, not a crash
      return null;
  }
}
