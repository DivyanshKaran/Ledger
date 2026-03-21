import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  ChefHat, Plus, Trash2, Clock, Users,
  ListOrdered, Apple, Save, ArrowLeft
} from "lucide-react";
import { Recipe, RecipeIngredient, RecipeStep, NutritionInfo } from "@/data/recipes";
import { useAuth } from "@/hooks/useAuth";
import { useCloudCustomRecipes } from "@/hooks/useCloudData";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import AuthModal from "@/components/AuthModal";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";
import PageSkeleton from "@/components/PageSkeleton";

const DEFAULT_NUTRITION: NutritionInfo = {
  calories: 300,
  protein: 15,
  carbs: 40,
  fat: 12,
  fiber: 4,
  sugar: 5,
  sodium: 500
};

export default function CreateRecipe() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { addCustomRecipe } = useCloudCustomRecipes();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cuisine, setCuisine] = useState("American");
  const [prepTime, setPrepTime] = useState("15 min");
  const [cookTime, setCookTime] = useState("30 min");
  const [servings, setServings] = useState(4);
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([
    { name: "", quantity: 0, unit: "g", pricePerUnit: 0.01 }
  ]);
  const [steps, setSteps] = useState<RecipeStep[]>([
    { id: 1, title: "", description: "", duration: 5 }
  ]);
  const [nutrition, setNutrition] = useState<NutritionInfo>(DEFAULT_NUTRITION);
  const [activeSection, setActiveSection] = useState<"basic" | "ingredients" | "steps" | "nutrition">("basic");

  // Redirect to auth modal if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      setShowAuthModal(true);
    }
  }, [user, authLoading]);

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
    if (!title.trim()) {
      toast.error("Please enter a recipe title");
      return;
    }
    
    const recipe: Recipe = {
      id: `custom-${Date.now()}`,
      title,
      description,
      image: "/src/assets/recipe-pasta.jpg",
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
    
    addCustomRecipe(recipe);
    toast.success("Recipe saved successfully!");
    navigate("/");
  };

  const sections = [
    { id: "basic" as const, label: "Basic Info", icon: ChefHat },
    { id: "ingredients" as const, label: "Ingredients", icon: Apple },
    { id: "steps" as const, label: "Steps", icon: ListOrdered },
    { id: "nutrition" as const, label: "Nutrition", icon: Users }
  ];

  if (authLoading) {
    return <PageSkeleton variant="default" />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar onLogoClick={() => navigate("/")} />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <ChefHat className="w-16 h-16 text-primary mx-auto mb-6" />
          <h1 className="font-display text-3xl font-semibold mb-4">Sign In Required</h1>
          <p className="text-muted-foreground mb-8">
            Please sign in to create and save your own recipes.
          </p>
          <Button size="lg" onClick={() => setShowAuthModal(true)}>
            Sign In to Continue
          </Button>
        </div>
        <AuthModal isOpen={showAuthModal} onClose={() => navigate("/")} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar onLogoClick={() => navigate("/")} />
      
      <div className="max-w-4xl mx-auto px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold">Create New Recipe</h1>
            <p className="text-muted-foreground">Add your own recipes to the collection</p>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex gap-1.5 sm:gap-2 mb-6 sm:mb-8 overflow-x-auto pb-2 scrollbar-thin">
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
        <div className="bg-card rounded-2xl border border-border p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            {activeSection === "basic" && (
              <motion.div
                key="basic"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
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
                    className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none scrollbar-thin"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <div className="max-h-[400px] overflow-y-auto space-y-4 pr-2 scrollbar-thin">
                  {ingredients.map((ingredient, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-3 items-start"
                    >
                      <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                        className="w-16 sm:w-20 px-3 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                      />
                      <button
                        onClick={() => removeIngredient(index)}
                        className="p-2 text-muted-foreground hover:text-accent transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>

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
                <div className="max-h-[400px] overflow-y-auto space-y-4 pr-2 scrollbar-thin">
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
                        className="w-full px-3 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm resize-none mb-2 scrollbar-thin"
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
                </div>

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
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

        {/* Save Button */}
        <div className="flex justify-end gap-3 sm:gap-4 mt-6 sm:mt-8">
          <Button variant="outline" size="lg" onClick={() => navigate("/")}>
            Cancel
          </Button>
          <Button
            size="lg"
            onClick={handleSave}
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            Save Recipe
          </Button>
        </div>
      </div>
    </div>
  );
}
