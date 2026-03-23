import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { CurrencyProvider } from "@/hooks/useCurrency";
import ProtectedRoute from "@/components/ProtectedRoute";
import PageSkeleton, { PageSkeletonVariant } from "@/components/PageSkeleton";

const Index = lazy(() => import("./pages/Index"));
const Recipes = lazy(() => import("./pages/Recipes"));
const CreateRecipe = lazy(() => import("./pages/CreateRecipe"));
const Auth = lazy(() => import("./pages/Auth"));
const RecipePage = lazy(() => import("./pages/RecipePage"));
const Profile = lazy(() => import("./pages/Profile"));
const Favorites = lazy(() => import("./pages/Favorites"));
const Authors = lazy(() => import("./pages/Authors"));
const AuthorPage = lazy(() => import("./pages/AuthorPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Planner = lazy(() => import("./pages/Planner"));
const Collections = lazy(() => import("./pages/Collections"));

const queryClient = new QueryClient();

function AnimatedRoutes() {
  const location = useLocation();
  const withSuspense = (element: JSX.Element, variant: PageSkeletonVariant) => (
    <Suspense fallback={<PageSkeleton variant={variant} />}>
      {element}
    </Suspense>
  );

  return (
    <AnimatePresence mode="sync" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/auth" element={withSuspense(<Auth />, "auth")} />
        <Route
          path="/dashboard"
          element={withSuspense(
            <ProtectedRoute skeletonVariant="dashboard">
              <Dashboard />
            </ProtectedRoute>,
            "dashboard"
          )}
        />
        <Route
          path="/planner"
          element={withSuspense(
            <ProtectedRoute skeletonVariant="planner">
              <Planner />
            </ProtectedRoute>,
            "planner"
          )}
        />
        <Route
          path="/collections"
          element={withSuspense(
            <ProtectedRoute skeletonVariant="collections">
              <Collections />
            </ProtectedRoute>,
            "collections"
          )}
        />
        <Route
          path="/recipes"
          element={withSuspense(
            <ProtectedRoute skeletonVariant="recipes">
              <Recipes />
            </ProtectedRoute>,
            "recipes"
          )}
        />
        <Route
          path="/recipe/:id"
          element={withSuspense(
            <ProtectedRoute skeletonVariant="detail">
              <RecipePage />
            </ProtectedRoute>,
            "detail"
          )}
        />
        <Route path="/" element={withSuspense(<Index />, "landing")} />
        <Route
          path="/favorites"
          element={withSuspense(
            <ProtectedRoute skeletonVariant="favorites">
              <Favorites />
            </ProtectedRoute>,
            "favorites"
          )}
        />
        <Route
          path="/authors"
          element={withSuspense(
            <ProtectedRoute skeletonVariant="grid">
              <Authors />
            </ProtectedRoute>,
            "grid"
          )}
        />
        <Route
          path="/author/:userId"
          element={withSuspense(
            <ProtectedRoute skeletonVariant="profile">
              <AuthorPage />
            </ProtectedRoute>,
            "profile"
          )}
        />
        <Route
          path="/create-recipe"
          element={withSuspense(
            <ProtectedRoute skeletonVariant="default">
              <CreateRecipe />
            </ProtectedRoute>,
            "default"
          )}
        />
        <Route
          path="/profile"
          element={withSuspense(
            <ProtectedRoute skeletonVariant="profile">
              <Profile />
            </ProtectedRoute>,
            "profile"
          )}
        />
        <Route path="*" element={withSuspense(<NotFound />, "default")} />
      </Routes>
    </AnimatePresence>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <CurrencyProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <AnimatedRoutes />
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </CurrencyProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
