import { ArrowLeft, ChevronRight, Loader2 } from "lucide-react";
import { FormProvider, useForm } from "react-hook-form";
import type { FieldValues } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import ContactInfo from "@/components/post-ad/ContactInfo";
import DynamicField from "@/components/post-ad/DynamicField";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import usePostAdSubmit from "@/hooks/listings/custom/usePostAdSubmit";
import useGetListingForm from "@/hooks/listings/queries/useGetListingForm";
import { buildDefaultValues } from "@/lib/post-ad/formHelpers";
import type { ListingFormSchema } from "@/types/listing";

// step 2 of posting: load the category's form, then show it
export default function PostAdForm() {
  const navigate = useNavigate();
  const { categoryId = "" } = useParams<{ categoryId: string }>();
  const { data: schema, isLoading, isError } = useGetListingForm(categoryId);

  if (isLoading) {
    return (
      <div className="max-w-2xl px-4 pt-6 mx-auto space-y-4">
        {[1, 2, 3, 4, 5].map((item) => (
          <Skeleton key={item} className="h-12 rounded-md" />
        ))}
      </div>
    );
  }

  if (isError || !schema) {
    return (
      <div className="max-w-md px-6 pt-16 mx-auto space-y-3 text-center">
        <h1 className="text-lg font-bold">Category not available</h1>
        <p className="text-sm text-muted-foreground">
          You cannot post ads in this category yet.
        </p>
        <Button onClick={() => navigate("/post-ad")}>Choose another</Button>
      </div>
    );
  }

  // mounted only after the schema arrives, so the form starts with the right defaults
  return <PostAdFormBody schema={schema} />;
}

function PostAdFormBody({ schema }: { schema: ListingFormSchema }) {
  const navigate = useNavigate();
  const methods = useForm<FieldValues>({
    defaultValues: buildDefaultValues(schema.fields),
  });
  const { submit, isSubmitting } = usePostAdSubmit(schema);

  // after a failed submit, bring the first problem into view
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
        onSubmit={methods.handleSubmit(
          (values) => submit(values, methods.setError),
          scrollToFirstError,
        )}
        className="max-w-2xl px-4 pt-4 mx-auto space-y-5 pb-10"
      >
        <header className="flex items-center gap-3">
          <button type="button" onClick={() => navigate(-1)} aria-label="Back">
            <ArrowLeft className="size-5" />
          </button>
          <h1 className="flex-1 text-lg font-bold">Post new ad</h1>
          <Button
            type="button"
            variant="ghost"
            className="text-destructive"
            onClick={() => methods.reset(buildDefaultValues(schema.fields))}
          >
            Clear
          </Button>
        </header>

        {/* the category is fixed here; tapping goes back to choose another */}
        <div className="space-y-1.5">
          <Label>Category</Label>
          <Link
            to="/post-ad"
            className="flex items-center justify-between h-12 px-3 text-sm border rounded-md border-input"
          >
            {schema.category.name}
            <ChevronRight className="size-4 text-muted-foreground" />
          </Link>
        </div>

        {schema.fields.map((field) => (
          <DynamicField key={field.key} field={field} />
        ))}

        <ContactInfo />

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 bg-gradient-primary"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" /> Posting...
            </>
          ) : (
            "Post ad"
          )}
        </Button>
      </form>
    </FormProvider>
  );
}
