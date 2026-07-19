import { useSearchParams } from "react-router-dom";
import { AdminShell } from "@/components/AdminShell";
import { AlertTriangle, Send, FlaskConical, Megaphone } from "lucide-react";
import DeadLetterTable from "@/components/admin/notifications/DeadLetterTable";
import SendNotificationForm from "@/components/admin/notifications/SendNotificationForm";
import TestNotificationForm from "@/components/admin/notifications/TestNotificationForm";
import BroadcastForm from "@/components/admin/notifications/BroadcastForm";

type Tab = "dead-letter" | "send" | "broadcast" | "test";

const TABS: { key: Tab; label: string; icon: typeof AlertTriangle }[] = [
  { key: "dead-letter", label: "Dead Letter Queue", icon: AlertTriangle },
  { key: "send", label: "Send Notification", icon: Send },
  { key: "broadcast", label: "Broadcast", icon: Megaphone },
  { key: "test", label: "Test Channels", icon: FlaskConical },
];

const AdminNotifications = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get("tab") as Tab) || "dead-letter";

  const setActiveTab = (tab: Tab) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("tab", tab);
      return next;
    });
  };

  return (
    <AdminShell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor delivery failures, send manual notifications, and verify
            channel configuration
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 border rounded-lg border-border bg-secondary/30 w-fit flex-wrap">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="size-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className={activeTab === "dead-letter" ? "" : "w-full"}>
          {activeTab === "dead-letter" && <DeadLetterTable />}
          {activeTab === "send" && <SendNotificationForm />}
          {activeTab === "broadcast" && <BroadcastForm />}
          {activeTab === "test" && <TestNotificationForm />}
        </div>
      </div>
    </AdminShell>
  );
};

export default AdminNotifications;
