import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import useLgas from "@/hooks/locations/queries/useLgas";
import useStates from "@/hooks/locations/queries/useStates";
import { buildRules } from "@/lib/post-ad/formHelpers";
import type { FormField } from "@/types/listing";
import FieldShell from "./FieldShell";
import OptionPicker from "./OptionPicker";
import PickerButton from "./PickerButton";

type Step = "closed" | "state" | "lga";

// two steps: pick a state, then a locality (LGA) inside it
// the form stores stateCode, stateName and lgaName
export default function LocationField({ field }: { field: FormField }) {
  const { control, setValue, watch } = useFormContext();
  const [step, setStep] = useState<Step>("closed");
  const [pickedState, setPickedState] = useState({ code: "", name: "" });

  const { data: statesData, isLoading: statesLoading } = useStates();
  const { data: lgasData, isLoading: lgasLoading } = useLgas(pickedState.code);

  const stateName = watch("stateName") as string;

  const stateOptions = (statesData?.data ?? []).map((state) => ({
    value: state.code,
    label: state.name,
  }));
  const lgaOptions = (lgasData?.data?.lgas ?? []).map((lga) => ({
    value: lga.name,
    label: lga.name,
  }));

  const chooseState = (code: string) => {
    const state = stateOptions.find((option) => option.value === code);
    setPickedState({ code, name: state?.label ?? "" });
    setStep("lga");
  };

  return (
    <Controller
      name="lgaName"
      control={control}
      rules={buildRules(field)}
      render={({ field: input }) => (
        <FieldShell field={field} errorKey="lgaName">
          <PickerButton
            text={input.value ? `${input.value}, ${stateName}` : ""}
            placeholder="Select state and locality"
            onClick={() => setStep("state")}
          />

          <OptionPicker
            open={step === "state"}
            title="State"
            options={stateOptions}
            selected={[pickedState.code]}
            searchable
            loading={statesLoading}
            onClose={() => setStep("closed")}
            onSelect={([code]) => chooseState(String(code))}
          />

          <OptionPicker
            open={step === "lga"}
            title="Locality"
            options={lgaOptions}
            selected={input.value ? [input.value as string] : []}
            searchable
            loading={lgasLoading}
            // back goes to the state list so the user can change their mind
            onClose={() => setStep("state")}
            onSelect={([lga]) => {
              setValue("stateCode", pickedState.code);
              setValue("stateName", pickedState.name);
              input.onChange(String(lga));
              setStep("closed");
            }}
          />
        </FieldShell>
      )}
    />
  );
}
