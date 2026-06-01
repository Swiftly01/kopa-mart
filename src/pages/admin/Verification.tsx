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
import usePendingVerifications from "@/hooks/admin/seller-verification/queries/usePendingVerifications";
import { SellerVerificationStatusEnum } from "@/types/adminSellerVerification";
import { formatDistanceToNow } from "date-fns";
import Pagination from "@/components/ui/pagintion";
import { STATUS_LABELS, STATUS_STYLES } from "@/constant/sellerVerification";
import { ITEMS_PER_PAGE } from "@/lib/utils/config";

interface PendingVerification {
  userId: string;
  email: string;
  firstName: string;
  submittedAt: string;
  status: SellerVerificationStatusEnum;
}


const STATUS_TABS: {
  label: string;
  value: SellerVerificationStatusEnum | "all";
}[] = [
  {
    label: "Pending review",
    value: SellerVerificationStatusEnum.PENDING_REVIEW,
  },
  { label: "Approved", value: SellerVerificationStatusEnum.APPROVED },
  { label: "Rejected", value: SellerVerificationStatusEnum.REJECTED },
  { label: "In progress", value: SellerVerificationStatusEnum.IN_PROGRESS },
  { label: "All", value: "all" },
];

const Verification = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = Math.max(1, Number(searchParams.get("page") || "1"));
  const activeTab = (searchParams.get("status") ||
    SellerVerificationStatusEnum.PENDING_REVIEW) as
    | SellerVerificationStatusEnum
    | "all";

  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, isError, isFetching } = usePendingVerifications(
    currentPage,
    ITEMS_PER_PAGE,
    activeTab === "all" ? undefined : activeTab,
  );

  const verifications: PendingVerification[] = useMemo(
    () => data?.data ?? [],
    [data],
  );

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return verifications;
    return verifications.filter(
      (v) =>
        v.firstName.toLowerCase().includes(q) ||
        v.email.toLowerCase().includes(q) ||
        v.userId.toLowerCase().includes(q),
    );
  }, [verifications, searchQuery]);

  const totalCount = data?.meta?.totalItems ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;

  const handleTabChange = (tab: SellerVerificationStatusEnum | "all") => {
    setSearchParams({ status: tab, page: "1" });
    setSearchQuery("");
  };

  const handlePageChange = (page: number) => {
    setSearchParams({ status: activeTab, page: String(page) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const pendingCount = data?.meta?.totalItems ?? 0;

  if (isError) {
    return (
      <AdminShell>
        <div className="flex items-center justify-center min-h-96">
          <div className="space-y-2 text-center">
            <AlertCircle className="mx-auto size-8 text-destructive" />
            <p className="text-sm text-muted-foreground">
              Failed to load verifications
            </p>
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
            <h1 className="text-2xl font-bold tracking-tight">
              Seller Verification
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Review and approve seller applications
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-lg">
            <span className="text-sm font-medium text-muted-foreground">
              {activeTab}:
            </span>
            <span className="text-lg font-semibold text-foreground">
              {pendingCount}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border">
          <nav className="flex gap-1 -mb-px flex-wrap">
            {STATUS_TABS.map((tab) => {
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
        ) : verifications.length === 0 ? (
          <div className="flex items-center justify-center min-h-96">
            <div className="space-y-2 text-center">
              <p className="text-sm font-medium text-foreground">
                No applications
              </p>
              <p className="text-xs text-muted-foreground">
                Nothing here for this status
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
                    Submitted
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
                {filtered.map((v) => {
                  const style =
                    STATUS_STYLES[v.status] ??
                    STATUS_STYLES[SellerVerificationStatusEnum.PENDING_REVIEW];
                  return (
                    <tr
                      key={v.userId}
                      className="transition-colors border-b border-border hover:bg-secondary/30"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10">
                            <span className="text-sm font-semibold text-primary">
                              {v.firstName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-foreground">
                            {v.firstName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="opacity-50 size-3" />
                          {v.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="opacity-50 size-3" />
                          {formatDistanceToNow(new Date(v.submittedAt), {
                            addSuffix: true,
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${style.pill}`}
                        >
                          <span
                            className={`size-1.5 rounded-full ${style.dot}`}
                          />
                          {STATUS_LABELS[v.status] ?? v.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            navigate(`/admin/seller-verification/${v.userId}`, {
                              state: { verification: v },
                            })
                          }
                          className="h-8 gap-1 px-3 text-xs hover:bg-primary/10 hover:text-primary"
                        >
                          Review <ChevronRight className="size-3" />
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
        {!isLoading && verifications.length > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
              {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of{" "}
              {totalCount} applications
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

export default Verification;
