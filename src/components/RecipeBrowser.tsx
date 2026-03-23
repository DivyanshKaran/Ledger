import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search, Clock, Users, Heart, Trash2, Star, Grid3X3, LayoutList, ChefHat, Zap, Trophy, GitCompareArrows } from "lucide-react";
import { Recipe, calculateRecipeCost, DifficultyLevel, RecipeCategory } from "@/data/recipes";
import { useCurrency } from "@/hooks/useCurrency";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import DietaryFilters from "./DietaryFilters";
import RecipeComparison from "./RecipeComparison";

// Import images dynamically using eager loading
const imageModules = import.meta.glob<{ default: string }>('@/assets/recipe-*.jpg', { eager: true });

const getImageUrl = (imagePath: string): string => {
  const filename = imagePath.split('/').pop();
  const key = `/src/assets/${filename}`;
  return imageModules[key]?.default || imagePath;
};

const CUISINES = ["All", "Favorites", "Custom", "Italian", "Indian", "American", "Mexican", "Japanese", "Thai"];
const DIFFICULTIES: (DifficultyLevel | "All")[] = ["All", "Easy", "Medium", "Hard"];
const CATEGORIES: (RecipeCategory | "All")[] = ["All", "Quick & Easy", "Comfort Food", "Healthy", "Gourmet", "Budget Friendly", "Family Meals"];

const getDifficultyColor = (difficulty: DifficultyLevel): string => {
  switch (difficulty) {
    case "Easy": return "bg-green-500/10 text-green-600 border-green-500/20";
    case "Medium": return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
    case "Hard": return "bg-red-500/10 text-red-600 border-red-500/20";
    default: return "bg-muted text-muted-foreground";
  }
};

const getDifficultyIcon = (difficulty: DifficultyLevel) => {
  switch (difficulty) {
    case "Easy": return <Zap className="w-3 h-3" />;
    case "Medium": return <ChefHat className="w-3 h-3" />;
    case "Hard": return <Trophy className="w-3 h-3" />;
    default: return null;
  }
};

interface RecipeBrowserProps {
  recipes: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
  favoriteIds: Set<string>;
  onToggleFavorite: (recipeId: string) => void;
  onDeleteCustomRecipe?: (recipeId: string) => void;
}

export default function RecipeBrowser({ 
  recipes, 
  onSelectRecipe, 
  favoriteIds, 
  onToggleFavorite,
  onDeleteCustomRecipe 
}: RecipeBrowserProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | "All">("All");
  const [selectedCategory, setSelectedCategory] = useState<RecipeCategory | "All">("All");
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [compareIds, setCompareIds] = useState<Set<string>>(new Set());
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchesCuisine = true;
      if (selectedCuisine === "Favorites") {
        matchesCuisine = favoriteIds.has(recipe.id);
      } else if (selectedCuisine === "Custom") {
        matchesCuisine = recipe.id.startsWith("custom-");
      } else if (selectedCuisine !== "All") {
        matchesCuisine = recipe.cuisine === selectedCuisine;
      }

      const matchesDifficulty = selectedDifficulty === "All" || recipe.difficulty === selectedDifficulty;
      const matchesCategory = selectedCategory === "All" || recipe.category === selectedCategory;

      // Dietary filter: check tags for dietary keywords
      const matchesDietary = selectedDietary.length === 0 || selectedDietary.every(tag =>
        recipe.tags.some(t => t.toLowerCase().includes(tag.toLowerCase()))
      );
      
      return matchesSearch && matchesCuisine && matchesDifficulty && matchesCategory && matchesDietary;
    });
  }, [recipes, searchTerm, selectedCuisine, selectedDifficulty, selectedCategory, selectedDietary, favoriteIds]);

  const compareRecipes = useMemo(() => {
    return recipes.filter(r => compareIds.has(r.id));
  }, [recipes, compareIds]);

  const toggleCompare = (recipeId: string) => {
    setCompareIds(prev => {
      const next = new Set(prev);
      if (next.has(recipeId)) {
        next.delete(recipeId);
      } else if (next.size < 3) {
        next.add(recipeId);
      }
      return next;
    });
  };

  const handleDelete = (e: React.MouseEvent, recipeId: string) => {
    e.stopPropagation();
    if (onDeleteCustomRecipe && confirm("Delete this custom recipe?")) {
      onDeleteCustomRecipe(recipeId);
    }
  };

  const handleRecipeClick = (recipe: Recipe) => {
    navigate(`/recipe/${recipe.id}`);
  };

  return (
    <section className="py-8 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold mb-2 sm:mb-4">
            Discover Recipes
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-lg px-4">
            Browse our collection and see exactly what each meal costs before you cook
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card/50 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-border p-3 sm:p-4 mb-6 sm:mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search recipes..."
                className="pl-10 sm:pl-12 h-10 sm:h-12 bg-background text-sm sm:text-base"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 justify-end sm:justify-start">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
                className="h-10 w-10 sm:h-12 sm:w-12"
              >
                <Grid3X3 className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
                className="h-10 w-10 sm:h-12 sm:w-12"
              >
                <LayoutList className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
          </div>

          {/* Cuisine Filter Pills - Scrollable on mobile */}
          <div className="flex flex-wrap gap-2 mt-3 sm:mt-4 pb-2">
            {CUISINES.map((cuisine) => {
              const isActive = selectedCuisine === cuisine;
              const count = cuisine === "All" 
                ? recipes.length 
                : cuisine === "Favorites" 
                ? [...favoriteIds].filter(id => recipes.some(r => r.id === id)).length
                : cuisine === "Custom"
                ? recipes.filter(r => r.id.startsWith("custom-")).length
                : recipes.filter(r => r.cuisine === cuisine).length;
              
              return (
                <Button
                  key={cuisine}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCuisine(cuisine)}
                  className={`gap-1 sm:gap-2 transition-all flex-shrink-0 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3 ${isActive ? "shadow-lg shadow-primary/20" : ""}`}
                >
                  {cuisine === "Favorites" && <Heart className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                  {cuisine === "Custom" && <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                  {cuisine}
                  <Badge variant="secondary" className="ml-0.5 sm:ml-1 h-4 sm:h-5 px-1 sm:px-1.5 text-[10px] sm:text-xs">
                    {count}
                  </Badge>
                </Button>
              );
            })}
          </div>

          {/* Difficulty Filter */}
          <div className="flex flex-wrap gap-2 mt-3 pb-2">
            <span className="text-xs text-muted-foreground self-center flex-shrink-0 pr-2">Difficulty:</span>
            {DIFFICULTIES.map((difficulty) => {
              const isActive = selectedDifficulty === difficulty;
              return (
                <Button
                  key={difficulty}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDifficulty(difficulty)}
                  className={`gap-1 flex-shrink-0 text-xs h-7 px-2 ${isActive ? "shadow-lg shadow-primary/20" : ""}`}
                >
                  {difficulty !== "All" && getDifficultyIcon(difficulty as DifficultyLevel)}
                  {difficulty}
                </Button>
              );
            })}
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mt-2 pb-2">
            <span className="text-xs text-muted-foreground self-center flex-shrink-0 pr-2">Category:</span>
            {CATEGORIES.map((category) => {
              const isActive = selectedCategory === category;
              return (
                <Button
                  key={category}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={`gap-1 flex-shrink-0 text-xs h-7 px-2 ${isActive ? "shadow-lg shadow-primary/20" : ""}`}
                >
                  {category}
                </Button>
              );
            })}
          </div>

          {/* Dietary Filters */}
          <div className="mt-2">
            <DietaryFilters selected={selectedDietary} onChange={setSelectedDietary} />
          </div>
        </motion.div>

        {/* Recipe Grid */}
        <div className={
          viewMode === "grid" 
            ? "grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6"
            : "flex flex-col gap-3 sm:gap-4"
        }>
          <AnimatePresence mode="popLayout">
            {filteredRecipes.map((recipe, index) => {
              const totalCost = calculateRecipeCost(recipe.ingredients, recipe.servings, recipe.servings);
              const imageUrl = getImageUrl(recipe.image);
              const isFavorite = favoriteIds.has(recipe.id);
              const isCustom = recipe.id.startsWith("custom-");
              
              if (viewMode === "list") {
                return (
                  <motion.div
                    key={recipe.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => handleRecipeClick(recipe)}
                    className="bg-card rounded-2xl border border-border/70 overflow-hidden cursor-pointer hover:border-primary/50 hover:shadow-warm transition-all group"
                  >
                    <div className="flex">
                      <div className="w-24 sm:w-32 md:w-48 flex-shrink-0 relative image-shell">
                        <img
                          src={imageUrl}
                          alt={recipe.title}
                          className="w-full h-full object-cover aspect-square group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="flex-1 p-3 sm:p-4 md:p-6 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-1 sm:mb-2">
                            <h3 className="font-display text-sm sm:text-base md:text-xl font-semibold group-hover:text-primary transition-colors line-clamp-1">
                              {recipe.title}
                            </h3>
                            <span className="text-sm sm:text-base md:text-xl font-display font-bold text-primary whitespace-nowrap flex-shrink-0">
                              {formatPrice(totalCost)}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1 sm:line-clamp-2 mb-2 sm:mb-4 hidden sm:block">
                            {recipe.description}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                            <div className="flex items-center gap-1 sm:gap-1.5">
                              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="hidden xs:inline">{recipe.prepTime}</span>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-1.5">
                              <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span>{recipe.servings}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 sm:gap-2">
                            {recipe.difficulty && (
                              <Badge variant="outline" className={`text-[10px] sm:text-xs h-5 sm:h-6 gap-1 ${getDifficultyColor(recipe.difficulty)}`}>
                                {getDifficultyIcon(recipe.difficulty)}
                                {recipe.difficulty}
                              </Badge>
                            )}
                            {isFavorite && (
                              <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-accent fill-current" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              }
              
              return (
                <motion.div
                  key={recipe.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.03 }}
                  whileHover={{ y: -4 }}
                  onClick={() => handleRecipeClick(recipe)}
                  className="bg-card rounded-2xl border border-border/70 overflow-hidden cursor-pointer hover:border-primary/50 hover:shadow-warm-lg transition-all group"
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden image-shell">
                    <img
                      src={imageUrl}
                      alt={recipe.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Top Badges */}
                    <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex gap-1 sm:gap-2">
                      {recipe.difficulty && (
                        <Badge variant="secondary" className={`backdrop-blur-sm text-[10px] sm:text-xs h-5 sm:h-6 px-1.5 sm:px-2 gap-1 ${getDifficultyColor(recipe.difficulty)}`}>
                          {getDifficultyIcon(recipe.difficulty)}
                          {recipe.difficulty}
                        </Badge>
                      )}
                      {isCustom && (
                        <Badge className="bg-secondary text-secondary-foreground text-[10px] sm:text-xs h-5 sm:h-6 px-1.5 sm:px-2">
                          Custom
                        </Badge>
                      )}
                    </div>

                    {/* Cost Badge */}
                    <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-primary px-2 sm:px-3 py-1 sm:py-1.5 rounded-full flex items-center gap-1 shadow-lg">
                      <span className="text-[10px] sm:text-sm font-bold text-primary-foreground">
                        {formatPrice(totalCost)}
                      </span>
                    </div>

                    {/* Action Buttons - Show on hover (desktop) or always visible (mobile) */}
                    <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 flex gap-1.5 sm:gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(recipe.id);
                        }}
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-colors ${
                          isFavorite 
                            ? "bg-accent text-accent-foreground" 
                            : "bg-background/90 text-foreground hover:bg-accent hover:text-accent-foreground"
                        }`}
                      >
                        <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isFavorite ? "fill-current" : ""}`} />
                      </motion.button>
                      
                      {isCustom && onDeleteCustomRecipe && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => handleDelete(e, recipe.id)}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-background/90 backdrop-blur-md flex items-center justify-center text-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
                        >
                          <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        </motion.button>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-3 sm:p-5">
                    <div className="flex items-start justify-between gap-2 mb-1 sm:mb-2">
                      <h3 className="font-display text-sm sm:text-lg font-semibold group-hover:text-primary transition-colors line-clamp-1">
                        {recipe.title}
                      </h3>
                      {isFavorite && (
                        <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-accent fill-current flex-shrink-0 hidden sm:block" />
                      )}
                    </div>

                    <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-4 line-clamp-2 hidden sm:block">
                      {recipe.description}
                    </p>

                    <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground">
                      <div className="flex items-center gap-2 sm:gap-4">
                        <div className="flex items-center gap-1 sm:gap-1.5">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>{recipe.prepTime}</span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-1.5">
                          <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>{recipe.servings}</span>
                        </div>
                      </div>
                      {recipe.category && (
                        <Badge variant="outline" className="text-[10px] h-5 hidden sm:inline-flex">
                          {recipe.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredRecipes.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 sm:py-20"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Search className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg sm:text-xl font-display font-semibold mb-2">
              {selectedCuisine === "Favorites" 
                ? "No favorites yet" 
                : selectedCuisine === "Custom"
                ? "No custom recipes"
                : "No recipes found"}
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto px-4">
              {selectedCuisine === "Favorites" 
                ? "Click the heart on any recipe to save it to your favorites" 
                : selectedCuisine === "Custom"
                ? "Create your first custom recipe using the button in the navigation"
                : "Try adjusting your search or selecting a different category"}
            </p>
          </motion.div>
        )}

        {/* Compare Floating Bar */}
        <AnimatePresence>
          {compareIds.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-card border border-border rounded-xl shadow-2xl px-3 sm:px-6 py-3 flex flex-wrap items-center justify-center gap-2 sm:gap-4 w-[calc(100%-2rem)] sm:w-auto"
            >
              <GitCompareArrows className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">{compareIds.size} selected</span>
              <Button
                size="sm"
                onClick={() => setCompareIds(new Set())}
                variant="ghost"
                className="text-xs h-7"
              >
                Clear
              </Button>
              <Button
                size="sm"
                disabled={compareIds.size < 2}
                className="text-xs h-7 gap-1"
                onClick={() => {/* comparison modal handled below */}}
              >
                Compare
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Comparison Modal */}
        <AnimatePresence>
          {compareIds.size >= 2 && (
            <RecipeComparison
              recipes={compareRecipes}
              onClose={() => setCompareIds(new Set())}
              onRemoveRecipe={(id) => {
                setCompareIds(prev => {
                  const next = new Set(prev);
                  next.delete(id);
                  return next;
                });
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
