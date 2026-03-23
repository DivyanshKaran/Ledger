import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
   Calendar, X, Plus, ShoppingCart, ChevronDown, ChevronUp, 
   Download, Trash2, ChefHat, List, Search, Filter
} from "lucide-react";
import { Recipe, calculateRecipeCost, getScaledIngredients } from "@/data/recipes";
import { useCurrency } from "@/hooks/useCurrency";
import { Button } from "./ui/button";
 import { Input } from "./ui/input";
 import { Badge } from "./ui/badge";
import ShoppingListGenerator from "./ShoppingListGenerator";

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

interface MealSlot {
  recipeId: string;
  servings: number;
}

interface MealPlan {
  [day: string]: {
    breakfast?: MealSlot;
    lunch?: MealSlot;
    dinner?: MealSlot;
  };
}

interface MealPlannerProps {
  recipes: Recipe[];
  onClose: () => void;
  onSelectRecipe: (recipe: Recipe) => void;
}

export default function MealPlanner({ recipes, onClose, onSelectRecipe }: MealPlannerProps) {
  const [mealPlan, setMealPlan] = useState<MealPlan>({});
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [showShoppingGenerator, setShowShoppingGenerator] = useState(false);
  const [selectingFor, setSelectingFor] = useState<{ day: string; meal: "breakfast" | "lunch" | "dinner" } | null>(null);
   const [recipeSearch, setRecipeSearch] = useState("");
   const [selectedCuisine, setSelectedCuisine] = useState<string>("All");
  const { formatPrice } = useCurrency();

  const getRecipeById = (id: string) => recipes.find(r => r.id === id);

  const addMeal = (day: string, meal: "breakfast" | "lunch" | "dinner", recipeId: string) => {
    const recipe = getRecipeById(recipeId);
    if (!recipe) return;
    
    setMealPlan(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [meal]: { recipeId, servings: recipe.servings }
      }
    }));
    setSelectingFor(null);
  };

  const removeMeal = (day: string, meal: "breakfast" | "lunch" | "dinner") => {
    setMealPlan(prev => {
      const updated = { ...prev };
      if (updated[day]) {
        delete updated[day][meal];
        if (Object.keys(updated[day]).length === 0) {
          delete updated[day];
        }
      }
      return updated;
    });
  };

  const updateServings = (day: string, meal: "breakfast" | "lunch" | "dinner", delta: number) => {
    setMealPlan(prev => {
      const current = prev[day]?.[meal];
      if (!current) return prev;
      const newServings = Math.max(1, current.servings + delta);
      return {
        ...prev,
        [day]: {
          ...prev[day],
          [meal]: { ...current, servings: newServings }
        }
      };
    });
  };

   // Get unique cuisines for filtering
   const cuisines = useMemo(() => {
     const unique = [...new Set(recipes.map(r => r.cuisine))];
     return ["All", ...unique.sort()];
   }, [recipes]);

   // Filter recipes for selection modal
   const filteredRecipes = useMemo(() => {
     return recipes.filter(recipe => {
       const matchesSearch = recipe.title.toLowerCase().includes(recipeSearch.toLowerCase()) ||
         recipe.description.toLowerCase().includes(recipeSearch.toLowerCase());
       const matchesCuisine = selectedCuisine === "All" || recipe.cuisine === selectedCuisine;
       return matchesSearch && matchesCuisine;
     });
   }, [recipes, recipeSearch, selectedCuisine]);

  // Calculate combined shopping list
  const { shoppingList, totalCost } = useMemo(() => {
    const ingredientMap = new Map<string, { quantity: number; unit: string; pricePerUnit: number }>();
    let cost = 0;

    Object.values(mealPlan).forEach(dayMeals => {
      Object.values(dayMeals).forEach(slot => {
        if (!slot) return;
        const recipe = getRecipeById(slot.recipeId);
        if (!recipe) return;
        
        const scaled = getScaledIngredients(recipe.ingredients, slot.servings, recipe.servings);
        cost += calculateRecipeCost(recipe.ingredients, slot.servings, recipe.servings);

        scaled.forEach(ing => {
          const existing = ingredientMap.get(ing.name);
          if (existing && existing.unit === ing.unit) {
            ingredientMap.set(ing.name, {
              ...existing,
              quantity: existing.quantity + ing.quantity
            });
          } else {
            ingredientMap.set(ing.name, {
              quantity: ing.quantity,
              unit: ing.unit,
              pricePerUnit: ing.pricePerUnit
            });
          }
        });
      });
    });

    return {
      shoppingList: Array.from(ingredientMap.entries()).map(([name, data]) => ({
        name,
        ...data,
        totalPrice: data.quantity * data.pricePerUnit
      })),
      totalCost: cost
    };
  }, [mealPlan, recipes]);

  const mealCount = Object.values(mealPlan).reduce((sum, day) => 
    sum + Object.values(day).filter(Boolean).length, 0
  );

  const exportShoppingList = () => {
    const text = shoppingList
      .map(item => `☐ ${item.name}: ${item.quantity.toFixed(1)} ${item.unit} (${formatPrice(item.totalPrice)})`)
      .join('\n');
    
    const blob = new Blob([`Shopping List\nTotal: ${formatPrice(totalCost)}\n\n${text}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shopping-list.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-background"
    >
      {/* Header */}
      <div className="sticky top-14 sm:top-16 z-40 bg-background/90 backdrop-blur-lg border-b border-border/70">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary flex items-center justify-center">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-lg sm:text-xl font-semibold">Meal Planner</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">{mealCount} meals planned</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="hidden sm:flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary rounded-xl text-primary-foreground"
            >
              <span className="font-semibold text-sm sm:text-base">{formatPrice(totalCost)}</span>
              <span className="text-xs sm:text-sm opacity-80">weekly</span>
            </motion.div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowShoppingGenerator(true)}
              className="gap-1 sm:gap-2"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Full List</span>
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
        {/* Mobile Total */}
        <div className="sm:hidden mb-4">
          <div className="bg-primary rounded-xl p-3 text-primary-foreground flex items-center justify-between">
            <span className="text-sm">Weekly Total</span>
            <span className="font-display font-bold text-lg">{formatPrice(totalCost)}</span>
          </div>
        </div>

        {/* Week Grid */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-3 md:gap-4 mb-6 sm:mb-8">
          {DAYS_OF_WEEK.map((day, dayIndex) => (
            <motion.div
              key={day}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: dayIndex * 0.05 }}
              className="bg-card rounded-xl border border-border overflow-hidden"
            >
              <div className="p-2 sm:p-3 border-b border-border bg-muted/30">
                <h3 className="font-display font-semibold text-center text-sm sm:text-base">
                  {day.slice(0, 3)}
                  <span className="hidden sm:inline">{day.slice(3)}</span>
                </h3>
              </div>
              
              <div className="p-1.5 sm:p-2 space-y-1.5 sm:space-y-2">
                {(["breakfast", "lunch", "dinner"] as const).map(meal => {
                  const slot = mealPlan[day]?.[meal];
                  const recipe = slot ? getRecipeById(slot.recipeId) : null;
                  
                  return (
                    <div key={meal} className="relative">
                      <p className="text-[10px] sm:text-xs text-muted-foreground capitalize mb-0.5 sm:mb-1 px-1">
                        {meal.slice(0, 1).toUpperCase()}{meal.slice(1)}
                      </p>
                      
                      {recipe ? (
                        <motion.div
                          layout
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="p-1.5 sm:p-2 bg-muted/50 rounded-lg group relative"
                        >
                          <button
                            onClick={() => onSelectRecipe(recipe)}
                            className="text-left w-full"
                          >
                            <p className="text-xs sm:text-sm font-medium line-clamp-1 pr-4 sm:pr-6">{recipe.title}</p>
                          </button>
                          
                          <div className="flex items-center justify-between mt-1.5 sm:mt-2">
                            <div className="flex items-center gap-0.5 sm:gap-1">
                              <button
                                onClick={() => updateServings(day, meal, -1)}
                                className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded bg-background hover:bg-primary hover:text-primary-foreground transition-colors text-[10px] sm:text-xs"
                              >
                                -
                              </button>
                              <span className="text-[10px] sm:text-xs w-4 sm:w-6 text-center">{slot?.servings}</span>
                              <button
                                onClick={() => updateServings(day, meal, 1)}
                                className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded bg-background hover:bg-primary hover:text-primary-foreground transition-colors text-[10px] sm:text-xs"
                              >
                                +
                              </button>
                            </div>
                            
                            <span className="text-[10px] sm:text-xs text-primary font-medium">
                              {formatPrice(calculateRecipeCost(recipe.ingredients, slot?.servings || recipe.servings, recipe.servings))}
                            </span>
                          </div>
                          
                          <button
                            onClick={() => removeMeal(day, meal)}
                            className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 opacity-0 group-hover:opacity-100 p-0.5 sm:p-1 hover:bg-accent rounded transition-all"
                          >
                            <X className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          </button>
                        </motion.div>
                      ) : (
                        <button
                          onClick={() => setSelectingFor({ day, meal })}
                          className="w-full p-2 sm:p-3 border border-dashed border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-1 text-muted-foreground hover:text-primary"
                        >
                          <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="text-[10px] sm:text-xs">Add</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Shopping List Toggle */}
        <motion.button
          onClick={() => setShowShoppingList(!showShoppingList)}
          className="w-full bg-card rounded-xl border border-border p-3 sm:p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <span className="font-display font-semibold text-sm sm:text-base">Quick Shopping List</span>
            <span className="text-xs sm:text-sm text-muted-foreground">
              ({shoppingList.length} items)
            </span>
          </div>
          {showShoppingList ? <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" /> : <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />}
        </motion.button>

        {/* Shopping List */}
        <AnimatePresence>
          {showShoppingList && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-card rounded-xl border border-border mt-3 sm:mt-4 overflow-hidden">
                <div className="p-3 sm:p-4 border-b border-border bg-muted/30 flex items-center justify-between">
                  <h3 className="font-display font-semibold text-sm sm:text-base">Combined Ingredients</h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={exportShoppingList}
                    disabled={shoppingList.length === 0}
                    className="gap-1 sm:gap-2 h-8 text-xs sm:text-sm"
                  >
                    <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                    Export
                  </Button>
                </div>
                
                {shoppingList.length === 0 ? (
                  <div className="p-6 sm:p-8 text-center text-muted-foreground">
                    <ShoppingCart className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 opacity-30" />
                    <p className="text-sm sm:text-base">Add meals to your planner to see ingredients</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border max-h-60 sm:max-h-80 overflow-y-auto">
                    {shoppingList.map((item, index) => (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className="p-2.5 sm:p-3 hover:bg-muted/30 flex items-center justify-between"
                      >
                        <span className="font-medium text-sm sm:text-base">{item.name}</span>
                        <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                          <span className="text-muted-foreground">
                            {item.quantity.toFixed(1)} {item.unit}
                          </span>
                          <span className="font-semibold text-primary w-14 sm:w-16 text-right">
                            {formatPrice(item.totalPrice)}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
                
                <div className="p-3 sm:p-4 border-t border-border bg-primary text-primary-foreground flex items-center justify-between">
                  <span className="font-semibold text-sm sm:text-base">Weekly Total</span>
                  <span className="text-xl sm:text-2xl font-display font-bold">{formatPrice(totalCost)}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Recipe Selection Modal */}
      <AnimatePresence>
        {selectingFor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectingFor(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-card rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl"
            >
              <div className="p-3 sm:p-4 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="font-display text-base sm:text-lg font-semibold">Add Recipe</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {selectingFor.day} - {selectingFor.meal}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setSelectingFor(null)}
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </div>

               {/* Search and Filters */}
               <div className="p-3 sm:p-4 border-b border-border space-y-3">
                 <div className="relative">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                   <Input
                     type="text"
                     value={recipeSearch}
                     onChange={(e) => setRecipeSearch(e.target.value)}
                     placeholder="Search recipes..."
                     className="pl-9 h-10"
                   />
                 </div>
                 <div className="flex flex-wrap gap-2 pb-1">
                   {cuisines.map((cuisine) => (
                     <Button
                       key={cuisine}
                       variant={selectedCuisine === cuisine ? "default" : "outline"}
                       size="sm"
                       onClick={() => setSelectedCuisine(cuisine)}
                       className="flex-shrink-0 text-xs h-7"
                     >
                       {cuisine}
                     </Button>
                   ))}
                 </div>
               </div>
              
              <div className="p-3 sm:p-4 grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 max-h-[60vh] overflow-y-auto">
                 {filteredRecipes.length > 0 ? filteredRecipes.map(recipe => (
                  <motion.button
                    key={recipe.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => addMeal(selectingFor.day, selectingFor.meal, recipe.id)}
                    className="bg-card border border-border rounded-xl p-2 sm:p-3 text-left hover:ring-2 hover:ring-primary transition-all"
                  >
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                      <ChefHat className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                      <span className="text-[10px] sm:text-xs text-muted-foreground">{recipe.cuisine}</span>
                    </div>
                    <p className="font-medium text-xs sm:text-sm line-clamp-2">{recipe.title}</p>
                    <p className="text-[10px] sm:text-xs text-primary mt-1">
                      {formatPrice(calculateRecipeCost(recipe.ingredients, recipe.servings, recipe.servings))}
                    </p>
                  </motion.button>
                 )) : (
                   <div className="col-span-full p-8 text-center text-muted-foreground">
                     <Search className="w-10 h-10 mx-auto mb-2 opacity-30" />
                     <p className="text-sm">No recipes found</p>
                     <p className="text-xs">Try different search terms</p>
                   </div>
                 )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Shopping List Generator */}
      <AnimatePresence>
        {showShoppingGenerator && (
          <ShoppingListGenerator
            mealPlan={mealPlan}
            recipes={recipes}
            onClose={() => setShowShoppingGenerator(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
