import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Plus, Trash2, ChefHat, Clock, Users, DollarSign,
  ListOrdered, Apple, Save
} from "lucide-react";
import { Recipe, RecipeIngredient, RecipeStep, NutritionInfo } from "@/data/recipes";

interface CustomRecipeFormProps {
  onSave: (recipe: Recipe) => void;
  onClose: () => void;
  editRecipe?: Recipe | null;
}

const DEFAULT_NUTRITION: NutritionInfo = {
  calories: 300,
  protein: 15,
  carbs: 40,
  fat: 12,
  fiber: 4,
  sugar: 5,
  sodium: 500
};

export default function CustomRecipeForm({ onSave, onClose, editRecipe }: CustomRecipeFormProps) {
  const [title, setTitle] = useState(editRecipe?.title || "");
  const [description, setDescription] = useState(editRecipe?.description || "");
  const [cuisine, setCuisine] = useState(editRecipe?.cuisine || "American");
  const [prepTime, setPrepTime] = useState(editRecipe?.prepTime || "15 min");
  const [cookTime, setCookTime] = useState(editRecipe?.cookTime || "30 min");
  const [servings, setServings] = useState(editRecipe?.servings || 4);
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>(
    editRecipe?.ingredients || [{ name: "", quantity: 0, unit: "g", pricePerUnit: 0.01 }]
  );
  const [steps, setSteps] = useState<RecipeStep[]>(
    editRecipe?.steps || [{ id: 1, title: "", description: "", duration: 5 }]
  );
  const [nutrition, setNutrition] = useState<NutritionInfo>(editRecipe?.nutrition || DEFAULT_NUTRITION);
  const [activeSection, setActiveSection] = useState<"basic" | "ingredients" | "steps" | "nutrition">("basic");

  const addIngredient = () => {
    setIngredients([...ingredients, { name: "", quantity: 0, unit: "g", pricePerUnit: 0.01 }]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: keyof RecipeIngredient, value: string | number) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  const addStep = () => {
    setSteps([...steps, { id: steps.length + 1, title: "", description: "", duration: 5 }]);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index).map((s, i) => ({ ...s, id: i + 1 })));
  };

  const updateStep = (index: number, field: keyof RecipeStep, value: string | number) => {
    const updated = [...steps];
    updated[index] = { ...updated[index], [field]: value };
    setSteps(updated);
  };

  const calculateTotalTime = () => {
    const prep = parseInt(prepTime) || 0;
    const cook = parseInt(cookTime) || 0;
    return `${prep + cook} min`;
  };

  const handleSave = () => {
    if (!title.trim()) return;
    
    const recipe: Recipe = {
      id: editRecipe?.id || `custom-${Date.now()}`,
      title,
      description,
      image: editRecipe?.image || "/src/assets/recipe-pasta.jpg",
      cuisine,
      prepTime,
      cookTime,
      totalTime: calculateTotalTime(),
      servings,
      tags: ["Custom", cuisine],
      ingredients: ingredients.filter(i => i.name.trim()),
      steps: steps.filter(s => s.title.trim()),
      nutrition
    };
    
    onSave(recipe);
  };

  const sections = [
    { id: "basic" as const, label: "Basic Info", icon: ChefHat },
    { id: "ingredients" as const, label: "Ingredients", icon: Apple },
    { id: "steps" as const, label: "Steps", icon: ListOrdered },
    { id: "nutrition" as const, label: "Nutrition", icon: DollarSign }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-card rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-warm-lg flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-saffron-gradient flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold">
                {editRecipe ? "Edit Recipe" : "Create Custom Recipe"}
              </h2>
              <p className="text-sm text-muted-foreground">Add your own recipes to the collection</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Tabs */}
        <div className="flex flex-wrap gap-2 p-4 border-b border-border">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  activeSection === section.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <Icon className="w-4 h-4" />
                {section.label}
              </button>
            );
          })}
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {activeSection === "basic" && (
              <motion.div
                key="basic"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium mb-2">Recipe Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Grandma's Apple Pie"
                    className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="A short description of your recipe..."
                    rows={3}
                    className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Cuisine</label>
                    <select
                      value={cuisine}
                      onChange={(e) => setCuisine(e.target.value)}
                      className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      {["American", "Italian", "Indian", "Mexican", "Japanese", "Chinese", "French", "Thai", "Other"].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Servings</label>
                    <input
                      type="number"
                      value={servings}
                      onChange={(e) => setServings(parseInt(e.target.value) || 1)}
                      min={1}
                      className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Prep Time</label>
                    <input
                      type="text"
                      value={prepTime}
                      onChange={(e) => setPrepTime(e.target.value)}
                      placeholder="e.g., 15 min"
                      className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Cook Time</label>
                    <input
                      type="text"
                      value={cookTime}
                      onChange={(e) => setCookTime(e.target.value)}
                      placeholder="e.g., 30 min"
                      className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {activeSection === "ingredients" && (
              <motion.div
                key="ingredients"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {ingredients.map((ingredient, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3 items-start"
                  >
                    <div className="flex-1 grid grid-cols-4 gap-2">
                      <input
                        type="text"
                        value={ingredient.name}
                        onChange={(e) => updateIngredient(index, "name", e.target.value)}
                        placeholder="Ingredient name"
                        className="col-span-2 px-3 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                      />
                      <input
                        type="number"
                        value={ingredient.quantity || ""}
                        onChange={(e) => updateIngredient(index, "quantity", parseFloat(e.target.value) || 0)}
                        placeholder="Qty"
                        className="px-3 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                      />
                      <select
                        value={ingredient.unit}
                        onChange={(e) => updateIngredient(index, "unit", e.target.value)}
                        className="px-3 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                      >
                        {["g", "kg", "ml", "L", "pcs", "cups", "tbsp", "tsp", "oz", "lb"].map(u => (
                          <option key={u} value={u}>{u}</option>
                        ))}
                      </select>
                    </div>
                    <input
                      type="number"
                      value={ingredient.pricePerUnit || ""}
                      onChange={(e) => updateIngredient(index, "pricePerUnit", parseFloat(e.target.value) || 0)}
                      placeholder="$/unit"
                      step="0.01"
                      className="w-20 px-3 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                    />
                    <button
                      onClick={() => removeIngredient(index)}
                      className="p-2 text-muted-foreground hover:text-accent transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}

                <button
                  onClick={addIngredient}
                  className="w-full p-3 border border-dashed border-border rounded-xl hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2 text-muted-foreground hover:text-primary"
                >
                  <Plus className="w-4 h-4" />
                  Add Ingredient
                </button>
              </motion.div>
            )}

            {activeSection === "steps" && (
              <motion.div
                key="steps"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {steps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="recipe-card p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </span>
                      <button
                        onClick={() => removeStep(index)}
                        className="p-1 text-muted-foreground hover:text-accent"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <input
                      type="text"
                      value={step.title}
                      onChange={(e) => updateStep(index, "title", e.target.value)}
                      placeholder="Step title (e.g., Preheat oven)"
                      className="w-full px-3 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm mb-2"
                    />
                    
                    <textarea
                      value={step.description}
                      onChange={(e) => updateStep(index, "description", e.target.value)}
                      placeholder="Step instructions..."
                      rows={2}
                      className="w-full px-3 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm resize-none mb-2"
                    />
                    
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <input
                        type="number"
                        value={step.duration || ""}
                        onChange={(e) => updateStep(index, "duration", parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="w-20 px-3 py-1 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                      />
                      <span className="text-sm text-muted-foreground">minutes</span>
                    </div>
                  </motion.div>
                ))}

                <button
                  onClick={addStep}
                  className="w-full p-3 border border-dashed border-border rounded-xl hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2 text-muted-foreground hover:text-primary"
                >
                  <Plus className="w-4 h-4" />
                  Add Step
                </button>
              </motion.div>
            )}

            {activeSection === "nutrition" && (
              <motion.div
                key="nutrition"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <p className="text-sm text-muted-foreground mb-4">
                  Enter nutrition information per serving (optional)
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: "calories", label: "Calories", unit: "kcal" },
                    { key: "protein", label: "Protein", unit: "g" },
                    { key: "carbs", label: "Carbs", unit: "g" },
                    { key: "fat", label: "Fat", unit: "g" },
                    { key: "fiber", label: "Fiber", unit: "g" },
                    { key: "sugar", label: "Sugar", unit: "g" },
                    { key: "sodium", label: "Sodium", unit: "mg" }
                  ].map(({ key, label, unit }) => (
                    <div key={key}>
                      <label className="block text-sm font-medium mb-2">{label} ({unit})</label>
                      <input
                        type="number"
                        value={nutrition[key as keyof NutritionInfo] || ""}
                        onChange={(e) => setNutrition(prev => ({
                          ...prev,
                          [key]: parseFloat(e.target.value) || 0
                        }))}
                        className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex items-center justify-between flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="flex items-center gap-2 px-6 py-2 bg-saffron-gradient text-primary-foreground rounded-xl font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            Save Recipe
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
