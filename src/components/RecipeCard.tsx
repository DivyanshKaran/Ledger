import { motion } from "framer-motion";
import { Clock, Users } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";

interface RecipeCardProps {
  title: string;
  image: string;
  prepTime: string;
  servings: number;
  estimatedCost: number;
  tags: string[];
  onClick?: () => void;
}

export default function RecipeCard({
  title,
  image,
  prepTime,
  servings,
  estimatedCost,
  tags,
  onClick,
}: RecipeCardProps) {
  const { formatPrice } = useCurrency();

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="recipe-card cursor-pointer group"
      onClick={onClick}
    >
      {/* Image Container with Hover Zoom */}
      <div className="hover-zoom relative aspect-[4/3]">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Tags */}
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 flex flex-wrap gap-1 sm:gap-2">
          {tags.slice(0, 2).map((tag, index) => (
            <motion.span
              key={tag}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium bg-card/90 backdrop-blur-sm rounded-full text-foreground"
            >
              {tag}
            </motion.span>
          ))}
        </div>

        {/* Cost Badge */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-primary px-2 sm:px-3 py-1 sm:py-1.5 rounded-full flex items-center gap-1 shadow-lg"
        >
          <span className="text-xs sm:text-sm font-semibold text-primary-foreground">
            {formatPrice(estimatedCost)}
          </span>
        </motion.div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-5">
        <h3 className="font-display text-base sm:text-xl font-semibold mb-2 sm:mb-3 group-hover:text-primary transition-colors line-clamp-2">
          {title}
        </h3>

        <div className="flex items-center gap-3 sm:gap-4 text-muted-foreground">
          <div className="flex items-center gap-1 sm:gap-1.5">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm">{prepTime}</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5">
            <Users className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm">{servings}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
