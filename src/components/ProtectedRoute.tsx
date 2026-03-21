import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import PageSkeleton from "@/components/PageSkeleton";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageSkeleton variant="default" />;
  }

  if (!user) {
    // Redirect to auth page but save the intended destination
    const intendedPath = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to="/auth" state={{ from: intendedPath }} replace />;
  }

  return <>{children}</>;
}
