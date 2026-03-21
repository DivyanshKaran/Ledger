import { motion } from "framer-motion";
import { Flame, Wheat, Droplets, Apple, Cookie, Zap } from "lucide-react";
import { NutritionInfo } from "@/data/recipes";

interface NutritionPanelProps {
  nutrition: NutritionInfo;
  servings: number;
  baseServings: number;
}

const DAILY_VALUES = {
  calories: 2000,
  protein: 50,
  carbs: 300,
  fat: 65,
  fiber: 25,
  sugar: 50,
  sodium: 2300,
};

export default function NutritionPanel({ nutrition, servings, baseServings }: NutritionPanelProps) {
  const multiplier = servings / baseServings;
  
  const scaledNutrition = {
    calories: Math.round(nutrition.calories * multiplier),
    protein: Math.round(nutrition.protein * multiplier),
    carbs: Math.round(nutrition.carbs * multiplier),
    fat: Math.round(nutrition.fat * multiplier),
    fiber: Math.round(nutrition.fiber * multiplier),
    sugar: Math.round(nutrition.sugar * multiplier),
    sodium: Math.round(nutrition.sodium * multiplier),
  };

  const macros = [
    { 
      name: "Protein", 
      value: scaledNutrition.protein, 
      unit: "g", 
      color: "hsl(12, 70%, 45%)", // paprika
      icon: Zap,
      daily: Math.round((scaledNutrition.protein / DAILY_VALUES.protein) * 100),
    },
    { 
      name: "Carbs", 
      value: scaledNutrition.carbs, 
      unit: "g", 
      color: "hsl(40, 90%, 55%)", // saffron
      icon: Wheat,
      daily: Math.round((scaledNutrition.carbs / DAILY_VALUES.carbs) * 100),
    },
    { 
      name: "Fat", 
      value: scaledNutrition.fat, 
      unit: "g", 
      color: "hsl(95, 25%, 35%)", // olive
      icon: Droplets,
      daily: Math.round((scaledNutrition.fat / DAILY_VALUES.fat) * 100),
    },
  ];

  const otherNutrients = [
    { name: "Fiber", value: scaledNutrition.fiber, unit: "g", daily: Math.round((scaledNutrition.fiber / DAILY_VALUES.fiber) * 100) },
    { name: "Sugar", value: scaledNutrition.sugar, unit: "g", daily: Math.round((scaledNutrition.sugar / DAILY_VALUES.sugar) * 100) },
    { name: "Sodium", value: scaledNutrition.sodium, unit: "mg", daily: Math.round((scaledNutrition.sodium / DAILY_VALUES.sodium) * 100) },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="recipe-card overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-border bg-muted/30">
        <h3 className="font-display text-lg font-semibold flex items-center gap-2">
          <Apple className="w-5 h-5 text-primary" />
          Nutrition Facts
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Per serving ({servings} servings total)
        </p>
      </div>

      <div className="p-5 space-y-6">
        {/* Calories - Featured */}
        <div className="text-center py-4 bg-gradient-to-br from-primary/10 to-accent/5 rounded-xl">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Flame className="w-6 h-6 text-accent" />
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Calories
            </span>
          </div>
          <motion.p
            key={scaledNutrition.calories}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className="text-5xl font-display font-bold text-foreground"
          >
            {scaledNutrition.calories}
          </motion.p>
          <p className="text-sm text-muted-foreground mt-1">
            {Math.round((scaledNutrition.calories / DAILY_VALUES.calories) * 100)}% daily value
          </p>
        </div>

        {/* Macros Grid */}
        <div className="grid grid-cols-3 gap-3">
          {macros.map((macro, index) => {
            const Icon = macro.icon;
            return (
              <motion.div
                key={macro.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-3 rounded-xl bg-muted/30"
              >
                <div 
                  className="w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2"
                  style={{ backgroundColor: `${macro.color}20` }}
                >
                  <Icon 
                    className="w-5 h-5" 
                    style={{ color: macro.color }} 
                  />
                </div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  {macro.name}
                </p>
                <motion.p
                  key={macro.value}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className="text-xl font-semibold mt-1"
                >
                  {macro.value}
                  <span className="text-sm text-muted-foreground ml-0.5">
                    {macro.unit}
                  </span>
                </motion.p>
                
                {/* Progress bar */}
                <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(macro.daily, 100)}%` }}
                    transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: macro.color }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {macro.daily}% DV
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Other Nutrients */}
        <div className="space-y-3">
          {otherNutrients.map((nutrient, index) => (
            <motion.div
              key={nutrient.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              className="flex items-center justify-between py-2 border-b border-border last:border-0"
            >
              <span className="text-sm text-muted-foreground">
                {nutrient.name}
              </span>
              <div className="flex items-center gap-3">
                <span className="font-medium">
                  {nutrient.value}
                  <span className="text-muted-foreground ml-0.5">
                    {nutrient.unit}
                  </span>
                </span>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {nutrient.daily}% DV
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground text-center pt-2">
          * Percent Daily Values are based on a 2,000 calorie diet
        </p>
      </div>
    </motion.div>
  );
}
