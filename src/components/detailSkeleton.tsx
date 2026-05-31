import { Skeleton } from "./ui/skeleton";

export const DetailSkeleton = () => (
  <div className="min-h-screen bg-[#f8f8f6]">
    <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8">
      <div className="space-y-3">
        <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
        <div className="grid grid-cols-4 gap-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-xl" />
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-12 w-full rounded-full" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    </div>
  </div>
);