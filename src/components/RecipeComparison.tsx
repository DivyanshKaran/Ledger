import { useMemo } from "react";
import { motion } from "framer-motion";
import { X, Clock, Users, DollarSign, Zap, ChefHat, Trophy, Flame } from "lucide-react";
import { Recipe, calculateRecipeCost, DifficultyLevel } from "@/data/recipes";
import { useCurrency } from "@/hooks/useCurrency";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";

interface RecipeComparisonProps {
  recipes: Recipe[];
  onClose: () => void;
  onRemoveRecipe: (id: string) => void;
}

const getDifficultyValue = (d?: DifficultyLevel) => {
  switch (d) { case "Easy": return 1; case "Medium": return 2; case "Hard": return 3; default: return 0; }
};

export default function RecipeComparison({ recipes, onClose, onRemoveRecipe }: RecipeComparisonProps) {
  const { formatPrice } = useCurrency();

  const data = useMemo(() => recipes.map(r => {
    const cost = calculateRecipeCost(r.ingredients, r.servings, r.servings);
    return {
      recipe: r,
      totalCost: cost,
      costPerServing: cost / r.servings,
      totalCalories: r.nutrition.calories,
      protein: r.nutrition.protein,
      carbs: r.nutrition.carbs,
      fat: r.nutrition.fat,
      fiber: r.nutrition.fiber,
      prepMinutes: parseInt(r.prepTime) || 0,
      cookMinutes: parseInt(r.cookTime) || 0,
      totalMinutes: parseInt(r.totalTime) || 0,
      difficulty: getDifficultyValue(r.difficulty),
    };
  }), [recipes]);

  if (recipes.length === 0) return null;

  const maxCalories = Math.max(...data.map(d => d.totalCalories));
  const maxCost = Math.max(...data.map(d => d.totalCost));
  const maxTime = Math.max(...data.map(d => d.totalMinutes));

  const colors = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(150, 60%, 45%)"];
  const columnCount = recipes.length;
  const gridTemplateColumns = `repeat(${columnCount}, minmax(0, 1fr))`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border">
          <h2 className="font-display text-xl sm:text-2xl font-semibold">Compare Recipes</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-4 sm:p-6">
          {/* Recipe Headers */}
          <div className="grid gap-4 mb-8" style={{ gridTemplateColumns }}>
            {data.map((d, i) => (
              <div key={d.recipe.id} className="text-center">
                <div className="relative inline-block">
                  <div className="w-3 h-3 rounded-full absolute -top-1 -right-1" style={{ backgroundColor: colors[i] }} />
                  <h3 className="font-display text-base sm:text-lg font-semibold">{d.recipe.title}</h3>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{d.recipe.cuisine}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs mt-1 h-7"
                  onClick={() => onRemoveRecipe(d.recipe.id)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>

          {/* Comparison Rows */}
          <div className="space-y-6">
            {/* Cost */}
            <ComparisonRow
              icon={<DollarSign className="w-4 h-4" />}
              label="Total Cost"
              items={data.map((d, i) => ({
                value: formatPrice(d.totalCost),
                percentage: (d.totalCost / maxCost) * 100,
                color: colors[i],
                isBest: d.totalCost === Math.min(...data.map(x => x.totalCost)),
              }))}
              gridTemplateColumns={gridTemplateColumns}
            />

            <ComparisonRow
              icon={<DollarSign className="w-4 h-4" />}
              label="Per Serving"
              items={data.map((d, i) => ({
                value: formatPrice(d.costPerServing),
                percentage: (d.costPerServing / Math.max(...data.map(x => x.costPerServing))) * 100,
                color: colors[i],
                isBest: d.costPerServing === Math.min(...data.map(x => x.costPerServing)),
              }))}
              gridTemplateColumns={gridTemplateColumns}
            />

            {/* Time */}
            <ComparisonRow
              icon={<Clock className="w-4 h-4" />}
              label="Total Time"
              items={data.map((d, i) => ({
                value: d.recipe.totalTime,
                percentage: maxTime > 0 ? (d.totalMinutes / maxTime) * 100 : 50,
                color: colors[i],
                isBest: d.totalMinutes === Math.min(...data.map(x => x.totalMinutes)),
              }))}
              gridTemplateColumns={gridTemplateColumns}
            />

            {/* Calories */}
            <ComparisonRow
              icon={<Flame className="w-4 h-4" />}
              label="Calories/Serving"
              items={data.map((d, i) => ({
                value: `${d.totalCalories} kcal`,
                percentage: maxCalories > 0 ? (d.totalCalories / maxCalories) * 100 : 50,
                color: colors[i],
                isBest: d.totalCalories === Math.min(...data.map(x => x.totalCalories)),
              }))}
              gridTemplateColumns={gridTemplateColumns}
            />

            {/* Protein */}
            <ComparisonRow
              icon={<Zap className="w-4 h-4" />}
              label="Protein/Serving"
              items={data.map((d, i) => ({
                value: `${d.protein}g`,
                percentage: (d.protein / Math.max(...data.map(x => x.protein))) * 100,
                color: colors[i],
                isBest: d.protein === Math.max(...data.map(x => x.protein)),
              }))}
              gridTemplateColumns={gridTemplateColumns}
            />

            {/* Servings */}
            <ComparisonRow
              icon={<Users className="w-4 h-4" />}
              label="Servings"
              items={data.map((d, i) => ({
                value: `${d.recipe.servings}`,
                percentage: (d.recipe.servings / Math.max(...data.map(x => x.recipe.servings))) * 100,
                color: colors[i],
              }))}
              gridTemplateColumns={gridTemplateColumns}
            />

            {/* Difficulty */}
            <div className="bg-muted/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3 text-sm font-medium">
                <ChefHat className="w-4 h-4 text-muted-foreground" />
                Difficulty
              </div>
              <div className="grid gap-4" style={{ gridTemplateColumns }}>
                {data.map((d) => (
                  <div key={d.recipe.id} className="text-center">
                    <Badge variant="outline" className="text-xs">
                      {d.recipe.difficulty || "N/A"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ComparisonRow({ icon, label, items, gridTemplateColumns }: {
  icon: React.ReactNode;
  label: string;
  items: { value: string; percentage: number; color: string; isBest?: boolean }[];
  gridTemplateColumns: string;
}) {
  return (
    <div className="bg-muted/30 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3 text-sm font-medium">
        {icon}
        {label}
      </div>
      <div className="grid gap-3" style={{ gridTemplateColumns }}>
        {items.map((item, i) => (
          <div key={i}>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-sm font-semibold ${item.isBest ? "text-green-600" : ""}`}>
                {item.value}
              </span>
              {item.isBest && <Badge className="bg-green-500/10 text-green-600 text-[10px] h-4 px-1">Best</Badge>}
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.percentage}%` }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="h-full rounded-full"
                style={{ backgroundColor: item.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
