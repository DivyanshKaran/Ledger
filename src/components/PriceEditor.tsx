import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, Edit3, X, Check, Save } from "lucide-react";
import { RecipeIngredient } from "@/data/recipes";
import { useIngredientPrices } from "@/hooks/useCloudData";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface PriceEditorProps {
  ingredients: RecipeIngredient[];
  onPricesUpdated?: () => void;
}

export default function PriceEditor({ ingredients, onPricesUpdated }: PriceEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const { user } = useAuth();
  const { prices, updatePrice, getPrice } = useIngredientPrices();

  const handleEdit = (index: number, currentPrice: number) => {
    setEditingIndex(index);
    setEditValue(currentPrice.toFixed(2));
  };

  const handleSave = async (ingredient: RecipeIngredient) => {
    const newPrice = parseFloat(editValue);
    if (isNaN(newPrice) || newPrice < 0) {
      toast.error("Please enter a valid price");
      return;
    }

    await updatePrice(ingredient.name, newPrice, ingredient.unit);
    setEditingIndex(null);
    toast.success(`Updated ${ingredient.name} price`);
    onPricesUpdated?.();
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setEditValue("");
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-muted rounded-lg hover:bg-muted/80 transition-colors"
      >
        <DollarSign className="w-4 h-4" />
        Edit Prices
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-2xl w-full max-w-lg max-h-[80vh] shadow-warm-lg overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-5 border-b border-border flex items-center justify-between flex-shrink-0">
                <div>
                  <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-primary" />
                    Edit Ingredient Prices
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Customize prices based on your local grocery store
                  </p>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-muted rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Ingredient List */}
              <div className="flex-1 overflow-y-auto divide-y divide-border">
                {ingredients.map((ingredient, index) => {
                  const customPrice = getPrice(ingredient.name, ingredient.pricePerUnit);
                  const isEditing = editingIndex === index;
                  const hasCustomPrice = prices.has(ingredient.name.toLowerCase());

                  return (
                    <div
                      key={ingredient.name}
                      className="p-4 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{ingredient.name}</p>
                          <p className="text-sm text-muted-foreground">
                            per {ingredient.unit}
                            {hasCustomPrice && (
                              <span className="ml-2 text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                                Custom
                              </span>
                            )}
                          </p>
                        </div>

                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                              <input
                                type="number"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                step="0.01"
                                min="0"
                                autoFocus
                                className="w-24 pl-7 pr-3 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleSave(ingredient);
                                  if (e.key === "Escape") handleCancel();
                                }}
                              />
                            </div>
                            <button
                              onClick={() => handleSave(ingredient)}
                              className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={handleCancel}
                              className="p-2 bg-muted rounded-lg hover:bg-muted/80"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-primary">
                              ${customPrice.toFixed(2)}
                            </span>
                            <button
                              onClick={() => handleEdit(index, customPrice)}
                              className="p-2 hover:bg-muted rounded-lg transition-colors"
                            >
                              <Edit3 className="w-4 h-4 text-muted-foreground" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-border bg-muted/30 flex-shrink-0">
                <p className="text-xs text-muted-foreground text-center">
                  Custom prices are saved to your account and apply across all recipes
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
