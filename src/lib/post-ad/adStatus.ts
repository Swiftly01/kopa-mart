import type { ListingStatus } from "@/types/listing";

// one place for how every ad status is named and coloured
export const AD_STATUS: Record<
  ListingStatus,
  { label: string; className: string; hint: string }
> = {
  draft: {
    label: "Draft",
    className: "bg-secondary text-secondary-foreground",
    hint: "Not published yet.",
  },
  pending_review: {
    label: "In review",
    className: "bg-warning/15 text-warning",
    hint: "An admin is re-checking it. It is not public meanwhile.",
  },
  active: {
    label: "Live",
    className: "bg-success/15 text-success",
    hint: "Visible to everyone.",
  },
  rejected: {
    label: "Rejected",
    className: "bg-destructive/15 text-destructive",
    hint: "An admin took it down. Fix the issue and appeal for a re-check.",
  },
  inactive: {
    label: "Paused",
    className: "bg-secondary text-secondary-foreground",
    hint: "Hidden from the public. You can make it live again.",
  },
  removed: {
    label: "Removed",
    className: "bg-secondary text-secondary-foreground",
    hint: "Deleted.",
  },
};
