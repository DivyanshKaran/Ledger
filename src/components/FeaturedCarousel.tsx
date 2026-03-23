import { motion } from "framer-motion";
import { Clock, Users, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Recipe, calculateRecipeCost } from "@/data/recipes";
import { useCurrency } from "@/hooks/useCurrency";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";

// Import images dynamically using eager loading
const imageModules = import.meta.glob<{ default: string }>('@/assets/recipe-*.jpg', { eager: true });

const getImageUrl = (imagePath: string): string => {
  const filename = imagePath.split('/').pop();
  const key = `/src/assets/${filename}`;
  return imageModules[key]?.default || imagePath;
};

interface FeaturedCarouselProps {
  recipes: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
}

export default function FeaturedCarousel({ recipes, onSelectRecipe }: FeaturedCarouselProps) {
  const { formatPrice } = useCurrency();
  
  // Get featured recipes (first 6)
  const featuredRecipes = recipes.slice(0, 6);

  return (
    <section className="py-14 sm:py-20 lg:py-24 bg-gradient-to-b from-background to-muted/20 section-divider">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-xs sm:text-sm font-semibold tracking-[0.16em] text-primary/80">Featured</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold">
              Popular Recipes
            </h2>
          </div>
        </motion.div>

        {/* Mobile Grid */}
        <div className="grid grid-cols-1 gap-4 sm:hidden">
          {featuredRecipes.map((recipe, index) => {
            const imageUrl = getImageUrl(recipe.image);
            const totalCost = calculateRecipeCost(recipe.ingredients, recipe.servings, recipe.servings);
            return (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                onClick={() => onSelectRecipe(recipe)}
                className="group cursor-pointer"
              >
                <div className="relative rounded-2xl overflow-hidden bg-card border border-border/70 shadow-warm hover:shadow-warm-lg transition-all duration-300 hover:border-primary/30">
                  <div className="relative aspect-[4/3] overflow-hidden image-shell">
                    <img
                      src={imageUrl}
                      alt={recipe.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/40 to-transparent" />
                    <div className="absolute top-3 right-3 bg-primary px-3 py-1.5 rounded-full shadow-warm price-sheen">
                      <span className="text-sm font-bold text-primary-foreground">
                        {formatPrice(totalCost)}
                      </span>
                    </div>
                    <div className="absolute top-3 left-3">
                      <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
                        {recipe.difficulty || "Medium"}
                      </Badge>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="font-display text-lg font-semibold text-background mb-2 line-clamp-1 text-shadow-soft">
                        {recipe.title}
                      </h3>
                      <div className="flex items-center gap-4 text-background/80 text-sm">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          <span>{recipe.totalTime}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="w-4 h-4" />
                          <span>{recipe.servings} servings</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Carousel (Desktop/Tablet) */}
        <div className="hidden sm:block">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {featuredRecipes.map((recipe, index) => {
                const imageUrl = getImageUrl(recipe.image);
                const totalCost = calculateRecipeCost(recipe.ingredients, recipe.servings, recipe.servings);
                
                return (
                  <CarouselItem key={recipe.id} className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => onSelectRecipe(recipe)}
                      className="group cursor-pointer"
                    >
                      <div className="relative rounded-2xl overflow-hidden bg-card border border-border/70 shadow-warm hover:shadow-warm-lg transition-all duration-300 hover:border-primary/30">
                        {/* Image */}
                        <div className="relative aspect-[4/3] overflow-hidden image-shell">
                          <img
                            src={imageUrl}
                            alt={recipe.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/40 to-transparent" />
                          
                          {/* Price Badge */}
                          <div className="absolute top-3 right-3 bg-primary px-3 py-1.5 rounded-full shadow-warm price-sheen">
                            <span className="text-sm font-bold text-primary-foreground">
                              {formatPrice(totalCost)}
                            </span>
                          </div>

                          {/* Difficulty Badge */}
                          <div className="absolute top-3 left-3">
                            <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
                              {recipe.difficulty || "Medium"}
                            </Badge>
                          </div>

                          {/* Info Overlay */}
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <h3 className="font-display text-lg sm:text-xl font-semibold text-background mb-2 line-clamp-1 text-shadow-soft">
                              {recipe.title}
                            </h3>
                            <div className="flex items-center gap-4 text-background/80 text-sm">
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4" />
                                <span>{recipe.totalTime}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Users className="w-4 h-4" />
                                <span>{recipe.servings} servings</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            
            {/* Navigation Buttons */}
            <div className="hidden sm:block">
              <CarouselPrevious className="left-0 -translate-x-1/2 bg-card border-border shadow-lg hover:bg-muted" />
              <CarouselNext className="right-0 translate-x-1/2 bg-card border-border shadow-lg hover:bg-muted" />
            </div>
          </Carousel>
        </div>
      </div>
    </section>
  );
}
