import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Loader2, Shield } from "lucide-react";
import { User } from "@/types/user";


interface ChangeRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onConfirm: (newRole: string) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

const ROLE_OPTIONS = [
  { value: "buyer", label: "Buyer", description: "Can purchase items" },
  { value: "admin", label: "Admin", description: "Can manage users and content" },
  {
    value: "superadmin",
    label: "Super Admin",
    description: "Full system access",
  },
];

const ROLE_COLORS: Record<string, string> = {
  buyer: "text-blue-600 bg-blue-50",
  admin: "text-purple-600 bg-purple-50",
  superadmin: "text-red-600 bg-red-50",
};

export const ChangeRoleModal: React.FC<ChangeRoleModalProps> = ({
  isOpen,
  onClose,
  user,
  onConfirm,
  isLoading = false,
  error,
}) => {
  const [selectedRole, setSelectedRole] = useState<string>(user.role);

  const handleConfirm = async () => {
    if (selectedRole !== user.role) {
      await onConfirm(selectedRole);
      onClose();
    }
  };

  const selectedRoleOption = ROLE_OPTIONS.find((r) => r.value === selectedRole);
  const currentRoleOption = ROLE_OPTIONS.find((r) => r.value === user.role);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Shield className="size-5 text-primary" />
            <DialogTitle>Change User Role</DialogTitle>
          </div>
          <DialogDescription>
            Update the role for <span className="font-semibold text-foreground">{user.firstName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Role Display */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Current Role
            </label>
            <div
              className={`p-3 rounded-lg border border-border ${
                ROLE_COLORS[user.role] || "bg-gray-50"
              }`}
            >
              <p className="font-semibold">{currentRoleOption?.label}</p>
              <p className="text-xs opacity-75">{currentRoleOption?.description}</p>
            </div>
          </div>

          {/* New Role Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              New Role
            </label>
            <Select value={selectedRole} onValueChange={setSelectedRole} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    <div className="flex items-center gap-2">
                      <span>{role.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedRoleOption && selectedRole !== user.role && (
              <div
                className={`p-3 rounded-lg border border-border mt-2 ${
                  ROLE_COLORS[selectedRole] || "bg-gray-50"
                }`}
              >
                <p className="text-sm font-medium">{selectedRoleOption.label}</p>
                <p className="text-xs opacity-75">{selectedRoleOption.description}</p>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="size-4 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Warning Message */}
          {selectedRole !== user.role && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-900">
                Changing the role will update the user's permissions immediately.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || selectedRole === user.role}
            className="gap-2"
          >
            {isLoading && <Loader2 className="size-4 animate-spin" />}
            {isLoading ? "Updating..." : "Change Role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
