import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";
import ActivityFeed from "@/components/ActivityFeed";
import { useAuth } from "@/hooks/useAuth";
import { useCloudFavorites, useCloudCustomRecipes } from "@/hooks/useCloudData";
import { useAllRecipes } from "@/hooks/useRecipes";
import { useCollections } from "@/hooks/useCollections";
import { calculateRecipeCost } from "@/data/recipes";
import { useCurrency } from "@/hooks/useCurrency";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PageSkeleton from "@/components/PageSkeleton";

const quickActions = [
  { title: "Plan meals for the week", path: "/planner" },
  { title: "Browse all recipes", path: "/recipes" },
  { title: "Create a new recipe", path: "/create-recipe" },
  { title: "View favorite recipes", path: "/favorites" },
  { title: "Manage collections", path: "/collections" },
  { title: "Update profile settings", path: "/profile" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const { favoriteIds, loading: favoritesLoading } = useCloudFavorites();
  const { customRecipes, loading: customRecipesLoading } = useCloudCustomRecipes();
  const { recipes: allRecipes, loading: recipesLoading } = useAllRecipes();
  const { collections, loading: collectionsLoading } = useCollections();
  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Chef";
  const favoriteRecipes = allRecipes.filter((recipe) => favoriteIds.has(recipe.id)).slice(0, 3);
  const collectionPreview = collections.slice(0, 3);
  const stats = [
    { label: "Saved recipes", value: favoriteIds.size },
    { label: "Custom recipes", value: customRecipes.length },
    { label: "Collections", value: collectionsLoading ? "—" : collections.length },
    { label: "Total recipes", value: allRecipes.length },
  ];

  if (favoritesLoading || customRecipesLoading || recipesLoading || collectionsLoading) {
    return <PageSkeleton variant="dashboard" />;
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar
          onLogoClick={() => navigate("/dashboard")}
          onShowFavorites={() => navigate("/favorites")}
          onShowCustomRecipes={() => navigate("/recipes")}
        />

        <div className="max-w-6xl mx-auto px-4 py-6 sm:py-10 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border/70 rounded-2xl p-6 sm:p-8 shadow-warm"
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[11px] sm:text-xs font-semibold tracking-[0.18em] text-primary/70">
                  DASHBOARD
                </p>
                <h1 className="font-display text-2xl sm:text-3xl font-semibold mt-2">
                  Welcome back, {displayName}
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base mt-2 max-w-2xl">
                  Stay on top of your planning, favorites, and custom creations.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => navigate("/planner")} className="h-11">
                  Open Meal Planner
                </Button>
                <Button variant="outline" onClick={() => navigate("/recipes")} className="h-11">
                  Browse Recipes
                </Button>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-card border border-border/70 rounded-2xl p-4 shadow-warm"
              >
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="font-display text-2xl font-semibold mt-2">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-card border border-border/70 rounded-2xl p-5 sm:p-6 shadow-warm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-lg sm:text-xl font-semibold">
                    Recent Favorites
                  </h2>
                  <Button variant="ghost" size="sm" onClick={() => navigate("/favorites")}>
                    View all
                  </Button>
                </div>
                {favoriteRecipes.length === 0 ? (
                  <div className="text-sm text-muted-foreground">
                    No favorites yet. Browse recipes to start saving your go-to meals.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {favoriteRecipes.map((recipe) => {
                      const totalCost = calculateRecipeCost(
                        recipe.ingredients,
                        recipe.servings,
                        recipe.servings
                      );
                      return (
                        <button
                          key={recipe.id}
                          onClick={() => navigate(`/recipe/${recipe.id}`)}
                          className="text-left border border-border/70 rounded-2xl p-4 hover:border-primary/30 hover:shadow-warm transition-all"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <h3 className="font-display text-base font-semibold">
                              {recipe.title}
                            </h3>
                            <span className="text-sm font-semibold text-primary">
                              {formatPrice(totalCost)}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {recipe.cuisine} · {recipe.totalTime}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {recipe.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="outline">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="bg-card border border-border/70 rounded-2xl p-5 sm:p-6 shadow-warm">
                <h2 className="font-display text-lg sm:text-xl font-semibold mb-3">
                  Quick actions
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {quickActions.map((action) => (
                    <Button
                      key={action.title}
                      variant="outline"
                      className="justify-start h-11"
                      onClick={() => navigate(action.path)}
                    >
                      {action.title}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-card border border-border/70 rounded-2xl p-5 sm:p-6 shadow-warm">
                <h2 className="font-display text-lg sm:text-xl font-semibold mb-3">
                  Collections Snapshot
                </h2>
                {collectionsLoading ? (
                  <p className="text-sm text-muted-foreground">Loading collections…</p>
                ) : collectionPreview.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Create a collection to organize recipes you love.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {collectionPreview.map((collection) => (
                      <div
                        key={collection.id}
                        className="border border-border/70 rounded-xl p-3"
                      >
                        <p className="font-medium">{collection.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {collection.recipe_count || 0} recipes
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-3"
                  onClick={() => navigate("/collections")}
                >
                  Manage collections
                </Button>
              </div>

              <div className="bg-card border border-border/70 rounded-2xl p-5 sm:p-6 shadow-warm">
                <h2 className="font-display text-lg sm:text-xl font-semibold mb-3">
                  Latest Activity
                </h2>
                <ActivityFeed />
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
