import { useState, useRef, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import RecipeBrowser from "@/components/RecipeBrowser";
import PageTransition from "@/components/PageTransition";
import AICookingChat from "@/components/AICookingChat";
import { useCloudFavorites, useCloudCustomRecipes } from "@/hooks/useCloudData";
import { useAllRecipes } from "@/hooks/useRecipes";

export default function Recipes() {
  const navigate = useNavigate();

  const { favoriteIds, toggleFavorite } = useCloudFavorites();
  const { removeCustomRecipe } = useCloudCustomRecipes();
  const { recipes: allRecipes } = useAllRecipes();

  const handleSelectRecipe = (recipe: any) => {
    navigate(`/recipe/${recipe.id}`);
  };

  const handleLogoClick = () => {
    navigate("/");
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar onLogoClick={handleLogoClick} />

        <section className="py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <RecipeBrowser
              recipes={allRecipes}
              onSelectRecipe={handleSelectRecipe}
              favoriteIds={favoriteIds}
              onToggleFavorite={toggleFavorite}
              onDeleteCustomRecipe={removeCustomRecipe}
            />
          </div>
        </section>

        <AICookingChat />
      </div>
    </PageTransition>
  );
}
