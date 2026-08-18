import { Tag } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { resolveCategoryIcon } from "@/lib/categoryIcons";

interface CategoryIconProps {
  /** The raw `category.icon` value — a react-icons key, a legacy emoji, or empty. */
  icon?: string | null;
  className?: string;
}

/**
 * Renders a category's icon.
 *
 * `category.icon` can be:
 *  - a react-icons key (new categories, chosen via the icon picker)
 *  - a legacy emoji string (categories created before this feature)
 *  - empty / unknown (falls back to a generic tag icon)
 */
export const CategoryIcon = ({ icon, className }: CategoryIconProps) => {
  const Icon = resolveCategoryIcon(icon);

  if (Icon) {
    return <Icon className={cn("size-[1em]", className)} aria-hidden />;
  }

  if (icon) {
    // Legacy emoji / plain text icon — render as-is.
    return <span className={className}>{icon}</span>;
  }

  return <Tag className={cn("size-[1em]", className)} aria-hidden />;
};

export default CategoryIcon;
