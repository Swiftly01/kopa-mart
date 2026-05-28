import { SellerVerificationStatusEnum } from "@/types/adminSellerVerification";

export const STATUS_STYLES: Record<string, { pill: string; dot: string; pulse?: boolean }> = {
  [SellerVerificationStatusEnum.PENDING_REVIEW]: {
    pill: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
    dot:  "bg-amber-500",
    pulse: true,
  },
  [SellerVerificationStatusEnum.APPROVED]: {
    pill: "bg-green-500/15 text-green-700 dark:text-green-400",
    dot:  "bg-green-500",
  },
  [SellerVerificationStatusEnum.REJECTED]: {
    pill: "bg-red-500/15 text-red-700 dark:text-red-400",
    dot:  "bg-red-500",
  },
  [SellerVerificationStatusEnum.IN_PROGRESS]: {
    pill: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
    dot:  "bg-blue-500",
  },
  [SellerVerificationStatusEnum.NOT_STARTED]: {
    pill: "bg-secondary text-muted-foreground",
    dot:  "bg-muted-foreground",
  },
};

export const STATUS_LABELS: Record<string, string> = {
  [SellerVerificationStatusEnum.PENDING_REVIEW]: "Pending review",
  [SellerVerificationStatusEnum.APPROVED]:       "Approved",
  [SellerVerificationStatusEnum.REJECTED]:       "Rejected",
  [SellerVerificationStatusEnum.IN_PROGRESS]:    "In progress",
  [SellerVerificationStatusEnum.NOT_STARTED]:    "Not started",
};