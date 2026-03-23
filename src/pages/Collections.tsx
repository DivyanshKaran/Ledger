import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";
import RecipeCollections from "@/components/RecipeCollections";

export default function Collections() {
  const navigate = useNavigate();

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar
          onLogoClick={() => navigate("/dashboard")}
          onShowFavorites={() => navigate("/favorites")}
          onShowCustomRecipes={() => navigate("/recipes")}
        />

        <div className="max-w-5xl mx-auto px-4 py-6 sm:py-10">
          <div className="mb-6">
            <h1 className="font-display text-2xl sm:text-3xl font-semibold">Collections</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Build personal cookbooks and organize your recipes.
            </p>
          </div>

          <RecipeCollections />
        </div>
      </div>
    </PageTransition>
  );
}
