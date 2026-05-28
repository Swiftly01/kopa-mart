import { useStore, isActive } from "@/store/useStore";
import { AdminShell } from "@/components/AdminShell";
import { Users, Package, ShieldCheck, Clock, Activity } from "lucide-react";

const Stat = ({ icon: Icon, label, value, color }: any) => (
  <div className="card-listing p-4">
    <div className={`size-10 rounded-xl ${color} flex items-center justify-center mb-2`}><Icon className="size-5"/></div>
    <p className="text-2xl font-bold">{value}</p>
    <p className="text-xs text-muted-foreground">{label}</p>
  </div>
);

const timeAgo = (ts?: number) => {
  if (!ts) return "never";
  const d = Date.now() - ts; const m = Math.floor(d / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
  const dd = Math.floor(h / 24); return `${dd}d ago`;
};

const Dashboard = () => {
  const users = useStore((s) => s.users);
  const listings = useStore((s) => s.listings);
  const pending = users.filter((u) => u.status === "pending").length;
  const verified = users.filter((u) => u.status === "verified").length;
  const activeNow = users.filter((u) => isActive(u.lastSeen));
  const recent = [...users].sort((a, b) => (b.lastSeen ?? 0) - (a.lastSeen ?? 0)).slice(0, 8);

  return (
    <AdminShell>
      <div className="grid grid-cols-2 gap-3">
        <Stat icon={Users} label="Total users" value={users.length} color="bg-primary/15 text-primary"/>
        <Stat icon={Package} label="Total listings" value={listings.length} color="bg-accent/30 text-accent-foreground"/>
        <Stat icon={ShieldCheck} label="Verified sellers" value={verified} color="bg-success/15 text-success"/>
        <Stat icon={Clock} label="Pending applications" value={pending} color="bg-warning/15 text-warning"/>
        <Stat icon={Activity} label="Active now" value={activeNow.length} color="bg-success/15 text-success"/>
      </div>

      <section className="mt-6">
        <h2 className="font-semibold text-sm mb-2">Currently active</h2>
        {activeNow.length === 0 ? (
          <p className="text-xs text-muted-foreground">No users active right now.</p>
        ) : (
          <div className="space-y-2">
            {activeNow.map((u) => (
              <div key={u.id} className="card-listing p-3 flex items-center gap-3">
                <div className="relative size-9 rounded-full bg-secondary flex items-center justify-center font-bold text-xs overflow-hidden">
                  {u.avatar ? <img src={u.avatar} alt="" className="w-full h-full object-cover"/> : u.name[0]}
                  <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-success ring-2 ring-background"/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{u.name}</p>
                  <p className="text-[11px] text-muted-foreground">{u.status === "verified" ? "Seller" : "Buyer"} · active now</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-6">
        <h2 className="font-semibold text-sm mb-2">Recent activity</h2>
        <div className="space-y-2">
          {recent.map((u) => (
            <div key={u.id} className="card-listing p-3 flex items-center gap-3">
              <div className="size-9 rounded-full bg-secondary flex items-center justify-center font-bold text-xs overflow-hidden">
                {u.avatar ? <img src={u.avatar} alt="" className="w-full h-full object-cover"/> : u.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{u.name}</p>
                <p className="text-[11px] text-muted-foreground">Last seen {timeAgo(u.lastSeen)}</p>
              </div>
              {isActive(u.lastSeen) && <span className="text-[10px] text-success font-medium">● active</span>}
            </div>
          ))}
        </div>
      </section>
    </AdminShell>
  );
};

export default Dashboard;
