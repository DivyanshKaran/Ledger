import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import PageSkeleton, { PageSkeletonVariant } from "@/components/PageSkeleton";

interface ProtectedRouteProps {
  children: ReactNode;
  skeletonVariant?: PageSkeletonVariant;
}

export default function ProtectedRoute({ children, skeletonVariant = "default" }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageSkeleton variant={skeletonVariant} />;
  }

  if (!user) {
    // Redirect to auth page but save the intended destination
    const intendedPath = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to="/auth" state={{ from: intendedPath }} replace />;
  }

  return <>{children}</>;
}
