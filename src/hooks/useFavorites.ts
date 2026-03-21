import { useState, useEffect, useCallback } from "react";
import { Recipe } from "@/data/recipes";

const FAVORITES_KEY = "recipecost_favorites";
const CUSTOM_RECIPES_KEY = "recipecost_custom_recipes";

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_KEY);
      return new Set(saved ? JSON.parse(saved) : []);
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favoriteIds]));
  }, [favoriteIds]);

  const toggleFavorite = useCallback((recipeId: string) => {
    setFavoriteIds(prev => {
      const updated = new Set(prev);
      if (updated.has(recipeId)) {
        updated.delete(recipeId);
      } else {
        updated.add(recipeId);
      }
      return updated;
    });
  }, []);

  const isFavorite = useCallback((recipeId: string) => {
    return favoriteIds.has(recipeId);
  }, [favoriteIds]);

  return { favoriteIds, toggleFavorite, isFavorite };
}

export function useCustomRecipes() {
  const [customRecipes, setCustomRecipes] = useState<Recipe[]>(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_RECIPES_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(CUSTOM_RECIPES_KEY, JSON.stringify(customRecipes));
  }, [customRecipes]);

  const addCustomRecipe = useCallback((recipe: Recipe) => {
    setCustomRecipes(prev => {
      const existing = prev.findIndex(r => r.id === recipe.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = recipe;
        return updated;
      }
      return [...prev, recipe];
    });
  }, []);

  const removeCustomRecipe = useCallback((recipeId: string) => {
    setCustomRecipes(prev => prev.filter(r => r.id !== recipeId));
  }, []);

  const getCustomRecipe = useCallback((recipeId: string) => {
    return customRecipes.find(r => r.id === recipeId);
  }, [customRecipes]);

  return { customRecipes, addCustomRecipe, removeCustomRecipe, getCustomRecipe };
}
