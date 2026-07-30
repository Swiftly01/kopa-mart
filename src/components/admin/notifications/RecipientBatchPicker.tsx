import { useEffect, useMemo, useState } from "react";
import {
  Loader2,
  Search,
  History,
  CheckSquare,
  Square,
  XCircle,
  Check,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Pagination from "@/components/ui/pagintion";
import useSearchRecipients from "@/hooks/admin/notifications/queries/useSearchRecipients";
import useActiveBatches from "@/hooks/admin/notifications/queries/useActiveBatches";
import {
  BatchFeature,
  MAX_BATCH_RECIPIENTS,
  RecipientOption,
} from "@/types/adminNotification";
import appToast from "@/lib/appToast";

interface RecipientBatchPickerProps {
  /** Which admin workflow this picker is for — determines whose "already processed" history is shown. */
  feature: BatchFeature;
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

const PAGE_SIZE = 10;

/**
 * Searchable, paginated recipient selector for Send Notification and
 * Broadcast. Both features share this exact component, matching the shared
 * backend workflow (recipient search + a 100-recipient batch cap + a
 * 1-hour "already processed" window).
 */
export default function RecipientBatchPicker({
  feature,
  selectedIds,
  onChange,
}: RecipientBatchPickerProps) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // A new search invalidates whatever page we were on.
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { data, isLoading, isFetching, isError } = useSearchRecipients({
    feature,
    search: debouncedSearch,
    page,
    limit: PAGE_SIZE,
  });

  const { data: activeBatches } = useActiveBatches(feature);

  const users = useMemo(() => data?.data ?? [], [data]);
  const meta = data?.meta;

  // Soonest-expiring active batch drives the countdown — once it clears,
  // the corresponding users become selectable again.
  const soonestExpiry = useMemo(() => {
    if (!activeBatches || activeBatches.length === 0) return null;
    return activeBatches.reduce<number | null>((soonest, batch) => {
      const expiresAt = new Date(batch.expiresAt).getTime();
      return soonest === null || expiresAt < soonest ? expiresAt : soonest;
    }, null);
  }, [activeBatches]);

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!soonestExpiry) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [soonestExpiry]);

  const countdownLabel = useMemo(() => {
    if (!soonestExpiry) return null;
    const diffMs = Math.max(0, soonestExpiry - now);
    const mins = Math.floor(diffMs / 60000);
    const secs = Math.floor((diffMs % 60000) / 1000);
    return `${mins}:${String(secs).padStart(2, "0")}`;
  }, [soonestExpiry, now]);

  const remaining = MAX_BATCH_RECIPIENTS - selectedIds.length;

  const toggleUser = (user: RecipientOption) => {
    if (user.alreadyProcessed) return;

    if (selectedIds.includes(user.id)) {
      onChange(selectedIds.filter((id) => id !== user.id));
      return;
    }

    if (selectedIds.length >= MAX_BATCH_RECIPIENTS) {
      appToast({
        title: `Only ${MAX_BATCH_RECIPIENTS} users can be sent to at a time`,
        description: "Deselect someone else first to add this user.",
        variant: "destructive",
      });
      return;
    }

    onChange([...selectedIds, user.id]);
  };

  const selectableOnPage = users.filter(
    (u) => !u.alreadyProcessed && !selectedIds.includes(u.id),
  );
  const allOnPageSelected =
    users.length > 0 &&
    users.every((u) => u.alreadyProcessed || selectedIds.includes(u.id));

  const handleSelectAllOnPage = () => {
    if (allOnPageSelected) {
      // Toggling back off only deselects this page's users, never touches
      // selections made on other pages.
      const pageIds = new Set(users.map((u) => u.id));
      onChange(selectedIds.filter((id) => !pageIds.has(id)));
      return;
    }

    if (remaining <= 0) {
      appToast({
        title: `Only ${MAX_BATCH_RECIPIENTS} users can be sent to at a time`,
        description: "Remove some selected users before adding more.",
        variant: "destructive",
      });
      return;
    }

    const toAdd = selectableOnPage.slice(0, remaining);
    onChange([...selectedIds, ...toAdd.map((u) => u.id)]);

    if (toAdd.length < selectableOnPage.length) {
      appToast({
        title: `Only added ${toAdd.length} of ${selectableOnPage.length} user(s)`,
        description: `You've reached the ${MAX_BATCH_RECIPIENTS}-recipient limit for this batch.`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-3">
      {/* Summary */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <p className="text-muted-foreground">
          {meta ? `${meta.totalItems} total user(s)` : "Loading users…"}
        </p>
        <p
          className={`font-medium ${
            remaining <= 0 ? "text-destructive" : "text-foreground"
          }`}
        >
          {selectedIds.length} of {MAX_BATCH_RECIPIENTS} selected
          {remaining > 0 ? ` (${remaining} remaining)` : " — limit reached"}
        </p>
      </div>

      {/* Already-processed banner */}
      {meta && meta.processedUserCount > 0 && (
        <div className="flex items-start gap-2 p-3 text-xs border rounded-lg border-warning/30 bg-warning/10 text-warning">
          <History className="size-4 shrink-0 mt-0.5" />
          <p>
            <span className="font-medium">
              {meta.processedUserCount} user(s)
            </span>{" "}
            were already sent to in the last hour — marked "Already sent"
            below and can't be re-selected.
            {countdownLabel && (
              <>
                {" "}
                Clears in <span className="font-mono">{countdownLabel}</span>.
              </>
            )}
          </p>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute size-3.5 left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="pl-9"
        />
      </div>

      {/* Select all on page / clear */}
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleSelectAllOnPage}
          disabled={users.length === 0}
          className="h-7 gap-1.5 px-2 text-xs"
        >
          {allOnPageSelected ? (
            <CheckSquare className="size-3.5" />
          ) : (
            <Square className="size-3.5" />
          )}
          {allOnPageSelected ? "Deselect this page" : "Select all on this page"}
        </Button>

        {selectedIds.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange([])}
            className="h-7 gap-1.5 px-2 text-xs text-muted-foreground"
          >
            <XCircle className="size-3.5" />
            Clear selection
          </Button>
        )}
      </div>

      {/* Results */}
      <div
        className={`border rounded-lg border-border bg-card min-h-[12rem] transition-opacity ${
          isFetching ? "opacity-60" : "opacity-100"
        }`}
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="animate-spin size-4 text-muted-foreground" />
          </div>
        ) : isError ? (
          <p className="p-4 text-xs text-center text-muted-foreground">
            Couldn't load users. Try again.
          </p>
        ) : users.length === 0 ? (
          <p className="p-4 text-xs text-center text-muted-foreground">
            No matching users
          </p>
        ) : (
          <div className="divide-y divide-border">
            {users.map((u) => {
              const isSelected = selectedIds.includes(u.id);
              const disabled = u.alreadyProcessed;
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => toggleUser(u)}
                  disabled={disabled}
                  aria-pressed={isSelected}
                  className={`flex items-center w-full gap-3 p-2.5 text-left transition-colors ${
                    disabled
                      ? "cursor-not-allowed opacity-50"
                      : "hover:bg-secondary/50"
                  }`}
                >
                  {/* Purely decorative checkbox — the row itself is the
                      real control, so this avoids nesting an interactive
                      Radix Checkbox inside a <button>. */}
                  <div
                    className={`flex items-center justify-center size-4 rounded-sm border shrink-0 ${
                      isSelected
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-primary/40"
                    }`}
                  >
                    {isSelected && <Check className="size-3" />}
                  </div>

                  <div className="flex items-center justify-center rounded-full size-7 bg-primary/15 text-primary shrink-0">
                    <span className="text-xs font-semibold">
                      {u.firstName?.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">
                      {u.firstName} {u.lastName}
                    </p>
                    <p className="text-xs truncate text-muted-foreground">
                      {u.email}
                    </p>
                  </div>

                  <Badge
                    variant="outline"
                    className="text-[10px] capitalize shrink-0"
                  >
                    {u.role}
                  </Badge>

                  {disabled && (
                    <Badge className="text-[10px] shrink-0 bg-warning/15 text-warning border-warning/30">
                      Already sent
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex justify-center pt-1">
          <Pagination
            currentPage={meta.currentPage}
            totalPages={meta.totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
