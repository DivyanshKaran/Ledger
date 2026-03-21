import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  User, Heart, ChefHat, Clock, Star, Settings,
  Calendar, TrendingUp, BookOpen, Sparkles, ArrowLeft,
  FolderOpen, BarChart3
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCloudFavorites, useCloudCustomRecipes } from "@/hooks/useCloudData";
import { useCookingHistory } from "@/hooks/useCookingHistory";
import { RECIPES as presetRecipes } from "@/data/recipes";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Navbar from "@/components/Navbar";
import RecipeCard from "@/components/RecipeCard";
import PageSkeleton from "@/components/PageSkeleton";
import PageTransition from "@/components/PageTransition";
import RecipeCollections from "@/components/RecipeCollections";
import CostInsights from "@/components/CostInsights";

type TabType = "favorites" | "my-recipes" | "collections" | "history" | "insights" | "recommendations";

export default function Profile() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { favoriteIds, loading: favLoading } = useCloudFavorites();
  const { customRecipes, loading: recipesLoading } = useCloudCustomRecipes();
  const { history, loading: historyLoading } = useCookingHistory();
  const [activeTab, setActiveTab] = useState<TabType>("favorites");

  const isLoading = favLoading || recipesLoading || historyLoading;

  // Get favorite recipes
  const favoriteRecipes = useMemo(() => {
    const favIds = Array.from(favoriteIds);
    return presetRecipes.filter(r => favIds.includes(r.id));
  }, [favoriteIds]);

  // Generate personalized recommendations based on favorites and history
  const recommendations = useMemo(() => {
    const favCuisines = new Set(favoriteRecipes.map(r => r.cuisine));
    const historyRecipeIds = new Set(history.map(h => h.recipe_id));
    
    // Recommend recipes from favorite cuisines that haven't been cooked
    return presetRecipes
      .filter(r => favCuisines.has(r.cuisine) && !historyRecipeIds.has(r.id) && !favoriteIds.has(r.id))
      .slice(0, 6);
  }, [favoriteRecipes, history, favoriteIds]);

  // Stats
  const stats = useMemo(() => ({
    favorites: favoriteIds.size,
    customRecipes: customRecipes.length,
    recipesCooked: history.length,
    avgRating: history.filter(h => h.rating).reduce((acc, h) => acc + (h.rating || 0), 0) / 
               (history.filter(h => h.rating).length || 1)
  }), [favoriteIds, customRecipes, history]);

  const tabs = [
    { id: "favorites" as const, label: "Favorites", icon: Heart, count: stats.favorites },
    { id: "my-recipes" as const, label: "My Recipes", icon: ChefHat, count: stats.customRecipes },
    { id: "collections" as const, label: "Collections", icon: FolderOpen, count: 0 },
    { id: "history" as const, label: "History", icon: Clock, count: stats.recipesCooked },
    { id: "insights" as const, label: "Insights", icon: BarChart3, count: 0 },
    { id: "recommendations" as const, label: "For You", icon: Sparkles, count: recommendations.length },
  ];

  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Chef";
  const initials = displayName.slice(0, 2).toUpperCase();
  const memberSince = user?.created_at ? new Date(user.created_at).toLocaleDateString("en-US", { 
    month: "long", 
    year: "numeric" 
  }) : "";

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getEstimatedCost = (ingredients: any[]) => {
    return ingredients.reduce((sum, ing) => sum + (ing.quantity * ing.pricePerUnit), 0);
  };

  if (isLoading) {
    return <PageSkeleton variant="profile" />;
  }

  return (
    <PageTransition>
    <div className="min-h-screen bg-background">
      <Navbar onLogoClick={() => navigate("/")} />
      
      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Recipes
        </Button>

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-primary/10 via-card to-accent/10 rounded-2xl border border-border p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8"
        >
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Avatar className="w-24 h-24 border-4 border-primary/20 shadow-xl">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-display">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </motion.div>
            
            <div className="flex-1 text-center sm:text-left">
              <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-semibold mb-1">
                {displayName}
              </h1>
              <p className="text-muted-foreground mb-1">{user?.email}</p>
              <div className="flex items-center gap-2 justify-center sm:justify-start text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Member since {memberSince}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" size="sm" className="gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-6 sm:mb-8"
        >
          {[
            { label: "Favorites", value: stats.favorites, icon: Heart, color: "text-rose-500" },
            { label: "My Recipes", value: stats.customRecipes, icon: BookOpen, color: "text-primary" },
            { label: "Cooked", value: stats.recipesCooked, icon: ChefHat, color: "text-amber-500" },
            { label: "Avg Rating", value: stats.avgRating.toFixed(1), icon: Star, color: "text-yellow-500" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              whileHover={{ y: -4, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)" }}
              className="bg-card rounded-xl border border-border p-4 text-center transition-all"
            >
              <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2 ${stat.color}`} />
              <div className="text-xl sm:text-2xl font-semibold">{stat.value}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-thin">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.count > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id ? "bg-primary-foreground/20" : "bg-background"
                  }`}>
                    {tab.count}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "favorites" && (
              <div>
                {favoriteRecipes.length === 0 ? (
                  <EmptyState
                    icon={Heart}
                    title="No favorites yet"
                    description="Start exploring recipes and save your favorites!"
                    action={{ label: "Browse Recipes", onClick: () => navigate("/") }}
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                    {favoriteRecipes.map((recipe, index) => (
                      <motion.div
                        key={recipe.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <RecipeCard
                          title={recipe.title}
                          image={recipe.image}
                          prepTime={recipe.totalTime}
                          servings={recipe.servings}
                          estimatedCost={getEstimatedCost(recipe.ingredients)}
                          tags={recipe.tags}
                          onClick={() => navigate(`/recipe/${recipe.id}`)}
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "my-recipes" && (
              <div>
                {customRecipes.length === 0 ? (
                  <EmptyState
                    icon={ChefHat}
                    title="No custom recipes"
                    description="Create your first recipe and build your collection!"
                    action={{ label: "Create Recipe", onClick: () => navigate("/create-recipe") }}
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                    {customRecipes.map((recipe, index) => (
                      <motion.div
                        key={recipe.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <RecipeCard
                          title={recipe.title}
                          image={recipe.image}
                          prepTime={recipe.totalTime}
                          servings={recipe.servings}
                          estimatedCost={getEstimatedCost(recipe.ingredients)}
                          tags={recipe.tags}
                          onClick={() => navigate(`/recipe/${recipe.id}`)}
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "collections" && (
              <RecipeCollections />
            )}

            {activeTab === "insights" && (
              <CostInsights />
            )}

            {activeTab === "history" && (
              <div>
                {history.length === 0 ? (
                  <EmptyState
                    icon={Clock}
                    title="No cooking history"
                    description="Start cooking recipes to track your culinary journey!"
                    action={{ label: "Find Recipes", onClick: () => navigate("/") }}
                  />
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {history.map((entry, index) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ x: 4 }}
                        className="bg-card rounded-xl border border-border p-3 sm:p-4 flex items-center gap-3 sm:gap-4 cursor-pointer hover:border-primary/30 transition-all"
                        onClick={() => navigate(`/recipe/${entry.recipe_id}`)}
                      >
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <ChefHat className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{entry.recipe_title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(entry.cooked_at).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric"
                            })}
                          </p>
                        </div>
                        {entry.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="text-sm font-medium">{entry.rating}</span>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "recommendations" && (
              <div>
                {recommendations.length === 0 ? (
                  <EmptyState
                    icon={Sparkles}
                    title="No recommendations yet"
                    description="Save some favorites to get personalized recommendations!"
                    action={{ label: "Browse Recipes", onClick: () => navigate("/") }}
                  />
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-6 text-muted-foreground">
                      <TrendingUp className="w-5 h-5" />
                      <span>Based on your favorite cuisines and cooking history</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                      {recommendations.map((recipe, index) => (
                        <motion.div
                          key={recipe.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <RecipeCard
                            title={recipe.title}
                            image={recipe.image}
                            prepTime={recipe.totalTime}
                            servings={recipe.servings}
                            estimatedCost={getEstimatedCost(recipe.ingredients)}
                            tags={[...recipe.tags, "Recommended"]}
                            onClick={() => navigate(`/recipe/${recipe.id}`)}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
    </PageTransition>
  );
}

// Empty State Component
function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action 
}: { 
  icon: any; 
  title: string; 
  description: string; 
  action: { label: string; onClick: () => void } 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-16"
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        className="w-20 h-20 rounded-full bg-muted mx-auto mb-6 flex items-center justify-center"
      >
        <Icon className="w-10 h-10 text-foreground/50" />
      </motion.div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">{description}</p>
      <Button onClick={action.onClick}>{action.label}</Button>
    </motion.div>
  );
}
