import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Loader2, ArrowRightLeft, Leaf, AlertCircle } from "lucide-react";
import { fetchIngredientSubstitutions } from "@/services/aiService";
import { trackError, trackEvent } from "@/lib/telemetry";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";

interface Substitution {
  name: string;
  ratio: string;
  notes: string;
  dietary_tags?: string[];
}

interface IngredientSubstitutionsProps {
  ingredientName: string;
  recipeTitle: string;
}

export default function IngredientSubstitutions({ ingredientName, recipeTitle }: IngredientSubstitutionsProps) {
  const [substitutions, setSubstitutions] = useState<Substitution[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);

  const fetchSubstitutions = async () => {
    setLoading(true);
    setError(null);

    try {
      const results = await fetchIngredientSubstitutions(ingredientName, recipeTitle);
      setSubstitutions(results);
      setFetched(true);
      trackEvent("ingredient_substitutions_success", { ingredientName, count: results.length });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to get substitutions. Try again.");
      trackError("ingredient_substitutions_error", e, { ingredientName });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label={`Find substitutions for ${ingredientName}`}
          onClick={(e) => {
            e.stopPropagation();
            if (!fetched) fetchSubstitutions();
          }}
        >
          <ArrowRightLeft className="w-3 h-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-3 border-b border-border">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm flex items-center gap-1.5">
              <ArrowRightLeft className="w-3.5 h-3.5 text-primary" />
              Substitutes for {ingredientName}
            </h4>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              aria-label="Refresh substitutions"
              onClick={fetchSubstitutions}
              disabled={loading}
            >
              {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
            </Button>
          </div>
        </div>

        <div className="p-2 max-h-64 overflow-y-auto">
          {loading && !fetched && (
            <div className="flex items-center justify-center py-6 text-muted-foreground text-sm">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Finding substitutions...
            </div>
          )}

          {error && (
            <div className="flex items-center justify-between gap-2 p-3 text-sm text-destructive">
              <div className="flex items-center gap-2" role="alert">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{error}</span>
              </div>
              <Button size="sm" variant="outline" className="h-6 px-2 text-[10px]" onClick={fetchSubstitutions}>
                Retry
              </Button>
            </div>
          )}

          {!loading && !error && fetched && (
            <AnimatePresence>
              {substitutions.map((sub, i) => (
                <motion.div
                  key={sub.name}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-2.5 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{sub.name}</span>
                    <Badge variant="outline" className="text-[10px] h-4 px-1">{sub.ratio}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{sub.notes}</p>
                  {sub.dietary_tags && sub.dietary_tags.length > 0 && (
                    <div className="flex gap-1 mt-1.5">
                      {sub.dietary_tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-[9px] h-4 px-1 gap-0.5">
                          <Leaf className="w-2 h-2" /> {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {!loading && !error && !fetched && (
            <div className="text-center py-4">
              <p className="text-xs text-muted-foreground mb-2">Click refresh to find AI-powered substitutions</p>
              <Button size="sm" variant="outline" onClick={fetchSubstitutions} className="text-xs h-7 gap-1">
                <RefreshCw className="w-3 h-3" />
                Find Substitutions
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
