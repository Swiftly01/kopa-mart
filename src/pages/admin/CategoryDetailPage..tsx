import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminShell } from "@/components/AdminShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Calendar,
  ChevronRight,
  Clock,
  Hash,
  Layers,
  Pencil,
  Star,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils/utils";
import useGetCategory from "@/hooks/admin/categories/queries/useGetCategory";
import EditCategoryModal from "@/components/ui/editCategoryModal";
import DeleteCategoryModal from "@/components/ui/deleteCategoryModal";

const InfoRow = ({
  icon,
  label,
  value,
  mono,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) => (
  <div className="flex items-start gap-3 py-3 border-b last:border-0">
    <span className="mt-0.5 text-muted-foreground shrink-0">{icon}</span>
    <div className="min-w-0 flex-1">
      <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-0.5">
        {label}
      </p>
      <p className={cn("text-sm", mono && "font-mono")}>{value}</p>
    </div>
  </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

const CategoryDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: categoryData, isLoading } = useGetCategory(id!);

  const category = categoryData?.category;

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (isLoading) {
    return (
      <AdminShell>
        <div className="max-w-2xl mx-auto space-y-4 animate-pulse">
          <div className="h-6 w-48 rounded bg-muted" />
          <div className="card-listing rounded-xl p-6 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-10 rounded bg-muted" />
            ))}
          </div>
        </div>
      </AdminShell>
    );
  }

  if (!category) {
    return (
      <AdminShell>
        <div className="max-w-2xl mx-auto text-center py-16">
          <p className="text-muted-foreground">Category not found.</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => navigate(-1)}
          >
            Go back
          </Button>
        </div>
      </AdminShell>
    );
  }
  const formattedDate = (iso?: string | null) => {
    if (!iso) return "—";

    const date = new Date(iso);

    if (isNaN(date.getTime())) {
      return "Invalid date";
    }

    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <AdminShell>
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <button
            onClick={() => navigate("/admin/settings/categories")}
            className="hover:text-foreground transition-colors"
          >
            Categories
          </button>
          <ChevronRight className="size-3" />
          <span className="text-foreground font-medium">{category.name}</span>
        </div>

        {/* Hero card */}
        <div className="card-listing rounded-xl p-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="size-14 rounded-2xl bg-secondary flex items-center justify-center text-3xl shrink-0">
              {category.icon}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-semibold">{category.name}</h1>
                <Badge
                  className={cn(
                    "text-[11px] px-2",
                    category.isActive
                      ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {category.isActive ? "Active" : "Inactive"}
                </Badge>
                {category.isFeatured && (
                  <Badge className="text-[11px] px-2 bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400">
                    <Star className="size-2.5 fill-current mr-1" />
                    Featured
                  </Badge>
                )}
              </div>
              {category.description && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  {category.description}
                </p>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="size-4 mr-1.5" />
              Back
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditOpen(true)}
            >
              <Pencil className="size-4 mr-1.5" />
              Edit
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="size-4 mr-1.5" />
              Delete
            </Button>
          </div>
        </div>

        {/* Details */}
        <div className="card-listing rounded-xl px-5 divide-y">
          <InfoRow
            icon={<Hash className="size-4" />}
            label="Code / Slug"
            value={category.code}
            mono
          />
          <InfoRow
            icon={<Hash className="size-4" />}
            label="ID"
            value={category.id}
            mono
          />
          <InfoRow
            icon={<Layers className="size-4" />}
            label="Parent Category"
            value={
              category.parent ? (
                <button
                  onClick={() =>
                    navigate(
                      `/admin/settings/categories/${category.parent!.id}`,
                    )
                  }
                  className="flex items-center gap-1.5 text-primary hover:underline"
                >
                  <span>{category.parent.icon}</span>
                  {category.parent.name}
                </button>
              ) : (
                <span className="text-muted-foreground italic">
                  Top-level (no parent)
                </span>
              )
            }
          />
          <InfoRow
            icon={<Star className="size-4" />}
            label="Sort Order"
            value={category.sortOrder}
          />
          <InfoRow
            icon={<Calendar className="size-4" />}
            label="Created At"
            value={formattedDate(category.createdAt)}
          />
          <InfoRow
            icon={<Clock className="size-4" />}
            label="Last Updated"
            value={formattedDate(category.updatedAt)}
          />
        </div>

        {/* Subcategories (if any) */}
        {category.children && category.children.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold mb-3">
              Subcategories ({category.children.length})
            </h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {category.children.map((child) => (
                <button
                  key={child.id}
                  onClick={() =>
                    navigate(`/admin/settings/categories/${child.id}`)
                  }
                  className="card-listing rounded-xl p-3 flex items-center gap-2.5 hover:bg-muted/50 transition-colors text-left group"
                >
                  <span className="text-xl">{child.icon}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{child.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {child.code}
                    </p>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {editOpen && (
        <EditCategoryModal
          category={category}
          open={editOpen}
          onClose={() => setEditOpen(false)}
        />
      )}
      {deleteOpen && (
        <DeleteCategoryModal
          category={category}
          open={deleteOpen}
          onClose={() => {
            setDeleteOpen(false);
            navigate("/admin/categories"); // go back after delete
          }}
        />
      )}
    </AdminShell>
  );
};

export default CategoryDetailPage;
