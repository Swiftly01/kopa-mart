import { AdminShell } from "@/components/AdminShell";
import useDashboardOverview, {
  RecentActivityItem,
} from "@/hooks/admin/useDashboardOverview";
import {
  Users,
  Package,
  ShieldCheck,
  Clock,
  Activity,
  RefreshCw,
  Trash2,
  Plus,
  UserCheck,
  UserPlus,
} from "lucide-react";


const timeAgo = (iso?: string) => {
  if (!iso) return "never";
  const d = Date.now() - new Date(iso).getTime();
  const m = Math.floor(d / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const initials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

// ─── sub-components ──────────────────────────────────────────────────────────

const Stat = ({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
}) => (
  <div className="card-listing p-4">
    <div
      className={`size-10 rounded-xl ${color} flex items-center justify-center mb-2`}
    >
      <Icon className="size-5" />
    </div>
    <p className="text-2xl font-bold">{value}</p>
    <p className="text-xs text-muted-foreground">{label}</p>
  </div>
);

const activityMeta: Record<
  string,
  { icon: React.ElementType; color: string; label: string }
> = {
  LISTING_CREATED: {
    icon: Plus,
    color: "bg-success/15 text-success",
    label: "Created listing",
  },
  LISTING_DELETED: {
    icon: Trash2,
    color: "bg-destructive/15 text-destructive",
    label: "Deleted listing",
  },
  SELLER_APPROVED: {
    icon: UserCheck,
    color: "bg-primary/15 text-primary",
    label: "Seller approved",
  },
  USER_REGISTERED: {
    icon: UserPlus,
    color: "bg-accent/30 text-accent-foreground",
    label: "Registered",
  },
};

const ActivityRow = ({ item }: { item: RecentActivityItem }) => {
  const meta = activityMeta[item.type] ?? {
    icon: Activity,
    color: "bg-secondary text-secondary-foreground",
    label: item.type,
  };
  const Icon = meta.icon;

  return (
    <div className="card-listing p-3 flex items-center gap-3">
      <div
        className={`size-9 rounded-full ${meta.color} flex items-center justify-center shrink-0`}
      >
        <Icon className="size-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{item.description}</p>
        <p className="text-[11px] text-muted-foreground">
          {item.actorName} · {timeAgo(item.createdAt)}
        </p>
      </div>
    </div>
  );
};

// ─── skeleton ────────────────────────────────────────────────────────────────

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse rounded-md bg-muted ${className}`} />
);

const DashboardSkeleton = () => (
  <>
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-24" />
      ))}
    </div>
    <div className="mt-6 space-y-2">
      <Skeleton className="h-4 w-32" />
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-14" />
      ))}
    </div>
  </>
);

// ─── page ────────────────────────────────────────────────────────────────────

const Dashboard = () => {
  const { data, isLoading, error, refetch } = useDashboardOverview();

  return (
    <AdminShell>
      {/* header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-semibold text-base">Overview</h1>
        <button
          onClick={refetch}
          className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
          aria-label="Refresh"
        >
          <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* error banner */}
      {error && (
        <div className="mb-4 rounded-xl bg-destructive/10 text-destructive text-sm px-4 py-3">
          {error}
        </div>
      )}

      {isLoading && !data ? (
        <DashboardSkeleton />
      ) : data ? (
        <>
          {/* stats grid */}
          <div className="grid grid-cols-2 gap-3">
            <Stat
              icon={Users}
              label="Total users"
              value={data.stats.totalUsers}
              color="bg-primary/15 text-primary"
            />
            <Stat
              icon={Package}
              label="Total listings"
              value={data.stats.totalListings}
              color="bg-accent/30 text-accent-foreground"
            />
            <Stat
              icon={ShieldCheck}
              label="Verified sellers"
              value={data.stats.verifiedSellers}
              color="bg-success/15 text-success"
            />
            <Stat
              icon={Clock}
              label="Pending applications"
              value={data.stats.pendingApplications}
              color="bg-warning/15 text-warning"
            />
            <Stat
              icon={Activity}
              label="Active now"
              value={data.stats.activeNow}
              color="bg-success/15 text-success"
            />
          </div>

          {/* currently active */}
          <section className="mt-6">
            <h2 className="font-semibold text-sm mb-2">Currently active</h2>
            {data.currentlyActive.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No users active right now.
              </p>
            ) : (
              <div className="space-y-2">
                {data.currentlyActive.map((u) => (
                  <div
                    key={u.id}
                    className="card-listing p-3 flex items-center gap-3"
                  >
                    <div className="relative size-9 rounded-full bg-secondary flex items-center justify-center font-bold text-xs">
                      {initials(`${u.firstName} ${u.lastName}`)}
                      <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-success ring-2 ring-background" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {u.firstName} {u.lastName}
                      </p>
                      <p className="text-[11px] text-muted-foreground capitalize">
                        {u.role} · active now
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* recent activity */}
          <section className="mt-6">
            <h2 className="font-semibold text-sm mb-2">Recent activity</h2>
            {data.recentActivity.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No recent activity.
              </p>
            ) : (
              <div className="space-y-2">
                {data.recentActivity.map((item) => (
                  <ActivityRow key={item.id} item={item} />
                ))}
              </div>
            )}
          </section>
        </>
      ) : null}
    </AdminShell>
  );
};

export default Dashboard;
