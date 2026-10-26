import { ArrowLeft, ChevronRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import CategoryIcon from "@/components/ui/CategoryIcon";
import { Skeleton } from "@/components/ui/skeleton";
import useGetPostableCategories from "@/hooks/listings/queries/useGetPostableCategories";
import type { PostableCategory } from "@/types/listing";

// every category in this branch that accepts ads (the branch itself included)
function collectPostable(category: PostableCategory): PostableCategory[] {
  const nested = category.children.flatMap(collectPostable);
  return category.postable ? [category, ...nested] : nested;
}

// step 1 of posting: "What are you selling?"
export default function ChooseCategory() {
  const navigate = useNavigate();
  const { data: categories, isLoading, isError, refetch } =
    useGetPostableCategories();

  return (
    <div className="max-w-2xl px-4 pt-4 pb-10 mx-auto">
      <header className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)} aria-label="Back">
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="text-lg font-bold">Post new ad</h1>
      </header>

      <p className="mb-4 text-sm text-muted-foreground">Choose a category</p>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <Skeleton key={item} className="h-14 rounded-xl" />
          ))}
        </div>
      )}

      {isError && (
        <div className="py-10 space-y-3 text-center">
          <p className="text-sm text-muted-foreground">
            We could not load the categories.
          </p>
          <Button variant="outline" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      )}

      <div className="space-y-6">
        {categories?.map((group) => (
          <section key={group.id}>
            <h2 className="mb-2 text-xs font-medium uppercase text-muted-foreground">
              {group.name}
            </h2>
            <ul className="space-y-2">
              {collectPostable(group).map((category) => (
                <li key={category.id}>
                  <Link
                    to={`/post-ad/${category.id}`}
                    className="flex items-center gap-3 p-4 card-listing"
                  >
                    <CategoryIcon icon={category.icon} className="text-xl" />
                    <span className="flex-1 text-sm font-medium">
                      {category.name}
                    </span>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
