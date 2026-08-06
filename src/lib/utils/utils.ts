import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


export const formatNaira = (value: string | number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(Number(value));

/**
 * formatReviewerName
 *
 * Reviews show a lightly-anonymized version of the buyer's name — first
 * name plus last-initial — rather than their full name, e.g. "Amaka O."
 * Falls back to "Anonymous buyer" if no name is available.
 */
export const formatReviewerName = (
  firstName?: string | null,
  lastName?: string | null,
) => {
  if (!firstName) return "Anonymous buyer";
  const initial = lastName ? `${lastName.charAt(0).toUpperCase()}.` : "";
  return [firstName, initial].filter(Boolean).join(" ");
};

/** formatDate — short absolute date, e.g. "12 Jan 2026", used for review timestamps. */
export const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min${mins !== 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days !== 1 ? "s" : ""} ago`;
};