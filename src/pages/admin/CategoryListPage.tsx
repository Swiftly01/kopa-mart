import { AdminShell } from "@/components/AdminShell";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import Pagination from "@/components/ui/pagintion";
import {
  AlertCircle,
  Eye,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DeleteCategoryModal from "@/components/ui/deleteCategoryModal";
import EditCategoryModal from "@/components/ui/editCategoryModal";
import useGetCategories from "@/hooks/admin/categories/queries/useGetCategories";
import { useDebounce } from "@/hooks/useDebounce";
import { Category } from "@/types/category";
import { ITEMS_PER_PAGE } from "@/lib/utils/config";




const STATUS_STYLES: Record<string, { pill: string; dot: string }> = {
  active: { pill: "bg-emerald-500/10 text-emerald-600", dot: "bg-emerald-500" },
  inactive: { pill: "bg-zinc-500/10 text-zinc-500", dot: "bg-zinc-400" },
};

const CategoryListPage = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = Math.max(1, Number(searchParams.get("page") || "1"));

  const debouncedSearch = useDebounce(search, 350);

  const { data, isLoading, isError, isFetching } = useGetCategories({
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    search: debouncedSearch || undefined,
  });

  const categories = useMemo(() => data?.data ?? [], [data]);

  const totalCount = data?.meta?.totalItems ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;

  // ── Modal state ───────────────────────────────────────────────────────────
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q),
    );
  }, [categories, search]);

 
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setSearchParams({ page: "1" });
  };

  const handlePageChange = (page: number) => {
    setSearchParams({ page: String(page) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  
  if (isError) {
    return (
      <AdminShell>
        <div className="flex items-center justify-center min-h-96">
          <div className="space-y-2 text-center">
            <AlertCircle className="mx-auto size-8 text-destructive" />
            <p className="text-sm text-muted-foreground">
              Failed to load categories
            </p>
          </div>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="space-y-6">
      
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage and review all product categories
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Total count badge — mirrors UsersPage */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-lg">
              <span className="text-sm font-medium text-muted-foreground">
                Total:
              </span>
              <span className="text-lg font-semibold text-foreground">
                {totalCount}
              </span>
            </div>
            <Button
              size="sm"
              onClick={() => navigate("/admin/categories/new")}
            >
              <Plus className="size-4 mr-1.5" />
              New Category
            </Button>
          </div>
        </div>

        {/* ── Search ───────────────────────────────────────────────────── */}
        <div className="relative">
          <Search className="absolute -translate-y-1/2 left-3 top-1/2 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by name or code..."
            className="pl-10 border-0 rounded-lg h-11 bg-secondary hover:bg-secondary/80 focus:bg-background"
          />
        </div>

        {/* ── Content ──────────────────────────────────────────────────── */}
        {isLoading ? (
          <div className="flex items-center justify-center min-h-96">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          </div>
        ) : categories.length === 0 ? (
          <div className="flex items-center justify-center min-h-96">
            <div className="space-y-2 text-center">
              <p className="text-sm font-medium text-foreground">
                No categories
              </p>
              <p className="text-xs text-muted-foreground">
                Create your first category to get started
              </p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center min-h-96">
            <p className="text-sm text-muted-foreground">No results found</p>
          </div>
        ) : (
          <div
            className={`overflow-scroll border rounded-lg border-border bg-card transition-opacity ${
              isFetching ? "opacity-60 pointer-events-none" : "opacity-100"
            }`}
          >
            <table className="w-full">
              <thead className="border-b bg-secondary/50 border-border">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold tracking-wide text-left uppercase text-muted-foreground">
                    Category
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold tracking-wide text-left uppercase text-muted-foreground hidden sm:table-cell">
                    Code
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold tracking-wide text-left uppercase text-muted-foreground hidden md:table-cell">
                    Parent
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold tracking-wide text-left uppercase text-muted-foreground hidden lg:table-cell">
                    Order
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold tracking-wide text-left uppercase text-muted-foreground">
                    Status
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold tracking-wide text-right uppercase text-muted-foreground">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((cat) => {
                  const statusKey = cat.isActive ? "active" : "inactive";
                  const style = STATUS_STYLES[statusKey];

                  return (
                    <tr
                      key={cat.id}
                      className="transition-colors border-b border-border hover:bg-secondary/30"
                    >
                      {/* Name + icon */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 text-xl leading-none">
                            {cat.icon}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {cat.name}
                            </p>
                            {cat.isFeatured && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-600 dark:text-amber-400">
                                <Star className="size-2.5 fill-current" />{" "}
                                Featured
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Code */}
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                          {cat.code}
                        </code>
                      </td>

                      {/* Parent */}
                      <td className="px-6 py-4 hidden md:table-cell">
                        {cat.parent ? (
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <span>{cat.parent.icon}</span>
                            <span>{cat.parent.name}</span>
                          </div>
                        ) : (
                          <span className="text-xs italic text-muted-foreground">
                            Top-level
                          </span>
                        )}
                      </td>

                      {/* Sort order */}
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <span className="text-sm text-muted-foreground">
                          {cat.sortOrder}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${style.pill}`}
                        >
                          <span
                            className={`size-1.5 rounded-full ${style.dot}`}
                          />
                          {cat.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 gap-1 px-3 text-xs hover:bg-primary/10 hover:text-primary"
                            >
                              <MoreHorizontal className="size-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem
                              onClick={() =>
                                navigate(`/admin/categories/${cat.id}`)
                              }
                            >
                              <Eye className="size-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setEditTarget(cat)}
                            >
                              <Pencil className="size-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setDeleteTarget(cat)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="size-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        
        {!isLoading && categories.length > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
              {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of{" "}
              {totalCount} categories
            </span>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      {editTarget && (
        <EditCategoryModal
          category={editTarget}
          open={!!editTarget}
          onClose={() => setEditTarget(null)}
        />
      )}
      {deleteTarget && (
        <DeleteCategoryModal
          category={deleteTarget}
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </AdminShell>
  );
};

export default CategoryListPage;
