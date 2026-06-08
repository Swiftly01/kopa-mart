import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useUpdateProfile from "@/hooks/users/mutations/useUpdateProfile";
import { User } from "@/types/user";

// ─── Zod schema ──────────────────────────────────────────────────────────────
const schema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  phoneNumber: z
    .string()
    .regex(
      /^\+234\d{10}$/,
      "Enter a valid Nigerian number e.g. +2349131365111",
    ),
});

export type FormValues = z.infer<typeof schema>;

// ─── Props ────────────────────────────────────────────────────────────────────
interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  user: User;
}

export default function EditProfileModal({
  open,
  onClose,
  user,
}: EditProfileModalProps) {

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      phoneNumber: user.phoneNumber ?? "",
    },
  });

  // Keep form in sync if the user object changes (e.g. after a successful save)
  useEffect(() => {
    reset({
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      phoneNumber: user.phoneNumber ?? "",
    });
  }, [user, reset]);

  const { mutate, isPending } = useUpdateProfile(setError);


  const onSubmit = (values: FormValues) => {
    mutate(
      {
        firstName: values.firstName,
        lastName: values.lastName,
        phoneNumber: values.phoneNumber || undefined,
      },
      { onSuccess: onClose },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-full max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="pt-2 space-y-4">
          {/* First name */}
          <div className="space-y-1">
            <Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" {...register("firstName")} />
            {errors.firstName && (
              <p className="text-xs text-destructive">
                {errors.firstName.message}
              </p>
            )}
          </div>

          {/* Last name */}
          <div className="space-y-1">
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" {...register("lastName")} />
            {errors.lastName && (
              <p className="text-xs text-destructive">
                {errors.lastName.message}
              </p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="+2348012345678"
              {...register("phoneNumber")}
            />
            {errors.phoneNumber && (
              <p className="text-xs text-destructive">
                {errors.phoneNumber.message}
              </p>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isPending || !isDirty}
            >
              {isPending ? <Loader2 className="size-4 animate-spin" /> : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
