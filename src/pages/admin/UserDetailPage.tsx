import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useCallback, useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { Button } from "@/components/ui/button";
import { useChangeUserRole } from "@/hooks/admin/users/mutations/useChangeUserRole";
import {
  ArrowLeft,
  Mail,
  Calendar,
  ShieldCheck,
  Loader2,
  AlertCircle,
  User,
  Shield,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import useUserDetail from "@/hooks/admin/users/queries/useUserDetail";
import { ChangeRoleModal } from "@/components/ui/changeRoleModal";
import appToast from "@/lib/appToast";

const STATUS_STYLES: Record<string, { pill: string; dot: string }> = {
  active: { pill: "bg-emerald-500/10 text-emerald-600", dot: "bg-emerald-500" },
  inactive: { pill: "bg-zinc-500/10 text-zinc-500", dot: "bg-zinc-400" },
  banned: { pill: "bg-red-500/10 text-red-600", dot: "bg-red-500" },
  pending: { pill: "bg-amber-500/10 text-amber-600", dot: "bg-amber-500" },
};

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  inactive: "Inactive",
  banned: "Banned",
  pending: "Pending",
};

const ROLE_LABELS: Record<string, string> = {
  buyer: "Buyer",
  seller: "Seller",
  admin: "Admin",
  superadmin: "Super Admin",
};

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="text-sm font-medium text-foreground">{value}</span>
  </div>
);

const UserDetailPage = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const passedUser = location.state?.user;

  const {
    data: user,
    isLoading,
    isError,
  } = useUserDetail(userId!, {
    initialData: passedUser,
  });

  const {
    mutateAsync: changeUserRole,
    isPending: isChangingRole,
    error: roleChangeError,
    reset: resetError,
  } = useChangeUserRole();

  const handleChangeRole = useCallback(
    async (newRole: string) => {
      try {
        resetError();
        await changeUserRole({
          userId: userId!,
          newRole: newRole as "buyer" | "admin" | "superadmin",
        });
        appToast({
          title: "Change role",
          description: "User role changed successfully",
        });
      } catch (err) {
        console.error("Failed to change user role:", err);
        appToast({
          title: "Change role",
          description: `Failed to change user role:", ${err}`,
        });
      }
    },
    [userId, changeUserRole, resetError],
  );

  if (isLoading && !passedUser) {
    return (
      <AdminShell>
        <div className="flex items-center justify-center min-h-96">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading user...</p>
          </div>
        </div>
      </AdminShell>
    );
  }

  if (isError || !user) {
    return (
      <AdminShell>
        <div className="flex items-center justify-center min-h-96">
          <div className="space-y-2 text-center">
            <AlertCircle className="mx-auto size-8 text-destructive" />
            <p className="text-sm text-muted-foreground">Failed to load user</p>
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              Go back
            </Button>
          </div>
        </div>
      </AdminShell>
    );
  }

  const style = STATUS_STYLES[user.status] ?? STATUS_STYLES["inactive"];

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" /> Back to users
        </button>

        {/* Profile card */}
        <div className="border rounded-lg border-border bg-card p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-4 flex-1">
              <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 shrink-0">
                <span className="text-2xl font-bold text-primary">
                  {user?.firstName?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-foreground">
                  {user.firstName}
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {user.email}
                </p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${style.pill}`}
                  >
                    <span className={`size-1.5 rounded-full ${style.dot}`} />
                    {STATUS_LABELS[user.status] ?? user.status}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-secondary text-secondary-foreground">
                    <ShieldCheck className="size-3" />
                    {ROLE_LABELS[user.role] ?? user.role}
                  </span>
                </div>
              </div>
            </div>

            {/* Change Role Button */}
            <Button
              onClick={() => setIsModalOpen(true)}
              size="sm"
              className="gap-2 shrink-0"
            >
              <Shield className="size-4" />
              Change Role
            </Button>
          </div>
        </div>

        {/* Details */}
        <div className="border rounded-lg border-border bg-card">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">
              Account Details
            </h3>
          </div>
          <div className="px-6">
            <InfoRow
              label="User ID"
              value={
                <span className="font-mono text-xs text-muted-foreground">
                  {user.id}
                </span>
              }
            />
            <InfoRow
              label="Email"
              value={
                <span className="flex items-center gap-1.5">
                  <Mail className="size-3 text-muted-foreground" />
                  {user.email}
                </span>
              }
            />
            <InfoRow
              label="Role"
              value={
                <span className="flex items-center gap-1.5">
                  <User className="size-3 text-muted-foreground" />
                  {ROLE_LABELS[user.role] ?? user.role}
                </span>
              }
            />
            <InfoRow
              label="Status"
              value={
                <span
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${style.pill}`}
                >
                  <span className={`size-1.5 rounded-full ${style.dot}`} />
                  {STATUS_LABELS[user.status] ?? user.status}
                </span>
              }
            />
            <InfoRow
              label="Joined"
              value={
                <span className="flex items-center gap-1.5">
                  <Calendar className="size-3 text-muted-foreground" />
                  {user?.createdAt
                    ? formatDistanceToNow(new Date(user.createdAt), {
                        addSuffix: true,
                      })
                    : "N/A"}
                </span>
              }
            />
          </div>
        </div>
      </div>

      {/* Change Role Modal */}
      <ChangeRoleModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetError();
        }}
        user={user}
        onConfirm={handleChangeRole}
        isLoading={isChangingRole}
        error={roleChangeError?.message || null}
      />
    </AdminShell>
  );
};

export default UserDetailPage;
