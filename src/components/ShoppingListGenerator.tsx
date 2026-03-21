import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingCart, Download, Check, Copy, Printer, 
  ChevronDown, ChevronUp, X, Plus, Minus 
} from "lucide-react";
import { Recipe, getScaledIngredients, calculateRecipeCost } from "@/data/recipes";
import { useCurrency } from "@/hooks/useCurrency";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { toast } from "sonner";

interface ShoppingItem {
  name: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalPrice: number;
  checked: boolean;
}

interface ShoppingListGeneratorProps {
  mealPlan: {
    [day: string]: {
      breakfast?: { recipeId: string; servings: number };
      lunch?: { recipeId: string; servings: number };
      dinner?: { recipeId: string; servings: number };
    };
  };
  recipes: Recipe[];
  onClose: () => void;
}

export default function ShoppingListGenerator({ 
  mealPlan, 
  recipes, 
  onClose 
}: ShoppingListGeneratorProps) {
  const { formatPrice } = useCurrency();
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<"name" | "category">("name");

  const getRecipeById = (id: string) => recipes.find(r => r.id === id);

  // Calculate combined shopping list
  const { shoppingList, totalCost, recipeBreakdown } = useMemo(() => {
    const ingredientMap = new Map<string, { quantity: number; unit: string; pricePerUnit: number }>();
    const breakdown: { recipe: Recipe; servings: number; cost: number }[] = [];
    let cost = 0;

    Object.values(mealPlan).forEach(dayMeals => {
      Object.values(dayMeals).forEach(slot => {
        if (!slot) return;
        const recipe = getRecipeById(slot.recipeId);
        if (!recipe) return;
        
        const recipeCost = calculateRecipeCost(recipe.ingredients, slot.servings, recipe.servings);
        cost += recipeCost;
        
        // Add to breakdown
        const existing = breakdown.find(b => b.recipe.id === recipe.id);
        if (existing) {
          existing.servings += slot.servings;
          existing.cost += recipeCost;
        } else {
          breakdown.push({ recipe, servings: slot.servings, cost: recipeCost });
        }

        const scaled = getScaledIngredients(recipe.ingredients, slot.servings, recipe.servings);
        
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

    const list: ShoppingItem[] = Array.from(ingredientMap.entries())
      .map(([name, data]) => ({
        name,
        ...data,
        totalPrice: data.quantity * data.pricePerUnit,
        checked: checkedItems.has(name)
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return { shoppingList: list, totalCost: cost, recipeBreakdown: breakdown };
  }, [mealPlan, recipes, checkedItems]);

  const toggleItem = (name: string) => {
    setCheckedItems(prev => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const uncheckedCost = shoppingList
    .filter(item => !checkedItems.has(item.name))
    .reduce((sum, item) => sum + item.totalPrice, 0);

  const copyToClipboard = () => {
    const text = shoppingList
      .map(item => `${checkedItems.has(item.name) ? "✓" : "☐"} ${item.name}: ${item.quantity.toFixed(1)} ${item.unit} (${formatPrice(item.totalPrice)})`)
      .join('\n');
    
    navigator.clipboard.writeText(`Weekly Shopping List\nTotal: ${formatPrice(totalCost)}\n\n${text}`);
    toast.success("Copied to clipboard!");
  };

  const exportToFile = () => {
    const text = shoppingList
      .map(item => `☐ ${item.name}: ${item.quantity.toFixed(1)} ${item.unit} (${formatPrice(item.totalPrice)})`)
      .join('\n');
    
    const recipeText = recipeBreakdown
      .map(b => `• ${b.recipe.title} (${b.servings} servings) - ${formatPrice(b.cost)}`)
      .join('\n');
    
    const blob = new Blob([
      `Weekly Shopping List\n`,
      `Generated on ${new Date().toLocaleDateString()}\n`,
      `═══════════════════════════════════════\n\n`,
      `RECIPES PLANNED:\n${recipeText}\n\n`,
      `INGREDIENTS:\n${text}\n\n`,
      `═══════════════════════════════════════\n`,
      `TOTAL: ${formatPrice(totalCost)}`
    ], { type: 'text/plain' });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shopping-list-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Shopping list downloaded!");
  };

  const printList = () => {
    window.print();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-card rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-border flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-lg sm:text-xl font-semibold">Weekly Shopping List</h2>
              <p className="text-sm text-muted-foreground">
                {shoppingList.length} items from {recipeBreakdown.length} recipes
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Recipe Summary */}
        <div className="px-4 sm:px-6 py-3 border-b border-border bg-muted/10">
          <div className="flex flex-wrap gap-2">
            {recipeBreakdown.map(({ recipe, servings, cost }) => (
              <Badge key={recipe.id} variant="secondary" className="gap-1 py-1">
                {recipe.title}
                <span className="text-muted-foreground">×{servings}</span>
              </Badge>
            ))}
          </div>
        </div>

        {/* Shopping List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {shoppingList.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Add meals to your planner to generate a shopping list</p>
            </div>
          ) : (
            <div className="space-y-2">
              {shoppingList.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    checkedItems.has(item.name) 
                      ? "bg-muted/50 border-border/50" 
                      : "bg-card border-border hover:border-primary/30"
                  }`}
                >
                  <Checkbox
                    checked={checkedItems.has(item.name)}
                    onCheckedChange={() => toggleItem(item.name)}
                    className="h-5 w-5"
                  />
                  <span className={`flex-1 font-medium ${
                    checkedItems.has(item.name) ? "line-through text-muted-foreground" : ""
                  }`}>
                    {item.name}
                  </span>
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    {item.quantity.toFixed(1)} {item.unit}
                  </span>
                  <span className={`text-sm font-semibold whitespace-nowrap ${
                    checkedItems.has(item.name) ? "text-muted-foreground" : "text-primary"
                  }`}>
                    {formatPrice(item.totalPrice)}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-border bg-muted/30">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Remaining:</span>
                <span className="text-xl font-display font-bold text-primary">
                  {formatPrice(uncheckedCost)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Total: {formatPrice(totalCost)} • {checkedItems.size}/{shoppingList.length} checked
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyToClipboard} className="gap-2">
                <Copy className="w-4 h-4" />
                <span className="hidden sm:inline">Copy</span>
              </Button>
              <Button variant="outline" size="sm" onClick={printList} className="gap-2">
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">Print</span>
              </Button>
              <Button size="sm" onClick={exportToFile} className="gap-2">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Download</span>
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
