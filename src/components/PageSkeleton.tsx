import { Skeleton } from "@/components/ui/skeleton";
import RecipeCardSkeleton from "@/components/RecipeCardSkeleton";

export type PageSkeletonVariant =
  | "default"
  | "detail"
  | "grid"
  | "profile"
  | "landing"
  | "dashboard"
  | "recipes"
  | "favorites"
  | "collections"
  | "planner"
  | "auth";

interface PageSkeletonProps {
  variant?: PageSkeletonVariant;
}

export default function PageSkeleton({ variant = "default" }: PageSkeletonProps) {
  if (variant === "landing") {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-16" />
        <div className="max-w-7xl mx-auto px-4 py-10 space-y-10">
          <div className="grid gap-8 lg:grid-cols-2 items-center">
            <div className="space-y-4">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex flex-wrap gap-3">
                <Skeleton className="h-11 w-36" />
                <Skeleton className="h-11 w-32" />
              </div>
            </div>
            <Skeleton className="aspect-[4/3] w-full rounded-3xl" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-2xl border border-border p-4 space-y-2">
                <Skeleton className="h-8 w-10" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-2xl border border-border p-5 space-y-3">
                <Skeleton className="h-8 w-12" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (variant === "dashboard") {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-16" />
        <div className="max-w-6xl mx-auto px-4 py-6 sm:py-10 space-y-8">
          <div className="bg-card border border-border/70 rounded-2xl p-6 sm:p-8">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-64 mt-3" />
            <Skeleton className="h-4 w-80 mt-2" />
            <div className="mt-4 flex flex-wrap gap-2">
              <Skeleton className="h-11 w-40" />
              <Skeleton className="h-11 w-36" />
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-card border border-border/70 rounded-2xl p-4 space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-card border border-border/70 rounded-2xl p-5 sm:p-6 space-y-4">
                <Skeleton className="h-5 w-40" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="rounded-2xl border border-border/70 p-4 space-y-2">
                      <Skeleton className="h-5 w-2/3" />
                      <Skeleton className="h-3 w-1/2" />
                      <div className="flex gap-2 mt-2">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-5 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card border border-border/70 rounded-2xl p-5 sm:p-6 space-y-4">
                <Skeleton className="h-5 w-36" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-11 w-full" />
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-card border border-border/70 rounded-2xl p-5 sm:p-6 space-y-3">
                <Skeleton className="h-5 w-44" />
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-xl border border-border/70 p-3 space-y-1">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                ))}
              </div>

              <div className="bg-card border border-border/70 rounded-2xl p-5 sm:p-6 space-y-3">
                <Skeleton className="h-5 w-36" />
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-3 w-3/4" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "recipes") {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-16" />
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
          <div className="text-center space-y-3">
            <Skeleton className="h-9 w-56 mx-auto" />
            <Skeleton className="h-4 w-80 mx-auto" />
          </div>

          <div className="bg-card/50 rounded-2xl border border-border p-4 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Skeleton className="h-12 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-12 w-12" />
                <Skeleton className="h-12 w-12" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-8 w-20" />
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-8 w-24" />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <RecipeCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (variant === "favorites") {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-16" />
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-44" />
            <Skeleton className="h-4 w-32" />
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <RecipeCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (variant === "collections") {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-16" />
        <div className="max-w-5xl mx-auto px-4 py-6 sm:py-10 space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-64" />
          </div>

          <Skeleton className="h-10 w-40" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-4 space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-14" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (variant === "planner") {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-16" />
        <div className="max-w-6xl mx-auto px-4 py-6 sm:py-10 space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-10 w-32" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-3 space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>

          <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
            <Skeleton className="h-5 w-44" />
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (variant === "auth") {
    return (
      <div className="min-h-screen bg-background grid lg:grid-cols-2">
        <div className="hidden lg:flex flex-col justify-center bg-muted/30 p-12 space-y-6">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-4 w-3/4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center px-4 py-10">
          <div className="w-full max-w-md space-y-4">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "profile") {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-16" />
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
          <div className="bg-card rounded-2xl border border-border p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <Skeleton className="w-24 h-24 rounded-full" />
              <div className="flex-1 space-y-3 text-center sm:text-left">
                <Skeleton className="h-8 w-48 mx-auto sm:mx-0" />
                <Skeleton className="h-4 w-64 mx-auto sm:mx-0" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="aspect-[4/3] rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (variant === "detail") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <div className="w-full max-w-3xl space-y-6">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="aspect-video w-full rounded-2xl" />
          <Skeleton className="h-10 w-3/4" />
          <div className="flex gap-4">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-20" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (variant === "grid") {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-16" />
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-4 w-64" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[4/3] w-full rounded-xl" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Default
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="w-full max-w-md space-y-4">
        <Skeleton className="h-12 w-48 mx-auto" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4 mx-auto" />
        <div className="pt-8 space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
}
