import { useEffect, useState } from "react";
import { Loader2, Search, X, ClipboardList } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import useSearchAdminUsers from "@/hooks/admin/users/queries/useSearchAdminUsers";
import { AdminUserSummary } from "@/types/adminUser";

interface UserPickerProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

/**
 * Two ways to build the recipient list, since the search-based picker
 * depends on an admin users endpoint whose exact shape we're assuming
 * (see lib/api/adminUsers.ts) — the paste fallback works regardless, so
 * this feature isn't blocked if that assumption turns out wrong.
 */
export default function UserPicker({ selectedIds, onChange }: UserPickerProps) {
  const [mode, setMode] = useState<"search" | "paste">("search");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<AdminUserSummary[]>([]);
  const [pasteText, setPasteText] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data, isLoading, isError } = useSearchAdminUsers(
    debouncedQuery,
    mode === "search" && debouncedQuery.length >= 2,
  );

  const results = (data?.data ?? []).filter(
    (u) => !selectedIds.includes(u.id),
  );

  const addUser = (user: AdminUserSummary) => {
    setSelectedUsers((prev) => [...prev, user]);
    onChange([...selectedIds, user.id]);
    setQuery("");
  };

  const removeUser = (id: string) => {
    setSelectedUsers((prev) => prev.filter((u) => u.id !== id));
    onChange(selectedIds.filter((existingId) => existingId !== id));
  };

  const handlePasteBlur = () => {
    const ids = pasteText
      .split(/[\n,]/)
      .map((id) => id.trim())
      .filter(Boolean);
    onChange(ids);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {selectedIds.length} user(s) selected
        </p>
        <button
          type="button"
          onClick={() => setMode(mode === "search" ? "paste" : "search")}
          className="flex items-center gap-1 text-xs font-medium text-primary hover:opacity-80"
        >
          <ClipboardList className="size-3" />
          {mode === "search" ? "Paste user IDs instead" : "Search users instead"}
        </button>
      </div>

      {mode === "search" ? (
        <>
          {/* Selected chips */}
          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {selectedUsers.map((u) => (
                <span
                  key={u.id}
                  className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-secondary"
                >
                  {u.firstName} {u.lastName}
                  <button
                    type="button"
                    onClick={() => removeUser(u.id)}
                    className="hover:text-destructive"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Search input */}
          <div className="relative">
            <Search className="absolute size-3.5 left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or email (2+ characters)…"
              className="pl-9"
            />
          </div>

          {/* Results dropdown */}
          {debouncedQuery.length >= 2 && (
            <div className="border rounded-lg border-border bg-card max-h-48 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="animate-spin size-4 text-muted-foreground" />
                </div>
              ) : isError ? (
                <p className="p-3 text-xs text-muted-foreground">
                  Couldn't search users — try "Paste user IDs instead".
                </p>
              ) : results.length === 0 ? (
                <p className="p-3 text-xs text-muted-foreground">
                  No matching users
                </p>
              ) : (
                results.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => addUser(u)}
                    className="flex items-center w-full gap-2 p-2 text-left transition-colors hover:bg-secondary/50"
                  >
                    <div className="flex items-center justify-center rounded-full size-7 bg-primary/15 text-primary shrink-0">
                      <span className="text-xs font-semibold">
                        {u.firstName?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">
                        {u.firstName} {u.lastName}
                      </p>
                      <p className="text-xs truncate text-muted-foreground">
                        {u.email}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </>
      ) : (
        <Textarea
          rows={4}
          placeholder={"9f2c1a...\nb7e4d0...\n..."}
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          onBlur={handlePasteBlur}
          className="font-mono text-xs"
        />
      )}
    </div>
  );
}
