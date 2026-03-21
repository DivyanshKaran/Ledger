import { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Activity, ChevronDown, ChevronUp } from "lucide-react";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";
import HeroSection from "@/components/HeroSection";
import FeaturedCarousel from "@/components/FeaturedCarousel";
import FeatureHighlights from "@/components/landing/FeatureHighlights";
import StatsBar from "@/components/landing/StatsBar";
import HowItWorks from "@/components/landing/HowItWorks";
import Testimonials from "@/components/landing/Testimonials";
import CTASection from "@/components/landing/CTASection";
import FAQ from "@/components/landing/FAQ";
import MealPlanner from "@/components/MealPlanner";
import GlobalSearch from "@/components/GlobalSearch";
import AICookingChat from "@/components/AICookingChat";
import BackToTop from "@/components/BackToTop";
import ActivityFeed from "@/components/ActivityFeed";
import { RECIPES, Recipe } from "@/data/recipes";
import { useAuth } from "@/hooks/useAuth";
import { useCloudCustomRecipes } from "@/hooks/useCloudData";
import { useAuthors } from "@/hooks/useAuthors";
import { supabase } from "@/integrations/supabase/client";
import { trackError, trackEvent } from "@/lib/telemetry";
import { toast } from "sonner";

type ViewMode = "home" | "planner";


export default function Index() {
  const [viewMode, setViewMode] = useState<ViewMode>("home");
  const [searchOpen, setSearchOpen] = useState(false);
  const [showMobileActivity, setShowMobileActivity] = useState(false);
  const recipeSectionRef = useRef<HTMLDivElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const { user } = useAuth();
   const { authors } = useAuthors();

  const { customRecipes } = useCloudCustomRecipes();

  // Combine built-in and custom recipes
  const allRecipes = [...RECIPES, ...customRecipes];

  const loadSharedRecipe = useCallback(async (shareToken: string) => {
    const shareCode = shareToken.split(".", 1)[0] || "unknown";
    try {
      trackEvent("shared_recipe_load_start", { shareCode });
      const sharedRecipeUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/shared-recipe`;
      const sharedResponse = await fetch(sharedRecipeUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({
          shareToken,
        }),
      });
      const sharedPayload = await sharedResponse.json().catch(() => ({})) as {
        error?: string;
        shareCode?: string;
        recipeId?: string | null;
        presetRecipeId?: string | null;
      };

      if (!sharedResponse.ok) {
        if (sharedResponse.status === 404) {
          toast.error("Shared recipe not found");
          setSearchParams({});
          return;
        }
        throw new Error(sharedPayload.error || `Shared recipe request failed (${sharedResponse.status})`);
      }

      if (!sharedPayload.recipeId && !sharedPayload.presetRecipeId) {
        toast.error("Shared recipe not found");
        setSearchParams({});
        return;
      }

      // Find the recipe
      let recipe: Recipe | undefined;

      if (sharedPayload.presetRecipeId) {
        recipe = RECIPES.find(r => r.id === sharedPayload.presetRecipeId);
      } else if (sharedPayload.recipeId) {
        // Fetch custom recipe
        const { data: customRecipe } = await supabase
          .from("custom_recipes")
          .select("*")
          .eq("id", sharedPayload.recipeId)
          .maybeSingle();

        if (customRecipe) {
          recipe = {
            id: customRecipe.id,
            title: customRecipe.title,
            description: customRecipe.description || "",
            image: customRecipe.image_url || "/recipe-pasta.jpg",
            cuisine: customRecipe.cuisine,
            servings: customRecipe.servings,
            prepTime: "15 min",
            cookTime: "30 min",
            totalTime: "45 min",
            tags: ["Shared", customRecipe.cuisine],
            ingredients: customRecipe.ingredients as unknown as Recipe["ingredients"],
            steps: customRecipe.steps as unknown as Recipe["steps"],
            nutrition: customRecipe.nutrition as unknown as Recipe["nutrition"],
          };
        }
      }

      if (recipe) {
        navigate(`/recipe/${recipe.id}`);
        toast.success("Viewing shared recipe!");
        trackEvent("shared_recipe_load_success", { shareCode, recipeId: recipe.id });
      } else {
        toast.error("Recipe not found");
        trackError("shared_recipe_missing_recipe", new Error("Recipe not found"), { shareCode });
      }

      // Clear the share param
      setSearchParams({});
    } catch (error) {
      console.error("Error loading shared recipe:", error);
      trackError("shared_recipe_load_error", error, { shareCode });
      toast.error("Failed to load shared recipe");
      setSearchParams({});
    }
  }, [navigate, setSearchParams]);

  // Handle shared recipe links
  useEffect(() => {
    const shareToken = searchParams.get("share");
    if (shareToken) {
      loadSharedRecipe(shareToken);
    }
  }, [loadSharedRecipe, searchParams]);

  const handleGetStarted = () => {
    navigate("/recipes");
  };

  const handleSelectRecipe = (recipe: Recipe) => {
    navigate(`/recipe/${recipe.id}`);
  };

  const handleLogoClick = () => {
    setViewMode("home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenPlanner = () => {
    setViewMode("planner");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleClosePlanner = () => {
    setViewMode("home");
  };

  const handleShowFavorites = () => {
     navigate("/favorites");
  };

  const handleShowCustomRecipes = () => {
    recipeSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

   // Keyboard shortcut for search
   useEffect(() => {
     const handleKeyDown = (e: KeyboardEvent) => {
       if ((e.metaKey || e.ctrlKey) && e.key === "k") {
         e.preventDefault();
         setSearchOpen(true);
       }
       if (e.key === "Escape") {
         setSearchOpen(false);
       }
     };

     window.addEventListener("keydown", handleKeyDown);
     return () => window.removeEventListener("keydown", handleKeyDown);
   }, []);

  return (
      <PageTransition>
      <>
        {/* Global Search Modal */}
       <AnimatePresence>
         {searchOpen && (
           <GlobalSearch
             recipes={allRecipes}
             authors={authors}
             isOpen={searchOpen}
             onClose={() => setSearchOpen(false)}
           />
         )}
       </AnimatePresence>

       <AnimatePresence mode="wait">
      {viewMode === "planner" ? (
        <MealPlanner
          key="planner"
          recipes={allRecipes}
          onClose={handleClosePlanner}
          onSelectRecipe={handleSelectRecipe}
        />
      ) : (
        <div key="home" className="min-h-screen bg-background">
          <Navbar 
            onLogoClick={handleLogoClick}
            onOpenPlanner={handleOpenPlanner}
            onShowFavorites={handleShowFavorites}
            onShowCustomRecipes={handleShowCustomRecipes}
             onOpenSearch={() => setSearchOpen(true)}
          />
          <HeroSection onGetStarted={handleGetStarted} />
          
           {/* Featured Recipe Carousel */}
           <FeaturedCarousel 
             recipes={allRecipes}
             onSelectRecipe={handleSelectRecipe}
            />

            {/* Landing Page Sections */}
            <StatsBar />
            <FeatureHighlights />
            <HowItWorks />
            <Testimonials />

             {/* Activity Feed Section */}
            <section className="py-8 px-4 sm:px-6 lg:px-8">
              <div className="max-w-4xl mx-auto">
                {/* Mobile Activity Feed Toggle */}
                <div className="lg:hidden mb-6">
                  <button
                    onClick={() => setShowMobileActivity(!showMobileActivity)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-primary" />
                      <span className="font-display text-sm font-semibold">Activity Feed</span>
                    </div>
                    {showMobileActivity ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                  <AnimatePresence>
                    {showMobileActivity && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden mt-3"
                      >
                        <div className="bg-card rounded-xl border border-border overflow-hidden max-h-[400px] overflow-y-auto">
                          <ActivityFeed />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Desktop Activity Feed */}
                <div className="hidden lg:block">
                  <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" /> Activity Feed
                  </h3>
                  <div className="bg-card rounded-xl border border-border overflow-hidden">
                    <ActivityFeed />
                  </div>
                </div>
              </div>
            </section>

            {/* FAQ */}
            <FAQ />

            {/* Call to Action */}
            <CTASection />
          
            {/* Footer */}
            <footer className="py-12 sm:py-16 px-4 border-t border-border bg-card/30">
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                      <span className="text-primary-foreground font-bold text-lg font-display">L</span>
                    </div>
                    <span className="font-display text-lg sm:text-xl font-semibold text-primary">
                      Ledger
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground text-center md:text-right">
                    Your kitchen companion • Calculate costs • Plan meals • Cook with confidence
                    {user && " • Synced across your devices"}
                  </p>
                </div>
                <div className="mt-8 pt-6 border-t border-border/50 text-center">
                  <p className="text-xs text-muted-foreground">
                    © {new Date().getFullYear()} Ledger. Crafted with care for home cooks everywhere.
                  </p>
                </div>
              </div>
            </footer>
        </div>
      )}
     </AnimatePresence>

     {/* AI Cooking Chat Widget */}
     <AICookingChat />
     <BackToTop />
     </>
     </PageTransition>
  );
}
