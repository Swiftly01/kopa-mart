import { Loader2 } from "lucide-react";
import { FormProvider, useForm } from "react-hook-form";
import type { FieldValues } from "react-hook-form";
import type { AxiosError } from "axios";
import DynamicField from "@/components/post-ad/DynamicField";
import EditPhotos from "@/components/post-ad/EditPhotos";
import type { PhotoActions } from "@/components/post-ad/EditPhotos";
import { Button } from "@/components/ui/button";
import { handleAxiosError } from "@/lib/utils/errors/errorHandler";
import { buildPayload, buildValuesFromListing } from "@/lib/post-ad/formHelpers";
import type { ListingDetailData, ListingFormSchema } from "@/types/listing";

interface AdEditFormProps {
  schema: ListingFormSchema;
  ad: ListingDetailData;
  photoActions: PhotoActions;
  // sends the changed fields to the API (owner or admin endpoint)
  onSave: (payload: Record<string, unknown>) => Promise<void>;
  saveLabel?: string;
}

// edit form shared by the owner and the admin: same fields as posting, filled in
export default function AdEditForm({
  schema,
  ad,
  photoActions,
  onSave,
  saveLabel = "Save changes",
}: AdEditFormProps) {
  const methods = useForm<FieldValues>({
    defaultValues: buildValuesFromListing(
      schema.fields,
      ad as unknown as Record<string, unknown>,
    ),
  });

  const save = async (values: FieldValues) => {
    try {
      await onSave(buildPayload(schema.fields, values));
    } catch (error) {
      handleAxiosError(error as AxiosError, methods.setError);
    }
  };

  const scrollToFirstError = () => {
    setTimeout(() => {
      document
        .querySelector('[data-field-error="true"]')
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 0);
  };

  return (
    <FormProvider {...methods}>
      <form
        noValidate
        onSubmit={methods.handleSubmit(save, scrollToFirstError)}
        className="space-y-5"
      >
        <EditPhotos images={ad.images} actions={photoActions} />

        {/* photos are handled above, so the form's photo field is skipped */}
        {schema.fields
          .filter((field) => field.type !== "photos")
          .map((field) => (
            <DynamicField key={field.key} field={field} />
          ))}

        <Button
          type="submit"
          disabled={methods.formState.isSubmitting}
          className="w-full h-12 bg-gradient-primary"
        >
          {methods.formState.isSubmitting ? (
            <>
              <Loader2 className="animate-spin" /> Saving...
            </>
          ) : (
            saveLabel
          )}
        </Button>
      </form>
    </FormProvider>
  );
}
