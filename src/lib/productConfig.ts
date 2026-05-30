import { FilterState, ProductCondition, SortBy } from "@/types/product";

export const conditionConfig: Record<string, { label: string; className: string }> = {
  [ProductCondition.NEW]: {
    label: "New",
    className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  [ProductCondition.LIKE_NEW]: {
    label: "Like New",
    className: "bg-teal-50 text-teal-700 border border-teal-200",
  },
  [ProductCondition.GOOD]: {
    label: "Good",
    className: "bg-blue-50 text-blue-700 border border-blue-200",
  },
  [ProductCondition.FAIR]: {
    label: "Fair",
    className: "bg-amber-50 text-amber-700 border border-amber-200",
  },
};

export const statusConfig: Record<string, { label: string; className: string }> = {
  active: {
    label: "Active",
    className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  inactive: {
    label: "Inactive",
    className: "bg-slate-100 text-slate-500 border border-slate-200",
  },
  pending: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 border border-amber-200",
  },
  sold: {
    label: "Sold",
    className: "bg-rose-50 text-rose-700 border border-rose-200",
  },
  draft: {
    label: "Draft",
    className: "bg-purple-50 text-purple-700 border border-purple-200",
  },
  suspended: {
    label: "Suspended",
    className: "bg-red-50 text-red-700 border border-red-200",
  },
  expired: {
    label: "Expired",
    className: "bg-orange-50 text-orange-700 border border-orange-200",
  },
};

export const sortByOptions: { value: SortBy; label: string }[] = [
  { value: SortBy.NEWEST, label: "Newest first" },
  { value: SortBy.PRICE_ASC, label: "Price: low → high" },
  { value: SortBy.PRICE_DESC, label: "Price: high → low" },
  { value: SortBy.POPULAR, label: "Most viewed" },
];

export function countActiveFilters(f: FilterState) {
  return Object.values(f).filter((v) => v !== "").length;
}
