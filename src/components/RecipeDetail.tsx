import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Clock, Users, Minus, Plus, ShoppingCart, DollarSign, ListOrdered, Apple, Heart, Edit3, MessageSquare, Zap, ChefHat, Trophy, PlayCircle } from "lucide-react";
import { Recipe, calculateRecipeCost, getScaledIngredients, DifficultyLevel } from "@/data/recipes";
import { useCurrency } from "@/hooks/useCurrency";
import GlobalTimer from "./GlobalTimer";
import NutritionPanel from "./NutritionPanel";
import ShareRecipe from "./ShareRecipe";
import PriceEditor from "./PriceEditor";
import RecipeReviews, { StarRating } from "./RecipeReviews";
import RecipePDFGenerator from "./RecipePDFGenerator";
import CostBarChart from "./CostBarChart";
import CookingMode from "./CookingMode";
import IngredientSubstitutions from "./IngredientSubstitutions";
import { AddToCollectionButton } from "./RecipeCollections";
import { useAuth } from "@/hooks/useAuth";
import { useRecipeRatings } from "@/hooks/useReviews";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

// Import images dynamically using eager loading
const imageModules = import.meta.glob<{ default: string }>('@/assets/recipe-*.jpg', { eager: true });

const getImageUrl = (imagePath: string): string => {
  const filename = imagePath.split('/').pop();
  const key = `/src/assets/${filename}`;
  return imageModules[key]?.default || imagePath;
};

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(40, 90%, 55%)",
  "hsl(12, 70%, 45%)",
  "hsl(95, 25%, 35%)",
  "hsl(200, 60%, 50%)",
  "hsl(280, 50%, 50%)",
  "hsl(42, 85%, 65%)",
];

const getDifficultyIcon = (difficulty: DifficultyLevel) => {
  switch (difficulty) {
    case "Easy": return <Zap className="w-3 h-3 sm:w-4 sm:h-4" />;
    case "Medium": return <ChefHat className="w-3 h-3 sm:w-4 sm:h-4" />;
    case "Hard": return <Trophy className="w-3 h-3 sm:w-4 sm:h-4" />;
    default: return null;
  }
};

const getDifficultyColor = (difficulty: DifficultyLevel): string => {
  switch (difficulty) {
    case "Easy": return "bg-green-500/10 text-green-600 border-green-500/20";
    case "Medium": return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
    case "Hard": return "bg-red-500/10 text-red-600 border-red-500/20";
    default: return "bg-muted text-muted-foreground";
  }
};

type TabType = "ingredients" | "steps" | "nutrition" | "reviews";

interface RecipeDetailProps {
  recipe: Recipe;
  onBack: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  isCustom?: boolean;
  onEditRecipe?: () => void;
  getCustomPrice?: (ingredientName: string, defaultPrice: number) => number;
}

export default function RecipeDetail({ 
  recipe, 
  onBack, 
  isFavorite = false, 
  onToggleFavorite,
  isCustom = false,
  onEditRecipe,
  getCustomPrice
}: RecipeDetailProps) {
  const [servings, setServings] = useState(recipe.servings);
  const [activeTab, setActiveTab] = useState<TabType>("ingredients");
  const [priceVersion, setPriceVersion] = useState(0);
  const [showCookingMode, setShowCookingMode] = useState(false);
  const imageUrl = getImageUrl(recipe.image);
  const { user } = useAuth();
  const { averageRating, ratingCount } = useRecipeRatings(recipe.id);
  const { formatPrice } = useCurrency();

  const scaledIngredients = useMemo(() => {
    const scaled = getScaledIngredients(recipe.ingredients, servings, recipe.servings);
    if (getCustomPrice) {
      return scaled.map(ing => ({
        ...ing,
        pricePerUnit: getCustomPrice(ing.name, ing.pricePerUnit),
      }));
    }
    return scaled;
  }, [recipe.ingredients, servings, recipe.servings, getCustomPrice, priceVersion]);

  const totalCost = useMemo(() => {
    return scaledIngredients.reduce((sum, ing) => sum + ing.quantity * ing.pricePerUnit, 0);
  }, [scaledIngredients]);

  const costPerServing = totalCost / servings;

  const pieData = useMemo(() => {
    return scaledIngredients.map((ing) => ({
      name: ing.name,
      value: ing.quantity * ing.pricePerUnit,
    }));
  }, [scaledIngredients]);

  

  const tabs: { id: TabType; label: string; shortLabel: string; icon: React.ElementType; badge?: string }[] = [
    { id: "ingredients", label: "Ingredients", shortLabel: "Items", icon: ShoppingCart, badge: `${scaledIngredients.length}` },
    { id: "steps", label: "Instructions", shortLabel: "Steps", icon: ListOrdered, badge: `${recipe.steps.length}` },
    { id: "nutrition", label: "Nutrition", shortLabel: "Nutrition", icon: Apple },
    { id: "reviews", label: "Reviews", shortLabel: "Reviews", icon: MessageSquare, badge: ratingCount > 0 ? `${ratingCount}` : undefined },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-background"
    >
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="gap-1 sm:gap-2 h-9"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          
          <div className="flex items-center gap-1.5 sm:gap-2">
            <ShareRecipe 
              recipeId={recipe.id} 
              recipeTitle={recipe.title}
              isCustom={isCustom}
            />

            {user && <AddToCollectionButton recipeId={recipe.id} />}

            {onToggleFavorite && (
              <Button
                variant={isFavorite ? "default" : "outline"}
                size="sm"
                onClick={onToggleFavorite}
                className={`gap-1.5 h-9 ${isFavorite ? "bg-accent hover:bg-accent/90" : ""}`}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
                <span className="hidden sm:inline">{isFavorite ? "Saved" : "Save"}</span>
              </Button>
            )}

            <Button
              variant="default"
              size="sm"
              onClick={() => setShowCookingMode(true)}
              className="gap-1.5 h-9 bg-green-600 hover:bg-green-700 text-white"
            >
              <PlayCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Cook Now</span>
            </Button>
            
            {isCustom && onEditRecipe && (
              <Button variant="outline" size="sm" onClick={onEditRecipe} className="gap-1.5 h-9">
                <Edit3 className="w-4 h-4" />
                <span className="hidden sm:inline">Edit</span>
              </Button>
            )}
            
            <RecipePDFGenerator recipe={recipe} servings={servings} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Recipe Header */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-8 mb-6 sm:mb-10">
          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-3 relative rounded-xl sm:rounded-3xl overflow-hidden shadow-xl sm:shadow-2xl"
          >
            <img
              src={imageUrl}
              alt={recipe.title}
              className="w-full aspect-[16/10] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2 sm:mb-4">
                  {recipe.difficulty && (
                    <Badge variant="secondary" className={`backdrop-blur-sm text-xs sm:text-sm h-5 sm:h-6 gap-1 ${getDifficultyColor(recipe.difficulty)}`}>
                      {getDifficultyIcon(recipe.difficulty)}
                      {recipe.difficulty}
                    </Badge>
                  )}
                  {recipe.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="secondary" className="bg-background/90 backdrop-blur-sm text-xs sm:text-sm h-5 sm:h-6">
                      {tag}
                    </Badge>
                  ))}
                  {isFavorite && (
                    <Badge className="bg-accent text-accent-foreground gap-1 text-xs sm:text-sm h-5 sm:h-6">
                      <Heart className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
                      <span className="hidden xs:inline">Favorite</span>
                    </Badge>
                  )}
                </div>
              <h1 className="font-display text-xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold text-background mb-2 sm:mb-3 line-clamp-2">
                {recipe.title}
              </h1>
              
              {/* Rating Preview */}
              {ratingCount > 0 && (
                <div className="flex items-center gap-2 text-background/90">
                  <StarRating rating={averageRating} size="sm" />
                  <span className="text-xs sm:text-sm font-medium">
                    {averageRating.toFixed(1)} ({ratingCount})
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Recipe Info Sidebar */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Time Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-3 gap-2 sm:gap-3"
            >
              {[
                { label: "Prep", value: recipe.prepTime },
                { label: "Cook", value: recipe.cookTime },
                { label: "Total", value: recipe.totalTime, highlight: true },
              ].map((time) => (
                <div 
                  key={time.label}
                  className={`bg-card rounded-lg sm:rounded-xl border border-border p-2.5 sm:p-4 text-center ${
                    time.highlight ? "border-primary/50 bg-primary/5" : ""
                  }`}
                >
                  <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1">{time.label}</p>
                  <p className={`font-semibold text-xs sm:text-base ${time.highlight ? "text-primary" : ""}`}>
                    {time.value}
                  </p>
                </div>
              ))}
            </motion.div>

            {/* Description - Hidden on small mobile */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-muted-foreground leading-relaxed text-sm sm:text-base hidden sm:block"
            >
              {recipe.description}
            </motion.p>

            {/* Servings Adjuster */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-lg sm:rounded-xl border border-border p-3 sm:p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    Servings
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Adjust to scale recipe</p>
                </div>
                
                <div className="flex items-center gap-2 sm:gap-3">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setServings(Math.max(1, servings - 1))}
                    className="h-8 w-8 sm:h-10 sm:w-10 rounded-full"
                  >
                    <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                  
                  <motion.span
                    key={servings}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    className="text-2xl sm:text-3xl font-display font-bold w-10 sm:w-12 text-center"
                  >
                    {servings}
                  </motion.span>
                  
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setServings(servings + 1)}
                    className="h-8 w-8 sm:h-10 sm:w-10 rounded-full"
                  >
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Cost Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-gradient-to-br from-primary to-primary/80 rounded-lg sm:rounded-xl p-4 sm:p-6 text-primary-foreground shadow-lg shadow-primary/20"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-primary-foreground/80 text-xs sm:text-sm mb-0.5 sm:mb-1">Total Cost</p>
                  <motion.p
                    key={totalCost}
                    initial={{ scale: 1.05 }}
                    animate={{ scale: 1 }}
                    className="text-2xl sm:text-4xl font-display font-bold"
                  >
                    {formatPrice(totalCost)}
                  </motion.p>
                </div>
                <div className="text-right">
                  <p className="text-primary-foreground/80 text-xs sm:text-sm mb-0.5 sm:mb-1">Per Serving</p>
                  <motion.p
                    key={costPerServing}
                    initial={{ scale: 1.05 }}
                    animate={{ scale: 1 }}
                    className="text-lg sm:text-2xl font-semibold"
                  >
                    {formatPrice(costPerServing)}
                  </motion.p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Tab Navigation - Scrollable on mobile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-1.5 sm:gap-2 mb-6 sm:mb-8 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <Button
                key={tab.id}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab(tab.id)}
                className={`gap-1 sm:gap-2 whitespace-nowrap flex-shrink-0 h-8 sm:h-9 text-xs sm:text-sm ${isActive ? "shadow-lg shadow-primary/20" : ""}`}
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">{tab.label}</span>
                <span className="xs:hidden">{tab.shortLabel}</span>
                {tab.badge && (
                  <Badge variant={isActive ? "secondary" : "outline"} className="ml-0.5 sm:ml-1 h-4 sm:h-5 px-1 sm:px-1.5 text-[10px] sm:text-xs">
                    {tab.badge}
                  </Badge>
                )}
              </Button>
            );
          })}

          {/* Price Editor Button */}
          {user && activeTab === "ingredients" && (
            <div className="ml-auto flex-shrink-0">
              <PriceEditor 
                ingredients={recipe.ingredients}
                onPricesUpdated={() => setPriceVersion(v => v + 1)}
              />
            </div>
          )}
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "ingredients" && (
            <motion.div
              key="ingredients"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6"
            >
              {/* Ingredients List */}
              <div className="bg-card rounded-xl sm:rounded-2xl border border-border overflow-hidden">
                <div className="p-3 sm:p-5 border-b border-border bg-muted/30">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-base sm:text-lg font-semibold flex items-center gap-1.5 sm:gap-2">
                      <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      Shopping List
                    </h3>
                    <Badge variant="outline" className="text-xs h-5">{scaledIngredients.length} items</Badge>
                  </div>
                </div>
                
                <div className="divide-y divide-border max-h-[400px] sm:max-h-[500px] overflow-y-auto">
                  {scaledIngredients.map((ingredient, index) => {
                    const ingredientCost = ingredient.quantity * ingredient.pricePerUnit;
                    return (
                      <motion.div
                        key={ingredient.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className="p-3 sm:p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                            <span
                              className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="font-medium text-sm sm:text-base truncate">{ingredient.name}</span>
                            <IngredientSubstitutions
                              ingredientName={ingredient.name}
                              recipeTitle={recipe.title}
                            />
                          </div>
                          <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm flex-shrink-0">
                            <span className="text-muted-foreground whitespace-nowrap">
                              {ingredient.quantity.toFixed(1)} {ingredient.unit}
                            </span>
                            <span className="font-semibold w-14 sm:w-16 text-right text-primary">
                              {formatPrice(ingredientCost)}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="p-3 sm:p-5 border-t border-border bg-muted/30">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm sm:text-base">Total</span>
                    <span className="text-xl sm:text-2xl font-display font-bold text-primary">
                      {formatPrice(totalCost)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cost Distribution Chart */}
              <div className="bg-card rounded-xl sm:rounded-2xl border border-border p-4 sm:p-6">
                <h3 className="font-display text-base sm:text-lg font-semibold mb-4 sm:mb-6 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  Cost Breakdown
                </h3>
                <CostBarChart data={pieData} />
              </div>
            </motion.div>
          )}

          {activeTab === "steps" && (
            <motion.div
              key="steps"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <GlobalTimer steps={recipe.steps} recipeName={recipe.title} />
            </motion.div>
          )}

          {activeTab === "nutrition" && (
            <motion.div
              key="nutrition"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-lg mx-auto"
            >
              <NutritionPanel 
                nutrition={recipe.nutrition} 
                servings={servings}
                baseServings={recipe.servings}
              />
            </motion.div>
          )}

          {activeTab === "reviews" && (
            <motion.div
              key="reviews"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              <RecipeReviews recipeId={recipe.id} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Cooking Mode Overlay */}
      <AnimatePresence>
        {showCookingMode && (
          <CookingMode recipe={recipe} onClose={() => setShowCookingMode(false)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
