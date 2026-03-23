import { useNavigate } from "react-router-dom";
import PageTransition from "@/components/PageTransition";
import MealPlanner from "@/components/MealPlanner";
import { RECIPES, Recipe } from "@/data/recipes";
import { useCloudCustomRecipes } from "@/hooks/useCloudData";
import Navbar from "@/components/Navbar";
import PageSkeleton from "@/components/PageSkeleton";

export default function Planner() {
  const navigate = useNavigate();
  const { customRecipes, loading } = useCloudCustomRecipes();
  const allRecipes: Recipe[] = [...RECIPES, ...customRecipes];

  if (loading) {
    return <PageSkeleton variant="planner" />;
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar
          onLogoClick={() => navigate("/dashboard")}
          onShowFavorites={() => navigate("/favorites")}
          onShowCustomRecipes={() => navigate("/recipes")}
        />
        <MealPlanner
          recipes={allRecipes}
          onClose={() => navigate("/dashboard")}
          onSelectRecipe={(recipe) => navigate(`/recipe/${recipe.id}`)}
        />
      </div>
    </PageTransition>
  );
}
