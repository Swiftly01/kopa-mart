
import nyscLogo from "@/assets/kopa_logo.jpeg";
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
import useLgas from "@/hooks/locations/queries/useLgas";
import useStates from "@/hooks/locations/queries/useStates";
import useSubmitIdVerification from "@/hooks/seller/mutations/useSubmitIdVerification";
import appToast from "@/lib/appToast";
import { handleAxiosError } from "@/lib/utils/errors/errorHandler";
import {
  idVerificationSchema,
  IdVerificationSchema,
} from "@/schemas/idVerificationSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { AlertTriangle, Lightbulb, Upload } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

const Apply = () => {
  const navigate = useNavigate();

  const { data: statesData, isLoading: statesLoading } = useStates();
  const states = statesData?.data ?? [];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    control,
    trigger,
    formState: { errors, isValid, isValidating },
  } = useForm<IdVerificationSchema>({
    resolver: zodResolver(idVerificationSchema),
    mode: "onBlur",
    defaultValues: {
      idType: "nysc_id",
      fullName: "",
      stateCodeNumber: "",
      stateCode: "",
      stateName: "",
      ppaLga: "",
      idNumber: "",
    },
  });

  const selectedStateCode = watch("stateCode");
  const frontFile = watch("idFront");
  const backFile = watch("idBack");
  const fullName = watch("fullName");
  const stateCodeNumber = watch("stateCodeNumber");
  const ppaLga = watch("ppaLga");

  const { data: lgasData, isLoading: lgasLoading } = useLgas(selectedStateCode);
  const lgas = lgasData?.data?.lgas ?? [];

  const { mutate: submitId, isPending } = useSubmitIdVerification();

  function onSubmit(data: IdVerificationSchema) {
    const formData = new FormData();

    formData.append("idFront", data.idFront);
    formData.append("idBack", data.idBack);
    formData.append("fullName", data.fullName);
    formData.append("stateCodeNumber", data.stateCodeNumber);
    formData.append("ppaLga", data.ppaLga);
    formData.append("idType", data.idType);
    formData.append("idNumber", data.idNumber);
    formData.append("stateName", data.stateName);
    formData.append("stateCode", data.stateCode);

    submitId(formData, {
      onSuccess: () => {
        appToast({
          title: "ID submission",
          description: "ID submitted successfully",
        });
        navigate("/seller-onboarding/face-scan");
      },
      onError: (err: AxiosError) => {
        handleAxiosError(err, setError);
      },
    });
  }

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "idFront" | "idBack"
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

  
    const MAX_FILE_SIZE = 2 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      setError(field, {
        type: "manual",
        message: `${field === "idFront" ? "Front" : "Back"} image must be less than 1MB`,
      });
      return;
    }

    // Set the file value
    setValue(field, file, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  // Check if form is ready to submit
  const canSubmit = !!frontFile && !!backFile && isValid && !isValidating;

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
        <span className="font-semibold">Step 2 of 4</span>
        <span className="text-muted-foreground">NYSC ID Upload</span>
      </div>
      <div className="mt-1.5 h-1 bg-secondary rounded-full overflow-hidden">
        <div className="h-full w-2/4 bg-primary" />
      </div>

      <div className="mt-6 grid md:grid-cols-[1fr,260px] gap-5">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="card-listing p-5 space-y-4"
        >
          <div>
            <h1 className="text-xl font-bold">Upload your NYSC ID</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Please upload clear photos of both the front and back of your
              valid NYSC identification card.
            </p>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-lg bg-warning/10 border border-warning/20">
            <AlertTriangle className="size-4 text-warning shrink-0" />
            <p className="text-[11px] text-muted-foreground">
              <strong>Max 2MB per image.</strong> Compress or resize before
              uploading.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              {
                label: "Front of ID",
                file: frontFile,
                field: "idFront" as const,
              },
              {
                label: "Back of ID",
                file: backFile,
                field: "idBack" as const,
              },
            ].map((item, i) => {
              const preview = item.file ? URL.createObjectURL(item.file) : null;
              const fieldError = errors[item.field];

              return (
                <div key={i} className="space-y-1">
                  <label className="aspect-[5/3] rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1.5 text-muted-foreground cursor-pointer hover:border-primary hover:text-primary transition-colors overflow-hidden bg-secondary/40">
                    {preview ? (
                      <img
                        src={preview}
                        alt={item.label}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <>
                        <div className="size-8 rounded-lg bg-background flex items-center justify-center">
                          <Upload className="size-4" />
                        </div>
                        <span className="text-xs font-medium">
                          {item.label}
                        </span>
                        <span className="text-[10px]">
                          Click to upload (max 2MB)
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, item.field)}
                    />
                  </label>
                  {fieldError && (
                    <p className="text-red-500 text-xs mt-1">
                      {fieldError.message}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-border">
            <p className="font-semibold text-sm mb-3">Confirm ID Details</p>
            <div className="space-y-3">
              <div>
                <Label>Full Name (as on ID)</Label>
                <Input
                  {...register("fullName")}
                  className="h-11 mt-1"
                  placeholder="Enter full name"
                />
                {errors.fullName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>State Code</Label>
                  <Input
                    placeholder="e.g. OS/24B/1234"
                    {...register("stateCodeNumber")}
                    className="h-11 mt-1"
                  />
                  {errors.stateCodeNumber && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.stateCodeNumber?.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label>State</Label>
                  <Select
                    value={selectedStateCode || ""}
                    onValueChange={(value) => {
                      const selectedState = states.find(
                        (s) => s.code === value
                      );

                      setValue("stateCode", value, {
                        shouldValidate: true,
                        shouldDirty: true,
                      });

                      if (selectedState) {
                        setValue("stateName", selectedState.name, {
                          shouldValidate: true,
                          shouldDirty: true,
                        });
                      }
                    }}
                  >
                    <SelectTrigger className="h-11 mt-1">
                      <SelectValue placeholder="Select State" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map((state) => (
                        <SelectItem key={state.code} value={state.code}>
                          {state.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.stateCode && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.stateCode?.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label>ID Number</Label>
                <Input
                  placeholder="Enter ID number"
                  {...register("idNumber")}
                  className="h-11 mt-1"
                />
                {errors.idNumber && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.idNumber?.message}
                  </p>
                )}
              </div>

              <div>
                <Label>PPA / LGA</Label>
                <Select
                  value={ppaLga || ""}
                  onValueChange={(value) => {
                    setValue("ppaLga", value, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                  }}
                  disabled={!selectedStateCode || lgasLoading}
                >
                  <SelectTrigger className="h-11 mt-1">
                    <SelectValue
                      placeholder={
                        !selectedStateCode
                          ? "Select a state first"
                          : lgasLoading
                            ? "Loading..."
                            : "Select LGA"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {lgas.map((lga) => (
                      <SelectItem key={lga.id} value={lga.name}>
                        {lga.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.ppaLga && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.ppaLga?.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Back
            </Button>
            <Button
              disabled={isPending || !canSubmit}
              type="submit"
              className="bg-foreground text-background hover:bg-foreground/90"
              title={
                !canSubmit
                  ? "Please fill all required fields and upload both ID images"
                  : ""
              }
            >
              {isPending ? "Submitting..." : "Continue"}
            </Button>
          </div>
        </form>

        <aside className="card-listing p-4 h-fit space-y-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="size-4 text-warning" />
            <p className="font-semibold text-sm">Upload Guidance</p>
          </div>
          <p className="text-xs text-muted-foreground">
            Follow these tips to ensure your ID is approved quickly.
          </p>
          <div className="aspect-video rounded-lg bg-secondary flex items-center justify-center text-[11px] text-muted-foreground">
            Example of a clear, well-lit photo
          </div>
          <p className="text-[11px] font-semibold">FILE QUALITY CHECKLIST</p>
          <ul className="space-y-1.5 text-[11px] text-muted-foreground">
            <li>
              ✓{" "}
              <span className="font-medium text-foreground">Good Lighting</span>{" "}
              — Avoid shadows or glare on the card.
            </li>
            <li>
              ✓ <span className="font-medium text-foreground">Clear Text</span>{" "}
              — All details must be readable, not blurry.
            </li>
            <li>
              ✓{" "}
              <span className="font-medium text-foreground">
                All Corners Visible
              </span>{" "}
              — Do not crop or cut off the edges.
            </li>
            <li>
              ✓ <span className="font-medium text-foreground">Max 1MB</span> —
              Keep files under 1MB for fast upload.
            </li>
          </ul>
          <p className="text-[10px] text-muted-foreground border-t border-border pt-2">
            Only physical, original cards are accepted.
          </p>
        </aside>
      </div>
    </div>
  );
};

export default Apply;
