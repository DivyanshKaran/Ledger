import { useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, ChefHat, DollarSign, Flame, BarChart3 } from "lucide-react";
import { useCookingHistory } from "@/hooks/useCookingHistory";
import { useCurrency } from "@/hooks/useCurrency";
import { RECIPES } from "@/data/recipes";
import { Badge } from "./ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(40, 90%, 55%)",
  "hsl(200, 60%, 50%)",
  "hsl(280, 50%, 50%)",
  "hsl(150, 45%, 45%)",
  "hsl(12, 70%, 55%)",
];

export default function CostInsights() {
  const { history } = useCookingHistory();
  const { formatPrice } = useCurrency();

  const insights = useMemo(() => {
    if (history.length === 0) return null;

    // Calculate costs per recipe cooked
    const recipeMap = new Map<string, { count: number; totalCost: number; cuisine: string }>();
    
    history.forEach(entry => {
      const recipe = RECIPES.find(r => r.id === entry.recipe_id);
      if (!recipe) return;
      
      const cost = recipe.ingredients.reduce((sum, ing) => sum + ing.quantity * ing.pricePerUnit, 0);
      const existing = recipeMap.get(entry.recipe_id) || { count: 0, totalCost: 0, cuisine: recipe.cuisine };
      recipeMap.set(entry.recipe_id, {
        count: existing.count + 1,
        totalCost: existing.totalCost + cost,
        cuisine: recipe.cuisine,
      });
    });

    // Monthly spending
    const monthlySpending = new Map<string, number>();
    history.forEach(entry => {
      const recipe = RECIPES.find(r => r.id === entry.recipe_id);
      if (!recipe) return;
      const cost = recipe.ingredients.reduce((sum, ing) => sum + ing.quantity * ing.pricePerUnit, 0);
      const month = new Date(entry.cooked_at).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      monthlySpending.set(month, (monthlySpending.get(month) || 0) + cost);
    });

    // Cuisine breakdown
    const cuisineCounts = new Map<string, number>();
    recipeMap.forEach(val => {
      cuisineCounts.set(val.cuisine, (cuisineCounts.get(val.cuisine) || 0) + val.count);
    });

    const totalSpent = Array.from(recipeMap.values()).reduce((sum, v) => sum + v.totalCost, 0);
    const avgPerMeal = totalSpent / history.length;

    return {
      totalSpent,
      avgPerMeal,
      totalMeals: history.length,
      monthlyData: Array.from(monthlySpending.entries())
        .map(([month, amount]) => ({ month, amount }))
        .slice(-6),
      cuisineData: Array.from(cuisineCounts.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value),
      topRecipes: Array.from(recipeMap.entries())
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 5)
        .map(([id, data]) => ({
          name: RECIPES.find(r => r.id === id)?.title || id,
          count: data.count,
        })),
    };
  }, [history]);

  if (!insights) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-muted-foreground text-sm">Start cooking recipes to see your spending insights!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20 p-4"
        >
          <div className="flex items-center gap-2 text-primary mb-1">
            <DollarSign className="w-4 h-4" />
            <span className="text-xs font-medium">Total Spent</span>
          </div>
          <p className="text-2xl font-display font-bold">{formatPrice(insights.totalSpent)}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-xl border border-accent/20 p-4"
        >
          <div className="flex items-center gap-2 text-accent-foreground mb-1">
            <Flame className="w-4 h-4" />
            <span className="text-xs font-medium">Avg Per Meal</span>
          </div>
          <p className="text-2xl font-display font-bold">{formatPrice(insights.avgPerMeal)}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-xl border border-border p-4"
        >
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <ChefHat className="w-4 h-4" />
            <span className="text-xs font-medium">Meals Cooked</span>
          </div>
          <p className="text-2xl font-display font-bold">{insights.totalMeals}</p>
        </motion.div>
      </div>

      {/* Monthly Spending Chart */}
      {insights.monthlyData.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-xl border border-border p-4"
        >
          <h3 className="font-semibold text-sm flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-primary" />
            Monthly Spending
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={insights.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Cuisine Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-xl border border-border p-4"
        >
          <h3 className="font-semibold text-sm mb-4">Favorite Cuisines</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={insights.cuisineData}
                cx="50%"
                cy="50%"
                outerRadius={70}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {insights.cuisineData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Top Recipes */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card rounded-xl border border-border p-4"
        >
          <h3 className="font-semibold text-sm mb-4">Most Cooked</h3>
          <div className="space-y-3">
            {insights.topRecipes.map((recipe, i) => (
              <div key={recipe.name} className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">
                  {i + 1}
                </span>
                <span className="text-sm flex-1 truncate">{recipe.name}</span>
                <Badge variant="secondary" className="text-[10px] h-5">{recipe.count}x</Badge>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
