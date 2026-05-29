import { AdminShell } from "@/components/AdminShell";
import {
  ChevronRight
} from "lucide-react";

const SettingsPage = () => {
  return (
    <AdminShell>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
          <span>Settings</span>
          <ChevronRight className="size-3" />
        </div>
      </div>
    </AdminShell>
  );
};

export default SettingsPage;
