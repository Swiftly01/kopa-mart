import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Camera, ShieldCheck, AlertTriangle, Loader2 } from "lucide-react";
import { useStore, useCurrentUser } from "@/store/useStore";
import appToast from "@/lib/appToast";
import nyscLogo from "@/assets/kopa_logo.jpeg";
import { AxiosError } from "axios";
import useSubmitStoreProfile from "@/hooks/seller/mutations/useSubmitStoreProfile";
import { handleAxiosError } from "@/lib/utils/errors/errorHandler";
import { useEffect, useState } from "react";

// Validation schema
const storeProfileSchema = z.object({
  storeName: z
    .string()
    .min(2, "Store name must be at least 2 characters")
    .max(100),
  whatsappNumber: z.string().min(10, "Please enter a valid WhatsApp number"),
  logo: z
    .instanceof(File)
    .optional()
    .refine((file) => !file || file.size <= 1 * 1024 * 1024, {
      message: "Logo must be less than 1MB",
    })
    .refine((file) => !file || file.type.startsWith("image/"), {
      message: "Logo must be an image file",
    }),
  campMeetup: z.boolean().default(true),
  localDelivery: z.boolean().default(false),
});

type StoreProfileSchema = z.infer<typeof storeProfileSchema>;

const StoreProfile = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    setError,
    setValue,
    formState: { errors, isValid, isValidating },
  } = useForm<StoreProfileSchema>({
    resolver: zodResolver(storeProfileSchema),
    mode: "onChange",
    defaultValues: {
      storeName: "",
      whatsappNumber: "",
      campMeetup: true,
      localDelivery: false,
    },
  });

  const logoFile = watch("logo");
  const storeName = watch("storeName");
  const whatsapp = watch("whatsappNumber");
  const campMeetup = watch("campMeetup");
  const localDelivery = watch("localDelivery");

  const { submitProfile, isLoading: isSubmitting } = useSubmitStoreProfile();

  // Handle logo file selection
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Validate file size
    if (file.size > 1 * 1024 * 1024) {
      appToast({
        title: "File Too Large",
        description: "Logo must be less than 1MB",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      appToast({
        title: "Invalid File",
        description: "Please select a valid image file",
        variant: "destructive",
      });
      return;
    }

    // Set file in form
    setValue("logo", file, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const [logoPreview, setLogoPreview] = useState<string>();

  useEffect(() => {
    if (!logoFile) {
      setLogoPreview(undefined);
      return;
    }

    const preview = URL.createObjectURL(logoFile);
    setLogoPreview(preview);

    return () => URL.revokeObjectURL(preview);
  }, [logoFile]);

  const onSubmit = (data: StoreProfileSchema) => {
    const formData = new FormData();
    formData.append("storeName", data.storeName);

    if (data.logo) {
      formData.append("storeLogo", data.logo);
    }

    formData.append("whatsappNumber", data.whatsappNumber);

    const deliveryPreferences: string[] = [];

    if (data.campMeetup) {
      deliveryPreferences.push("camp_meetup");
    }

    if (data.localDelivery) {
      deliveryPreferences.push("local_delivery");
    }

    deliveryPreferences.forEach((preference) => {
      formData.append("deliveryPreferences", preference);
    });

    submitProfile(formData, {
      onSuccess: () => {
        appToast({
          title: "Submit store profile",
          description: "Store profile submitted successfully",
        });
        navigate('/seller-onboarding/pending');
      },
      onError: (err: AxiosError) => {
        handleAxiosError(err, setError);
      },
    });
  };

  // Determine if submit button should be disabled
  const canSubmit = isValid && !isValidating && !isSubmitting;

  return (
    <div className="max-w-2xl mx-auto px-5 pt-4 pb-16">
      <div className="flex items-center justify-between py-2">
        <Link to="/" className="flex items-center gap-2">
          <img
            src={nyscLogo}
            alt="Kopa Market"
            className="size-8 rounded-lg object-cover ring-1 ring-border"
          />
          <span className="font-semibold">Kopa Market</span>
        </Link>
        <Link to="/" className="text-xs text-muted-foreground">
          Save & Exit
        </Link>
      </div>

      <div className="mt-4 flex items-center justify-between text-[11px]">
        <span className="font-semibold">Step 4 of 4</span>
        <span className="text-muted-foreground">Store Profile</span>
      </div>
      <div className="mt-1.5 h-1 bg-secondary rounded-full overflow-hidden">
        <div className="h-full w-full bg-primary" />
      </div>

      <div className="mt-6 grid md:grid-cols-[1fr,260px] gap-5">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="card-listing p-5 space-y-4"
        >
          <div>
            <h1 className="text-xl font-bold">Create Store Profile</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Set up your digital storefront. This is how other corps members
              will see you on Kopa Marketplace.
            </p>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-lg bg-warning/10 border border-warning/20">
            <AlertTriangle className="size-4 text-warning shrink-0" />
            <p className="text-[11px] text-muted-foreground">
              <strong>Max 1MB per image.</strong> Compress or resize before
              uploading.
            </p>
          </div>

          {/* Logo Upload */}
          <div>
            <Label className="text-xs text-muted-foreground">
              Store Logo / Photo <span className="font-normal">(Optional)</span>
            </Label>
            <label className="aspect-[3/1] rounded-2xl border-2 border-dashed border-border bg-secondary/40 flex flex-col items-center justify-center gap-1 cursor-pointer text-muted-foreground hover:border-primary hover:text-primary overflow-hidden transition-colors mt-1">
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Store logo preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <>
                  <Camera className="size-5" />
                  <span className="text-xs font-medium">
                    Upload Store Logo / Photo
                  </span>
                  <span className="text-[10px]">JPG, PNG up to 1MB</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleLogoChange}
              />
            </label>
            {errors.logo && (
              <p className="text-red-500 text-xs mt-1">{errors.logo.message}</p>
            )}
          </div>

          {/* Store Name */}
          <div>
            <Label>Store Name</Label>
            <Input
              {...register("storeName")}
              placeholder="e.g. Kopa Kicks & Wears"
              className="h-11 mt-1"
            />
            {errors.storeName && (
              <p className="text-red-500 text-xs mt-1">
                {errors.storeName.message}
              </p>
            )}
          </div>

          {/* WhatsApp Number */}
          <div>
            <Label>
              WhatsApp Number{" "}
              <span className="text-muted-foreground font-normal text-xs">
                (Required for buyers to contact you)
              </span>
            </Label>
            <Input
              {...register("whatsappNumber")}
              placeholder="+234 801 234 5678"
              className="h-11 mt-1"
              type="tel"
            />
            {errors.whatsappNumber && (
              <p className="text-red-500 text-xs mt-1">
                {errors.whatsappNumber.message}
              </p>
            )}
          </div>

          {/* Delivery Preferences */}
          <div>
            <Label>Delivery Preferences</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {/* Camp Meetup */}
              <label
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2 ${
                  campMeetup
                    ? "border-primary bg-primary/5"
                    : "border-border bg-transparent"
                }`}
              >
                <Checkbox
                  checked={campMeetup}
                  onCheckedChange={(v) => {
                    setValue("campMeetup", !!v, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  }}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-foreground">
                    Camp Meetup
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Meet buyers at designated camp areas.
                  </p>
                </div>
              </label>

              {/* Local Delivery */}
              <label
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2 ${
                  localDelivery
                    ? "border-primary bg-primary/5"
                    : "border-border bg-transparent"
                }`}
              >
                <Checkbox
                  checked={localDelivery}
                  onCheckedChange={(v) => {
                    setValue("localDelivery", !!v, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  }}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-foreground">
                    Local Delivery
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Deliver within your PPA / LGA.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
            >
              Back
            </Button>
            <Button
              type="submit"
              disabled={!canSubmit}
              className="bg-foreground text-background hover:bg-foreground/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Profile"
              )}
            </Button>
          </div>
        </form>

        {/* Sidebar */}
        <aside className="bg-foreground text-background rounded-2xl p-5 space-y-3 h-fit">
          <p className="font-bold">Your Digital Storefront.</p>
          <p className="text-xs opacity-80">
            Verified. Trusted. Ready for business.
          </p>
          <div className="mt-4 bg-background/10 rounded-xl p-3 space-y-2">
            <div className="size-10 rounded-lg bg-background/20" />
            <div className="h-2 w-2/3 rounded bg-background/20" />
            <div className="h-2 w-1/2 rounded bg-background/20" />
          </div>
          <div className="flex items-center gap-3 pt-2 text-[10px] opacity-70">
            <span className="flex items-center gap-1">
              <ShieldCheck className="size-3" />
              ID Verified
            </span>
            <span>· Face Matched</span>
          </div>
        </aside>
      </div>
    </div>
  );
};

// Helper function to convert File to Data URL
const fileToDataUrl = (file: File) =>
  new Promise<string>((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(reader.result as string);
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });

export default StoreProfile;
