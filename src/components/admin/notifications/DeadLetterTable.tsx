import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Mail,
  MessageSquare,
  RefreshCw,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import useGetDeadLetterNotifications from "@/hooks/admin/notifications/queries/useGetDeadLetterNotifications";
import useRetryDeadLetterNotification from "@/hooks/admin/notifications/mutations/useRetryDeadLetterNotification";
import { NotificationChannel } from "@/types/notification";
import appToast from "@/lib/appToast";
import { useState } from "react";

const CHANNEL_ICON: Record<NotificationChannel, typeof Mail> = {
  [NotificationChannel.EMAIL]: Mail,
  [NotificationChannel.SMS]: MessageSquare,
  [NotificationChannel.PUSH]: Bell,
};

const LOAD_MORE_STEP = 50;

export default function DeadLetterTable() {
  const [limit, setLimit] = useState(LOAD_MORE_STEP);
  const { data, isLoading, isError, isFetching, refetch } =
    useGetDeadLetterNotifications(limit);
  const { mutate: retry, isPending: isRetrying, variables: retryingId } =
    useRetryDeadLetterNotification();

  const rows = data ?? [];

  const handleRetry = (id: string) => {
    retry(id, {
      onSuccess: () =>
        appToast({ title: "Re-queued for delivery" }),
      onError: (err: any) =>
        appToast({
          title: "Retry failed",
          description:
            err?.response?.data?.message ??
            "This notification still has no valid destination.",
          variant: "destructive",
        }),
    });
  };

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="space-y-2 text-center">
          <AlertCircle className="mx-auto size-8 text-destructive" />
          <p className="text-sm text-muted-foreground">
            Failed to load dead-letter queue
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="space-y-2 text-center">
          <CheckCircle2 className="mx-auto size-8 text-success" />
          <p className="text-sm font-medium text-foreground">
            Nothing in the dead-letter queue
          </p>
          <p className="text-xs text-muted-foreground">
            Every notification is being delivered successfully.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        className={`overflow-x-auto border rounded-lg border-border bg-card transition-opacity ${
          isFetching ? "opacity-60" : "opacity-100"
        }`}
      >
        <table className="w-full">
          <thead className="border-b bg-secondary/50 border-border">
            <tr>
              <th className="px-6 py-3 text-xs font-semibold tracking-wide text-left uppercase text-muted-foreground">
                Notification
              </th>
              <th className="px-6 py-3 text-xs font-semibold tracking-wide text-left uppercase text-muted-foreground">
                Recipient
              </th>
              <th className="px-6 py-3 text-xs font-semibold tracking-wide text-left uppercase text-muted-foreground">
                Error
              </th>
              <th className="px-6 py-3 text-xs font-semibold tracking-wide text-left uppercase text-muted-foreground">
                Attempts
              </th>
              <th className="px-6 py-3 text-xs font-semibold tracking-wide text-left uppercase text-muted-foreground">
                Last Updated
              </th>
              <th className="px-6 py-3 text-xs font-semibold tracking-wide text-right uppercase text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const ChannelIcon = CHANNEL_ICON[row.channel];
              const isThisRowRetrying = isRetrying && retryingId === row.id;

              return (
                <tr
                  key={row.id}
                  className="transition-colors border-b border-border hover:bg-secondary/30"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center rounded-lg size-8 bg-secondary shrink-0">
                        <ChannelIcon className="size-3.5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground line-clamp-1">
                          {row.title ?? row.type}
                        </p>
                        <p className="text-xs capitalize text-muted-foreground">
                          {row.channel} · {row.type.replace(/_/g, " ")}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <Link
                      to={`/admin/users/${row.userId}`}
                      className="text-xs font-mono text-primary hover:underline"
                    >
                      {row.userId.slice(0, 8)}…
                    </Link>
                  </td>

                  <td className="px-6 py-4 max-w-xs">
                    <p
                      className="text-xs text-destructive line-clamp-2"
                      title={row.lastError ?? undefined}
                    >
                      {row.lastError ?? "—"}
                    </p>
                  </td>

                  <td className="px-6 py-4">
                    <span className="text-sm text-muted-foreground">
                      {row.attempts}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(row.updatedAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRetry(row.id)}
                        disabled={isRetrying}
                        className="h-8 gap-1 px-3 text-xs hover:bg-primary/10 hover:text-primary"
                      >
                        {isThisRowRetrying ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          <RefreshCw className="size-3" />
                        )}
                        Retry
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {rows.length >= limit && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLimit((l) => l + LOAD_MORE_STEP)}
            className="gap-1 text-xs"
          >
            Load more <ChevronRight className="size-3" />
          </Button>
        </div>
      )}
    </div>
  );
}
