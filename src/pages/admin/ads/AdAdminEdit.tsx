import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { AdminShell } from "@/components/AdminShell";
import AdEditForm from "@/components/post-ad/AdEditForm";
import { Skeleton } from "@/components/ui/skeleton";
import useAdminAdActions from "@/hooks/admin/ads/mutations/useAdminAdActions";
import useAdminPhotoActions from "@/hooks/admin/ads/mutations/useAdminPhotoActions";
import useGetAdminAd from "@/hooks/admin/ads/queries/useGetAdminAd";
import useGetListingForm from "@/hooks/listings/queries/useGetListingForm";
import appToast from "@/lib/appToast";

// an admin edits any ad; the ad keeps its current status
export default function AdAdminEdit() {
  const navigate = useNavigate();
  const { id = "" } = useParams<{ id: string }>();
  const { data: ad, isLoading } = useGetAdminAd(id);
  const { data: schema } = useGetListingForm(ad?.category.id ?? "");
  const { update } = useAdminAdActions();
  const photoActions = useAdminPhotoActions(id);

  const save = async (payload: Record<string, unknown>) => {
    await update.mutateAsync({ adId: id, payload });
    appToast({ title: "Ad updated" });
    navigate(`/admin/ads/${id}`);
  };

  return (
    <AdminShell>
      <div className="max-w-2xl mx-auto space-y-4">
        <Link
          to={`/admin/ads/${id}`}
          className="flex items-center gap-1 text-sm text-muted-foreground"
        >
          <ArrowLeft className="size-4" /> Back to review
        </Link>
        <h2 className="text-lg font-semibold">Edit ad</h2>

        {isLoading || !ad || !schema ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((item) => (
              <Skeleton key={item} className="h-12 rounded-md" />
            ))}
          </div>
        ) : (
          <AdEditForm schema={schema} ad={ad} photoActions={photoActions} onSave={save} />
        )}
      </div>
    </AdminShell>
  );
}
