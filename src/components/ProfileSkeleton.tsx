import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileSkeleton() {
  return (
    <div className="space-y-8">
      {/* Profile Header Skeleton */}
      <div className="bg-card rounded-2xl border border-border p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <Skeleton className="w-24 h-24 rounded-full" />
          <div className="flex-1 space-y-3 text-center sm:text-left">
            <Skeleton className="h-8 w-48 mx-auto sm:mx-0" />
            <Skeleton className="h-4 w-64 mx-auto sm:mx-0" />
            <div className="flex gap-4 justify-center sm:justify-start">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-4">
            <Skeleton className="h-8 w-12 mb-2" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>

      {/* Tabs Skeleton */}
      <div className="flex flex-wrap gap-2 pb-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-10 w-32 rounded-xl" />
        ))}
      </div>

      {/* Content Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-card rounded-xl border border-border overflow-hidden">
            <Skeleton className="aspect-[4/3] w-full" />
            <div className="p-4 space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
