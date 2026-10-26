import { ArrowLeft, Loader2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AdDetailsView from "@/components/ads/AdDetailsView";
import AdStatusBadge from "@/components/ads/AdStatusBadge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import useOwnerAdActions from "@/hooks/listings/mutations/useOwnerAdActions";
import useGetMyListing from "@/hooks/listings/queries/useGetMyListing";
import appToast from "@/lib/appToast";
import { AD_STATUS } from "@/lib/post-ad/adStatus";

// the owner's view of one ad in any status, with what they can do next
export default function MyAdDetail() {
  const navigate = useNavigate();
  const { id = "" } = useParams<{ id: string }>();
  const { data: ad, isLoading, isError } = useGetMyListing(id);
  const { resubmit, pause, remove } = useOwnerAdActions();

  const tell = (title: string) => appToast({ title });
  const fail = () =>
    appToast({ title: "Something went wrong", variant: "destructive" });

  const onDelete = () => {
    if (!window.confirm("Delete this ad? This cannot be undone.")) return;
    remove.mutate(id, {
      onSuccess: () => {
        tell("Ad deleted");
        navigate("/my-ads", { replace: true });
      },
      onError: fail,
    });
  };

  return (
    <div className="max-w-2xl px-4 pt-4 pb-10 mx-auto space-y-4">
      <header className="flex items-center gap-3">
        <button onClick={() => navigate("/my-ads")} aria-label="Back">
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="flex-1 text-lg font-bold">My ad</h1>
        {ad && <AdStatusBadge status={ad.status} />}
      </header>

      {isLoading && <Skeleton className="h-96 rounded-xl" />}
      {isError && (
        <p className="py-16 text-sm text-center text-muted-foreground">
          This ad could not be found.
        </p>
      )}

      {ad && (
        <>
          <div
            className={`p-3 text-sm rounded-xl ${
              ad.status === "rejected"
                ? "bg-destructive/10"
                : "bg-secondary"
            }`}
          >
            <p>{AD_STATUS[ad.status].hint}</p>
            {ad.status === "rejected" && ad.rejectionReason && (
              <p className="mt-1 font-medium">Reason: {ad.rejectionReason}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link to={`/my-ads/${ad.id}/edit`}>Edit</Link>
            </Button>

            {(ad.status === "draft" || ad.status === "rejected") && (
              <Button
                disabled={resubmit.isPending}
                onClick={() =>
                  resubmit.mutate(ad.id, {
                    onSuccess: () =>
                      tell(
                        ad.status === "rejected"
                          ? "Sent to an admin for review"
                          : "Your ad is live",
                      ),
                    onError: fail,
                  })
                }
              >
                {resubmit.isPending && <Loader2 className="animate-spin" />}
                {ad.status === "rejected" ? "Appeal for review" : "Publish ad"}
              </Button>
            )}

            {ad.status === "active" && (
              <>
                <Button asChild variant="outline">
                  <Link to={`/ad/${ad.slug}`}>View public page</Link>
                </Button>
                <Button
                  variant="outline"
                  disabled={pause.isPending}
                  onClick={() =>
                    pause.mutate(ad.id, {
                      onSuccess: () => tell("Ad paused"),
                      onError: fail,
                    })
                  }
                >
                  Pause
                </Button>
              </>
            )}

            {ad.status === "inactive" && (
              <Button
                disabled={resubmit.isPending}
                onClick={() =>
                  resubmit.mutate(ad.id, {
                    onSuccess: () => tell("Ad is live again"),
                    onError: fail,
                  })
                }
              >
                Make live again
              </Button>
            )}

            <Button
              variant="ghost"
              className="text-destructive"
              disabled={remove.isPending}
              onClick={onDelete}
            >
              Delete
            </Button>
          </div>

          <AdDetailsView ad={ad} />
        </>
      )}
    </div>
  );
}
