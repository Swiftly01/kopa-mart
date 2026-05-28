import { toast } from "sonner";

type ToastInput = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
};

export default function appToast({ title, description, variant }: ToastInput) {
  const message = title || "Notification";

  if (variant === "destructive") {
    return toast.error(message, {
      description,
    });
  }

  return toast(message, {
    description,
  });
}
