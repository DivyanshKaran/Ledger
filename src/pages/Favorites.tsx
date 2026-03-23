 import { useNavigate } from "react-router-dom";
 import { motion } from "framer-motion";
 import { Heart, ArrowLeft, ChefHat, Clock, Users, Trash2 } from "lucide-react";
 import { useCloudFavorites } from "@/hooks/useCloudData";
 import { calculateRecipeCost } from "@/data/recipes";
 import { useAllRecipes } from "@/hooks/useRecipes";
 import { useCurrency } from "@/hooks/useCurrency";
 import { Button } from "@/components/ui/button";
 import { Badge } from "@/components/ui/badge";
 import Navbar from "@/components/Navbar";
 import PageTransition from "@/components/PageTransition";
 import PageSkeleton from "@/components/PageSkeleton";

 export default function Favorites() {
   const navigate = useNavigate();
   const { formatPrice } = useCurrency();

   const { favoriteIds, toggleFavorite, loading: favoritesLoading } = useCloudFavorites();
   const { recipes: allRecipes, loading: recipesLoading } = useAllRecipes();

   const favoriteRecipes = allRecipes.filter((r) => favoriteIds.has(r.id));
 
  if (favoritesLoading || recipesLoading) {
    return <PageSkeleton variant="favorites" />;
  }

  return (
    <PageTransition>
    <div className="min-h-screen bg-background">
       <Navbar onLogoClick={() => navigate("/")} />
 
       <div className="max-w-6xl mx-auto px-4 py-4 sm:py-8">
         {/* Back Button */}
         <Button
           variant="ghost"
           size="sm"
           onClick={() => navigate(-1)}
           className="mb-6 gap-2"
         >
           <ArrowLeft className="w-4 h-4" />
           Back
         </Button>
 
         {/* Header */}
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="flex items-center gap-3 mb-8"
         >
           <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
             <Heart className="w-6 h-6 text-accent-foreground fill-current" />
           </div>
           <div>
             <h1 className="font-display text-2xl sm:text-3xl font-bold">My Favorites</h1>
             <p className="text-muted-foreground">
               {favoriteRecipes.length} saved recipe{favoriteRecipes.length !== 1 ? "s" : ""}
             </p>
           </div>
         </motion.div>
 
         {/* Recipes Grid */}
         {favoriteRecipes.length > 0 ? (
           <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
             {favoriteRecipes.map((recipe, index) => {
               const totalCost = calculateRecipeCost(recipe.ingredients, recipe.servings, recipe.servings);
 
               return (
                 <motion.div
                   key={recipe.id}
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: index * 0.05 }}
                   whileHover={{ y: -4 }}
                 className="bg-card rounded-2xl border border-border/70 overflow-hidden cursor-pointer hover:border-primary/50 hover:shadow-warm transition-all group relative"
               >
                   {/* Remove button */}
                   <button
                     onClick={(e) => {
                       e.stopPropagation();
                       toggleFavorite(recipe.id);
                     }}
                     className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
 
                   <div onClick={() => navigate(`/recipe/${recipe.id}`)}>
                     <div className="aspect-[4/3] bg-muted relative overflow-hidden image-shell">
                       <ChefHat className="w-8 h-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-muted-foreground/30" />
                       <div className="absolute bottom-2 left-2">
                         <Badge variant="secondary" className="text-xs">
                           {recipe.cuisine}
                         </Badge>
                       </div>
                       <div className="absolute top-2 left-2 bg-primary px-2 py-1 rounded-full">
                         <span className="text-xs font-semibold text-primary-foreground">
                           {formatPrice(totalCost)}
                         </span>
                       </div>
                     </div>
                     <div className="p-3">
                       <h3 className="font-medium truncate mb-1 group-hover:text-primary transition-colors">
                         {recipe.title}
                       </h3>
                       <div className="flex items-center gap-3 text-xs text-muted-foreground">
                         <span className="flex items-center gap-1">
                           <Clock className="w-3 h-3" />
                           {recipe.totalTime}
                         </span>
                         <span className="flex items-center gap-1">
                           <Users className="w-3 h-3" />
                           {recipe.servings}
                         </span>
                       </div>
                     </div>
                   </div>
                 </motion.div>
               );
             })}
           </div>
         ) : (
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="bg-muted/30 rounded-2xl p-12 text-center"
           >
             <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
             <h2 className="font-display text-xl font-semibold mb-2">No favorites yet</h2>
             <p className="text-muted-foreground mb-6">
               Start exploring recipes and save your favorites for quick access
             </p>
             <Button onClick={() => navigate("/")}>Browse Recipes</Button>
           </motion.div>
         )}
      </div>
    </div>
    </PageTransition>
  );
 }
