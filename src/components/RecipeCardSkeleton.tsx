import { Skeleton } from "@/components/ui/skeleton";

export default function RecipeCardSkeleton() {
  return (
    <div className="recipe-card overflow-hidden">
      {/* Image skeleton */}
      <div className="relative aspect-[4/3]">
        <Skeleton className="w-full h-full" />
        {/* Tag skeletons */}
        <div className="absolute top-3 left-3 flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-12 rounded-full" />
        </div>
        {/* Price badge skeleton */}
        <Skeleton className="absolute top-3 right-3 h-8 w-16 rounded-full" />
      </div>
      
      {/* Content skeleton */}
      <div className="p-5 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-12" />
        </div>
      </div>
    </div>
  );
}
