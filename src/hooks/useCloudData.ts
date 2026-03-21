import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Recipe, RecipeIngredient, RecipeStep, NutritionInfo } from "@/data/recipes";
import { useAuth } from "./useAuth";
import { Json } from "@/integrations/supabase/types";

// Helper to convert Json to typed arrays
function parseIngredients(json: Json): RecipeIngredient[] {
  if (!Array.isArray(json)) return [];
  return json as unknown as RecipeIngredient[];
}

function parseSteps(json: Json): RecipeStep[] {
  if (!Array.isArray(json)) return [];
  return json as unknown as RecipeStep[];
}

function parseNutrition(json: Json | null): NutritionInfo {
  if (!json || typeof json !== 'object') {
    return { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 };
  }
  return json as unknown as NutritionInfo;
}

export function useCloudFavorites() {
  const { user } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Fetch favorites from cloud
  useEffect(() => {
    if (!user) {
      setFavoriteIds(new Set());
      setLoading(false);
      return;
    }

    const fetchFavorites = async () => {
      const { data, error } = await supabase
        .from("user_favorites")
        .select("recipe_id")
        .eq("user_id", user.id);

      if (!error && data) {
        setFavoriteIds(new Set(data.map(f => f.recipe_id)));
      }
      setLoading(false);
    };

    fetchFavorites();
  }, [user]);

  const toggleFavorite = useCallback(async (recipeId: string) => {
    if (!user) return;

    const isFav = favoriteIds.has(recipeId);
    
    // Optimistic update
    setFavoriteIds(prev => {
      const updated = new Set(prev);
      if (isFav) {
        updated.delete(recipeId);
      } else {
        updated.add(recipeId);
      }
      return updated;
    });

    if (isFav) {
      await supabase
        .from("user_favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("recipe_id", recipeId);
    } else {
      await supabase
        .from("user_favorites")
        .insert({ user_id: user.id, recipe_id: recipeId });
    }
  }, [user, favoriteIds]);

  const isFavorite = useCallback((recipeId: string) => {
    return favoriteIds.has(recipeId);
  }, [favoriteIds]);

  return { favoriteIds, toggleFavorite, isFavorite, loading };
}

export function useCloudCustomRecipes() {
  const { user } = useAuth();
  const [customRecipes, setCustomRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setCustomRecipes([]);
      setLoading(false);
      return;
    }

    const fetchRecipes = async () => {
      const { data, error } = await supabase
        .from("custom_recipes")
        .select("*")
        .eq("user_id", user.id);

      if (!error && data) {
        const recipes: Recipe[] = data.map(r => ({
          id: r.id,
          title: r.title,
          description: r.description || "",
          image: r.image_url || "/recipe-pasta.jpg",
          cuisine: r.cuisine,
          servings: r.servings,
          prepTime: `${r.prep_time ?? 15} min`,
          cookTime: `${r.cook_time ?? 30} min`,
          totalTime: `${(r.prep_time ?? 15) + (r.cook_time ?? 30)} min`,
          tags: ["Custom", r.cuisine],
          ingredients: parseIngredients(r.ingredients),
          steps: parseSteps(r.steps),
          nutrition: parseNutrition(r.nutrition),
        }));
        setCustomRecipes(recipes);
      }
      setLoading(false);
    };

    fetchRecipes();
  }, [user]);

  const addCustomRecipe = useCallback(async (recipe: Recipe) => {
    if (!user) return;

    const recipeData = {
      user_id: user.id,
      title: recipe.title,
      description: recipe.description,
      cuisine: recipe.cuisine,
      servings: recipe.servings,
      image_url: recipe.image,
      prep_time: parseInt(recipe.prepTime) || 15,
      cook_time: parseInt(recipe.cookTime) || 30,
      ingredients: recipe.ingredients as unknown as Json,
      steps: recipe.steps as unknown as Json,
      nutrition: recipe.nutrition as unknown as Json,
    };

    // Check if updating existing recipe
    const existingIndex = customRecipes.findIndex(r => r.id === recipe.id);
    
    if (existingIndex >= 0 && !recipe.id.startsWith("custom-")) {
      // Update existing
      const { error } = await supabase
        .from("custom_recipes")
        .update(recipeData)
        .eq("id", recipe.id);

      if (!error) {
        setCustomRecipes(prev => {
          const updated = [...prev];
          updated[existingIndex] = recipe;
          return updated;
        });
      }
    } else {
      // Insert new
      const { data, error } = await supabase
        .from("custom_recipes")
        .insert(recipeData)
        .select()
        .single();

      if (!error && data) {
        const newRecipe: Recipe = {
          ...recipe,
          id: data.id,
        };
        setCustomRecipes(prev => [...prev, newRecipe]);
      }
    }
  }, [user, customRecipes]);

  const removeCustomRecipe = useCallback(async (recipeId: string) => {
    if (!user) return;

    await supabase
      .from("custom_recipes")
      .delete()
      .eq("id", recipeId);

    setCustomRecipes(prev => prev.filter(r => r.id !== recipeId));
  }, [user]);

  const getCustomRecipe = useCallback((recipeId: string) => {
    return customRecipes.find(r => r.id === recipeId);
  }, [customRecipes]);

  return { customRecipes, addCustomRecipe, removeCustomRecipe, getCustomRecipe, loading };
}

export function useIngredientPrices() {
  const { user } = useAuth();
  const [prices, setPrices] = useState<Map<string, { price: number; unit: string }>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setPrices(new Map());
      setLoading(false);
      return;
    }

    const fetchPrices = async () => {
      const { data, error } = await supabase
        .from("user_ingredient_prices")
        .select("*")
        .eq("user_id", user.id);

      if (!error && data) {
        const priceMap = new Map<string, { price: number; unit: string }>();
        data.forEach(p => {
          priceMap.set(p.ingredient_name.toLowerCase(), {
            price: Number(p.price_per_unit),
            unit: p.unit,
          });
        });
        setPrices(priceMap);
      }
      setLoading(false);
    };

    fetchPrices();
  }, [user]);

  const updatePrice = useCallback(async (ingredientName: string, pricePerUnit: number, unit: string) => {
    if (!user) return;

    const key = ingredientName.toLowerCase();
    
    // Optimistic update
    setPrices(prev => {
      const updated = new Map(prev);
      updated.set(key, { price: pricePerUnit, unit });
      return updated;
    });

    // Upsert to database
    await supabase
      .from("user_ingredient_prices")
      .upsert({
        user_id: user.id,
        ingredient_name: ingredientName,
        price_per_unit: pricePerUnit,
        unit,
      }, {
        onConflict: "user_id,ingredient_name",
      });
  }, [user]);

  const getPrice = useCallback((ingredientName: string, defaultPrice: number) => {
    const customPrice = prices.get(ingredientName.toLowerCase());
    return customPrice?.price ?? defaultPrice;
  }, [prices]);

  return { prices, updatePrice, getPrice, loading };
}
