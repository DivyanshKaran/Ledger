import { Leaf, Sprout, Wheat, Droplet, Shield, Flame, TrendingDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "./ui/badge";

export const DIETARY_OPTIONS: { value: string; label: string; icon: LucideIcon }[] = [
  { value: "vegetarian", label: "Vegetarian", icon: Leaf },
  { value: "vegan",      label: "Vegan",      icon: Sprout },
  { value: "gluten-free",label: "Gluten-Free",icon: Wheat },
  { value: "dairy-free", label: "Dairy-Free", icon: Droplet },
  { value: "nut-free",   label: "Nut-Free",   icon: Shield },
  { value: "keto",       label: "Keto",        icon: Flame },
  { value: "low-carb",   label: "Low-Carb",   icon: TrendingDown },
];

interface DietaryFiltersProps {
  selected: string[];
  onChange: (tags: string[]) => void;
}

export default function DietaryFilters({ selected, onChange }: DietaryFiltersProps) {
  const toggleTag = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter(t => t !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
      <span className="text-xs text-muted-foreground self-center flex-shrink-0 pr-1">Diet:</span>
      {DIETARY_OPTIONS.map(option => {
        const isActive = selected.includes(option.value);
        return (
          <Badge
            key={option.value}
            variant={isActive ? "default" : "outline"}
            className={`cursor-pointer flex-shrink-0 text-[10px] sm:text-xs h-6 px-2 gap-1 transition-all hover:scale-105 ${
              isActive ? "shadow-sm shadow-primary/20" : "hover:bg-muted"
            }`}
            onClick={() => toggleTag(option.value)}
          >
            <option.icon className="w-3 h-3" />
            {option.label}
          </Badge>
        );
      })}
    </div>
  );
}
