import { NestValidationErrorResponse } from "@/types/axios";
import axios, { AxiosError } from "axios";
import { FieldError } from "react-hook-form";
import { nestValidationError } from "./validationMapper";
import appToast from "@/lib/appToast";

export function handleAxiosError<TField extends string>(
  error: AxiosError,
  setError?: (field: TField, error: FieldError) => void,
) {
  //Network error
  if (axios.isAxiosError(error)) {
    if (error.code === "ERR_NETWORK")
      return appToast({
        title: "Network error",
        description: "Please check your connection or server",
        variant: "destructive",
      });
  }

  //Server responded with a status code
  if (error.response) {
    const status = error.response?.status;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = error.response.data as any;

    const isValidationArray =
      Array.isArray(data?.message) && typeof data?.message?.[0] === "object";

    if (status === 400 && isValidationArray) {
      const data = error.response.data as NestValidationErrorResponse;

      if (!setError) {
        return appToast({
          title: "Request failed",
          description: "Please check your input",
          variant: "destructive",
        });
      }
      nestValidationError<TField>(data.message, setError);
      return appToast({
        title: "Validation error",
        description: "Please correct the highlighted fields",
        variant: "destructive",
      });
    }

    // Other client errors
    if (status >= 400 && status < 500) {
      return appToast({
        title: "Request failed",
        description: data?.message || "Something went wrong",
        variant: "destructive",
      });
    }

    // 500+ Server errors
    if (status >= 500) {
      return appToast({
        title: "Server error",
        description: "Please try again later",
        variant: "destructive",
      });
    }

    //No response from server
    if (error.request) {
      return appToast({
        title: "No response",
        description: "Server did not respond. Try again.",
        variant: "destructive",
      });
    }
  }

  //fallback
  console.error(error);
  return appToast({
    title: "Unexpected error",
    description: "Something went wrong",
    variant: "destructive",
  });
}
