import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Search, Utensils, ShoppingCart } from "lucide-react";

const INGREDIENT_DATABASE = [
  { name: "Tomatoes", unit: "kg", pricePerUnit: 3.50 },
  { name: "Olive Oil", unit: "ml", pricePerUnit: 0.02 },
  { name: "Garlic", unit: "cloves", pricePerUnit: 0.25 },
  { name: "Basil", unit: "bunch", pricePerUnit: 2.00 },
  { name: "Onion", unit: "kg", pricePerUnit: 1.50 },
  { name: "Chicken Breast", unit: "kg", pricePerUnit: 12.00 },
  { name: "Pasta", unit: "g", pricePerUnit: 0.005 },
  { name: "Parmesan", unit: "g", pricePerUnit: 0.04 },
  { name: "Salt", unit: "g", pricePerUnit: 0.001 },
  { name: "Black Pepper", unit: "g", pricePerUnit: 0.05 },
  { name: "Butter", unit: "g", pricePerUnit: 0.01 },
  { name: "Flour", unit: "g", pricePerUnit: 0.002 },
  { name: "Sugar", unit: "g", pricePerUnit: 0.003 },
  { name: "Eggs", unit: "pcs", pricePerUnit: 0.30 },
  { name: "Milk", unit: "ml", pricePerUnit: 0.002 },
  { name: "Cream", unit: "ml", pricePerUnit: 0.006 },
  { name: "Lemon", unit: "pcs", pricePerUnit: 0.50 },
  { name: "Carrots", unit: "kg", pricePerUnit: 2.00 },
  { name: "Potatoes", unit: "kg", pricePerUnit: 1.80 },
  { name: "Bell Pepper", unit: "pcs", pricePerUnit: 1.20 },
  { name: "Mushrooms", unit: "g", pricePerUnit: 0.015 },
  { name: "Spinach", unit: "g", pricePerUnit: 0.02 },
  { name: "Rice", unit: "g", pricePerUnit: 0.003 },
  { name: "Bread", unit: "loaf", pricePerUnit: 3.50 },
  { name: "Thyme", unit: "bunch", pricePerUnit: 1.80 },
];

export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalPrice: number;
}

interface IngredientInputProps {
  ingredients: Ingredient[];
  onAddIngredient: (ingredient: Ingredient) => void;
  onRemoveIngredient: (id: string) => void;
  onUpdateIngredient: (id: string, updates: Partial<Ingredient>) => void;
}

export default function IngredientInput({
  ingredients,
  onAddIngredient,
  onRemoveIngredient,
  onUpdateIngredient,
}: IngredientInputProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredIngredients = INGREDIENT_DATABASE.filter(
    (ing) =>
      ing.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !ingredients.some((added) => added.name === ing.name)
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectIngredient = (ingredient: typeof INGREDIENT_DATABASE[0]) => {
    const newIngredient: Ingredient = {
      id: crypto.randomUUID(),
      name: ingredient.name,
      quantity: 1,
      unit: ingredient.unit,
      pricePerUnit: ingredient.pricePerUnit,
      totalPrice: ingredient.pricePerUnit,
    };
    onAddIngredient(newIngredient);
    setSearchTerm("");
    setIsDropdownOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, filteredIngredients.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && filteredIngredients[selectedIndex]) {
      e.preventDefault();
      handleSelectIngredient(filteredIngredients[selectedIndex]);
    } else if (e.key === "Escape") {
      setIsDropdownOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative" ref={dropdownRef}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsDropdownOpen(true);
              setSelectedIndex(0);
            }}
            onFocus={() => setIsDropdownOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search ingredients..."
            className="ingredient-input pl-12 pr-4"
          />
        </div>

        {/* Animated Dropdown */}
        <AnimatePresence>
          {isDropdownOpen && filteredIngredients.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute z-50 w-full mt-2 dropdown-menu max-h-64 overflow-auto"
            >
              {filteredIngredients.map((ingredient, index) => (
                <motion.button
                  key={ingredient.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => handleSelectIngredient(ingredient)}
                  className={`w-full px-4 py-3 text-left flex items-center justify-between hover:bg-muted transition-colors ${
                    index === selectedIndex ? "bg-muted" : ""
                  }`}
                >
                  <span className="font-medium">{ingredient.name}</span>
                  <span className="text-sm text-muted-foreground">
                    ${ingredient.pricePerUnit.toFixed(2)}/{ingredient.unit}
                  </span>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Added Ingredients List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {ingredients.map((ingredient, index) => (
            <motion.div
              key={ingredient.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: -100, scale: 0.9 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="recipe-card p-3 sm:p-4"
            >
              <div className="flex items-center gap-2 sm:gap-4">
                {/* Ingredient Icon */}
                <motion.div
                  initial={{ rotate: -180, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-saffron-gradient flex items-center justify-center flex-shrink-0"
                >
                  <Utensils className="w-5 h-5 text-primary-foreground" />
                </motion.div>

                {/* Ingredient Details */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
                  <span className="font-display font-medium text-base sm:text-lg col-span-1 truncate">
                    {ingredient.name}
                  </span>
                  
                  <div className="flex items-center gap-2 col-span-1">
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={ingredient.quantity}
                      onChange={(e) => {
                        const quantity = parseFloat(e.target.value) || 0;
                        onUpdateIngredient(ingredient.id, {
                          quantity,
                          totalPrice: quantity * ingredient.pricePerUnit,
                        });
                      }}
                      className="w-16 sm:w-20 px-2 sm:px-3 py-2 bg-muted rounded-lg text-center font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <span className="text-muted-foreground">{ingredient.unit}</span>
                  </div>

                  <div className="text-sm text-muted-foreground col-span-1">
                    ${ingredient.pricePerUnit.toFixed(2)}/{ingredient.unit}
                  </div>

                  <div className="flex items-center justify-between col-span-1">
                    <motion.span
                      key={ingredient.totalPrice}
                      initial={{ scale: 1.2, color: "hsl(var(--saffron))" }}
                      animate={{ scale: 1, color: "hsl(var(--foreground))" }}
                      className="font-semibold text-lg"
                    >
                      ${ingredient.totalPrice.toFixed(2)}
                    </motion.span>
                    
                    <button
                      onClick={() => onRemoveIngredient(ingredient.id)}
                      className="p-2 rounded-full hover:bg-destructive/10 text-destructive transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {ingredients.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 text-muted-foreground"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="mb-4 flex justify-center"
          >
            <ShoppingCart className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground/50" />
          </motion.div>
          <p className="font-display text-base sm:text-lg">Start adding ingredients above!</p>
        </motion.div>
      )}
    </div>
  );
}
