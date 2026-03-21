import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import RecipeDetail from "@/components/RecipeDetail";
import AICookingChat from "@/components/AICookingChat";
import PageTransition from "@/components/PageTransition";
import PageSkeleton from "@/components/PageSkeleton";
import { RECIPES, Recipe } from "@/data/recipes";
import { useAuth } from "@/hooks/useAuth";
import { useCloudFavorites, useCloudCustomRecipes } from "@/hooks/useCloudData";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function RecipePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();

  const { isFavorite, toggleFavorite } = useCloudFavorites();
  const { customRecipes } = useCloudCustomRecipes();

  useEffect(() => {
    const loadRecipe = async () => {
      if (!id) {
        navigate("/");
        return;
      }

      setLoading(true);

      // First check preset recipes
      const presetRecipe = RECIPES.find(r => r.id === id);
      if (presetRecipe) {
        setRecipe(presetRecipe);
        setLoading(false);
        return;
      }

      // Check local custom recipes
      const localCustom = customRecipes.find(r => r.id === id);
      if (localCustom) {
        setRecipe(localCustom);
        setLoading(false);
        return;
      }

      // Try to fetch from database
      try {
        const { data: customRecipe, error } = await supabase
          .from("custom_recipes")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (error) throw error;

        if (customRecipe) {
          setRecipe({
            id: customRecipe.id,
            title: customRecipe.title,
            description: customRecipe.description || "",
            image: customRecipe.image_url || "/recipe-pasta.jpg",
            cuisine: customRecipe.cuisine,
            servings: customRecipe.servings,
            prepTime: "15 min",
            cookTime: "30 min",
            totalTime: "45 min",
            tags: ["Custom", customRecipe.cuisine],
            ingredients: customRecipe.ingredients as unknown as Recipe["ingredients"],
            steps: customRecipe.steps as unknown as Recipe["steps"],
            nutrition: customRecipe.nutrition as unknown as Recipe["nutrition"],
          });
        } else {
          toast.error("Recipe not found");
          navigate("/");
        }
      } catch (error) {
        console.error("Error loading recipe:", error);
        toast.error("Failed to load recipe");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    loadRecipe();
  }, [id, navigate, customRecipes]);

  const handleBack = () => {
    navigate("/");
  };

  if (loading) {
    return <PageSkeleton variant="detail" />;
  }

  if (!recipe) {
    return null;
  }

  const isCustom = recipe.id.startsWith("custom-") || !RECIPES.find(r => r.id === recipe.id);

  return (
    <PageTransition>
      <AnimatePresence mode="wait">
        <RecipeDetail 
          key="detail"
          recipe={recipe} 
          onBack={handleBack}
          isFavorite={isFavorite(recipe.id)}
          onToggleFavorite={() => toggleFavorite(recipe.id)}
          isCustom={isCustom}
          onEditRecipe={() => navigate("/create-recipe")}
        />
      </AnimatePresence>
      <AICookingChat />
    </PageTransition>
  );
}
