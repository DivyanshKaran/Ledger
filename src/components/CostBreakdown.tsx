import { useMemo } from "react";
import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import type { Ingredient } from "./IngredientInput";

interface CostBreakdownProps {
  ingredients: Ingredient[];
}

const COLORS = [
  "hsl(40, 90%, 55%)",    // saffron
  "hsl(12, 70%, 45%)",    // paprika
  "hsl(95, 25%, 35%)",    // olive
  "hsl(42, 85%, 75%)",    // saffron-light
  "hsl(14, 65%, 60%)",    // paprika-light
  "hsl(95, 20%, 55%)",    // olive-light
  "hsl(38, 85%, 45%)",    // saffron-dark
  "hsl(10, 75%, 35%)",    // paprika-dark
];

export default function CostBreakdown({ ingredients }: CostBreakdownProps) {
  const pieData = useMemo(() => {
    return ingredients.map((ing) => ({
      name: ing.name,
      value: ing.totalPrice,
    }));
  }, [ingredients]);

  const barData = useMemo(() => {
    return ingredients
      .slice()
      .sort((a, b) => b.totalPrice - a.totalPrice)
      .slice(0, 8)
      .map((ing) => ({
        name: ing.name.length > 10 ? ing.name.slice(0, 10) + "..." : ing.name,
        cost: ing.totalPrice,
      }));
  }, [ingredients]);

  const totalCost = useMemo(() => {
    return ingredients.reduce((sum, ing) => sum + ing.totalPrice, 0);
  }, [ingredients]);

  const mostExpensive = useMemo(() => {
    if (ingredients.length === 0) return null;
    return ingredients.reduce((max, ing) => 
      ing.totalPrice > max.totalPrice ? ing : max
    );
  }, [ingredients]);

  if (ingredients.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="recipe-card p-8 text-center"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="mb-4 flex justify-center"
        >
          <BarChart3 className="w-12 h-12 text-muted-foreground" />
        </motion.div>
        <p className="font-display text-lg text-muted-foreground">
          Add ingredients to see cost breakdown
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="recipe-card p-3 sm:p-4"
        >
          <p className="text-xs sm:text-sm text-muted-foreground mb-1">Total Ingredients</p>
          <motion.p
            key={ingredients.length}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            className="text-2xl sm:text-3xl font-display font-semibold text-olive"
          >
            {ingredients.length}
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="recipe-card p-3 sm:p-4"
        >
          <p className="text-xs sm:text-sm text-muted-foreground mb-1">Most Expensive</p>
          <p className="text-base sm:text-lg font-display font-medium text-paprika truncate">
            {mostExpensive?.name || "-"}
          </p>
        </motion.div>
      </div>

      {/* Pie Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="recipe-card p-4 sm:p-6"
      >
        <h3 className="font-display text-lg sm:text-xl font-semibold mb-4 text-center">
          Cost Distribution
        </h3>
        <div className="h-48 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                animationBegin={0}
                animationDuration={800}
              >
                {pieData.map((_, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                    stroke="hsl(var(--card))"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-warm">
                        <p className="font-medium">{payload[0].name}</p>
                        <p className="text-primary font-semibold">
                          ${Number(payload[0].value).toFixed(2)}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-3 sm:mt-4">
          {pieData.slice(0, 5).map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="flex items-center gap-2"
            >
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-xs sm:text-sm text-muted-foreground">{item.name}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Bar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="recipe-card p-4 sm:p-6"
      >
        <h3 className="font-display text-lg sm:text-xl font-semibold mb-4 text-center">
          Cost by Ingredient
        </h3>
        <div className="h-48 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} layout="vertical" margin={{ left: 10, right: 20 }}>
              <XAxis 
                type="number" 
                tickFormatter={(value) => `$${value}`}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={80}
                tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-warm">
                        <p className="font-semibold text-primary">
                          ${Number(payload[0].value).toFixed(2)}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                dataKey="cost" 
                radius={[0, 6, 6, 0]}
                animationDuration={800}
              >
                {barData.map((_, index) => (
                  <Cell 
                    key={`bar-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
