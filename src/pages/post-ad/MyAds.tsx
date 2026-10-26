import { ArrowLeft, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import useGetMyListings from "@/hooks/listings/queries/useGetMyListings";
import MyAdRow from "@/components/ads/MyAdRow";

// the ads the signed-in user has posted
export default function MyAds() {
  const navigate = useNavigate();
  const { data, isLoading } = useGetMyListings({ limit: 20 });
  const ads = data?.data ?? [];

  return (
    <div className="max-w-2xl px-4 pt-4 pb-10 mx-auto">
      <header className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)} aria-label="Back">
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="flex-1 text-lg font-bold">My ads</h1>
        <Button asChild size="sm" className="bg-gradient-primary">
          <Link to="/post-ad">
            <Plus /> Post ad
          </Link>
        </Button>
      </header>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <Skeleton key={item} className="h-24 rounded-xl" />
          ))}
        </div>
      )}

      {!isLoading && ads.length === 0 && (
        <div className="py-16 space-y-3 text-center">
          <p className="text-sm text-muted-foreground">
            You have not posted any ads yet.
          </p>
          <Button asChild>
            <Link to="/post-ad">Post your first ad</Link>
          </Button>
        </div>
      )}

      <ul className="space-y-3">
        {ads.map((ad) => (
          <li key={ad.id}>
            <MyAdRow ad={ad} />
          </li>
        ))}
      </ul>
    </div>
  );
}
