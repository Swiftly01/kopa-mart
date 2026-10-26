import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { AdminShell } from "@/components/AdminShell";
import AdDetailsView from "@/components/ads/AdDetailsView";
import AdStatusBadge from "@/components/ads/AdStatusBadge";
import RejectAdDialog from "@/components/admin/ads/RejectAdDialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import useAdminAdActions from "@/hooks/admin/ads/mutations/useAdminAdActions";
import useGetAdminAd from "@/hooks/admin/ads/queries/useGetAdminAd";
import appToast from "@/lib/appToast";

// one ad for the admin: owner details, the full ad, and approve / reject / edit
export default function AdReviewDetail() {
  const { id = "" } = useParams<{ id: string }>();
  const { data: ad, isLoading, isError } = useGetAdminAd(id);
  const { approve, reject } = useAdminAdActions();
  const [rejecting, setRejecting] = useState(false);

  const fail = (error: unknown) =>
    appToast({
      title: "Action failed",
      description:
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message ?? "Please try again",
      variant: "destructive",
    });

  const canApprove = ad?.status === "pending_review" || ad?.status === "rejected";
  const canReject = ad?.status === "pending_review" || ad?.status === "active";

  return (
    <AdminShell>
      <div className="max-w-2xl mx-auto space-y-4">
        <Link to="/admin/ads" className="flex items-center gap-1 text-sm text-muted-foreground">
          <ArrowLeft className="size-4" /> All ads
        </Link>

        {isLoading && <Skeleton className="h-96 rounded-xl" />}
        {isError && <p className="py-12 text-sm text-center">Ad not found.</p>}

        {ad && (
          <>
            <div className="flex items-center justify-between">
              <AdStatusBadge status={ad.status} />
              {ad.reviewedAt && (
                <span className="text-xs text-muted-foreground">
                  Reviewed {new Date(ad.reviewedAt).toLocaleString()}
                </span>
              )}
            </div>

            {ad.seller && (
              <div className="p-3 space-y-0.5 text-sm border rounded-xl">
                <p className="text-xs text-muted-foreground">Posted by</p>
                <p className="font-medium">{ad.seller.name}</p>
                <p>{ad.seller.email}</p>
                <p>{ad.seller.phoneNumber}</p>
              </div>
            )}

            {ad.status === "rejected" && ad.rejectionReason && (
              <p className="p-3 text-sm rounded-xl bg-destructive/10">
                Rejected: {ad.rejectionReason}
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              {canApprove && (
                <Button
                  disabled={approve.isPending}
                  onClick={() =>
                    approve.mutate(ad.id, {
                      onSuccess: () => appToast({ title: "Ad approved and live" }),
                      onError: fail,
                    })
                  }
                >
                  {approve.isPending && <Loader2 className="animate-spin" />}
                  Approve
                </Button>
              )}
              {canReject && (
                <Button variant="destructive" onClick={() => setRejecting(true)}>
                  Reject
                </Button>
              )}
              <Button asChild variant="outline">
                <Link to={`/admin/ads/${ad.id}/edit`}>Edit</Link>
              </Button>
            </div>

            <AdDetailsView ad={ad} />

            <RejectAdDialog
              open={rejecting}
              adTitle={ad.title}
              isLoading={reject.isPending}
              onClose={() => setRejecting(false)}
              onConfirm={(reason) =>
                reject.mutate(
                  { adId: ad.id, reason },
                  {
                    onSuccess: () => {
                      setRejecting(false);
                      appToast({ title: "Ad rejected" });
                    },
                    onError: fail,
                  },
                )
              }
            />
          </>
        )}
      </div>
    </AdminShell>
  );
}
