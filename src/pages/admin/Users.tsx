

import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AdminShell } from "@/components/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  ChevronRight,
  Calendar,
  Mail,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Pagination from "@/components/ui/pagintion";
import useAllUsers from "@/hooks/admin/users/queries/useAllUsers";
import { UserRoleEnum } from "@/types/user";

const ITEMS_PER_PAGE = 2;

const ROLE_TABS: { label: string; value: UserRoleEnum | "all" }[] = [
  { label: "Buyers",      value: UserRoleEnum.BUYER },
  { label: "Sellers",     value: UserRoleEnum.SELLER },
  { label: "Admins",      value: UserRoleEnum.ADMIN },
  //{ label: "Super Admins",value: UserRoleEnum.SUPER_ADMIN },
  { label: "All",         value: "all" },
];

const STATUS_STYLES: Record<string, { pill: string; dot: string }> = {
  active:   { pill: "bg-emerald-500/10 text-emerald-600", dot: "bg-emerald-500" },
  inactive: { pill: "bg-zinc-500/10 text-zinc-500",       dot: "bg-zinc-400"    },
  banned:   { pill: "bg-red-500/10 text-red-600",         dot: "bg-red-500"     },
  pending:  { pill: "bg-amber-500/10 text-amber-600",     dot: "bg-amber-500"   },
};

const STATUS_LABELS: Record<string, string> = {
  active:   "Active",
  inactive: "Inactive",
  banned:   "Banned",
  pending:  "Pending",
};

const ROLE_LABELS: Record<string, string> = {
  buyer:      "Buyer",
  seller:     "Seller",
  admin:      "Admin",
  superadmin: "Super Admin",
};

const UsersPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = Math.max(1, Number(searchParams.get("page") || "1"));
  const activeTab = (searchParams.get("role") || UserRoleEnum.BUYER) as UserRoleEnum | "all";

  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, isError, isFetching } = useAllUsers(
    currentPage,
    ITEMS_PER_PAGE,
    activeTab === "all" ? undefined : activeTab,
  );

  const users = useMemo(() => data?.data ?? [], [data]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.firstName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q),
    );
  }, [users, searchQuery]);

  const totalCount = data?.meta?.totalItems ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;

  const handleTabChange = (tab: UserRoleEnum | "all") => {
    setSearchParams({ role: tab, page: "1" });
    setSearchQuery("");
  };

  const handlePageChange = (page: number) => {
    setSearchParams({ role: activeTab, page: String(page) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isError) {
    return (
      <AdminShell>
        <div className="flex items-center justify-center min-h-96">
          <div className="space-y-2 text-center">
            <AlertCircle className="mx-auto size-8 text-destructive" />
            <p className="text-sm text-muted-foreground">Failed to load users</p>
          </div>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Users</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage and review all registered users
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-lg">
            <span className="text-sm font-medium text-muted-foreground">
              {ROLE_TABS.find((t) => t.value === activeTab)?.label ?? activeTab}:
            </span>
            <span className="text-lg font-semibold text-foreground">
              {totalCount}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border">
          <nav className="flex gap-1 -mb-px">
            {ROLE_TABS.map((tab) => {
              const isActive = activeTab === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => handleTabChange(tab.value)}
                  className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    isActive
                      ? "border-foreground text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute -translate-y-1/2 left-3 top-1/2 size-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or user ID..."
            className="pl-10 border-0 rounded-lg h-11 bg-secondary hover:bg-secondary/80 focus:bg-background"
          />
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center min-h-96">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          </div>
        ) : users.length === 0 ? (
          <div className="flex items-center justify-center min-h-96">
            <div className="space-y-2 text-center">
              <p className="text-sm font-medium text-foreground">No users</p>
              <p className="text-xs text-muted-foreground">
                Nothing here for this role
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
              isFetching ? "opacity-60" : "opacity-100"
            }`}
          >
            <table className="w-full">
              <thead className="border-b bg-secondary/50 border-border">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold tracking-wide text-left uppercase text-muted-foreground">
                    Name
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold tracking-wide text-left uppercase text-muted-foreground">
                    Email
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold tracking-wide text-left uppercase text-muted-foreground">
                    Role
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold tracking-wide text-left uppercase text-muted-foreground">
                    Joined
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
                {filtered.map((u) => {
                  const style =
                    STATUS_STYLES[u.status] ?? STATUS_STYLES["inactive"];
                  return (
                    <tr
                      key={u.id}
                      className="transition-colors border-b border-border hover:bg-secondary/30"
                    >
                      {/* Name */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10">
                            <span className="text-sm font-semibold text-primary">
                              {u.firstName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-foreground">
                            {u.firstName}
                          </span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="opacity-50 size-3" />
                          {u.email}
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4">
                        <span className="text-sm text-muted-foreground capitalize">
                          {ROLE_LABELS[u.role] ?? u.role}
                        </span>
                      </td>

                      {/* Joined */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="opacity-50 size-3" />
                          {formatDistanceToNow(new Date(u.createdAt), {
                            addSuffix: true,
                          })}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${style.pill}`}
                        >
                          <span className={`size-1.5 rounded-full ${style.dot}`} />
                          {STATUS_LABELS[u.status] ?? u.status}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            navigate(`/admin/users/${u.id}`, {
                              state: { user: u },
                            })
                          }
                          className="h-8 gap-1 px-3 text-xs hover:bg-primary/10 hover:text-primary"
                        >
                          View <ChevronRight className="size-3" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        {!isLoading && users.length > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
              {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of{" "}
              {totalCount} users
            </span>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </AdminShell>
  );
};

export default UsersPage;