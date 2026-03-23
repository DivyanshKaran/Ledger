import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Search, X, Clock, ChefHat, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Recipe } from "@/data/recipes";
import { Author } from "@/hooks/useAuthors";
import { useCurrency } from "@/hooks/useCurrency";
 
 interface GlobalSearchProps {
   recipes: Recipe[];
   authors: Author[];
   onClose?: () => void;
   isOpen: boolean;
 }
 
 export default function GlobalSearch({ recipes, authors, onClose, isOpen }: GlobalSearchProps) {
   const [query, setQuery] = useState("");
   const [debouncedQuery, setDebouncedQuery] = useState("");
   const [activeIndex, setActiveIndex] = useState(0);
   const inputRef = useRef<HTMLInputElement>(null);
   const navigate = useNavigate();
   const { formatPrice } = useCurrency();
 
   useEffect(() => {
     const timer = setTimeout(() => {
       setDebouncedQuery(query);
     }, 200);
     return () => clearTimeout(timer);
   }, [query]);
 
   useEffect(() => {
     if (isOpen && inputRef.current) {
       inputRef.current.focus();
     }
   }, [isOpen]);
 
   // Filter recipes
   const filteredRecipes = debouncedQuery.length >= 2
     ? recipes.filter(
         (r) =>
           r.title.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
           r.description.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
           r.cuisine.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
           r.tags?.some((t) => t.toLowerCase().includes(debouncedQuery.toLowerCase()))
       ).slice(0, 5)
     : [];
 
   // Filter authors
   const filteredAuthors = debouncedQuery.length >= 2
     ? authors.filter(
         (a) =>
           a.display_name?.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
           a.bio?.toLowerCase().includes(debouncedQuery.toLowerCase())
       ).slice(0, 3)
     : [];
 
   const handleRecipeClick = (recipeId: string) => {
     navigate(`/recipe/${recipeId}`);
     setQuery("");
     onClose?.();
   };
 
   const handleAuthorClick = (authorUserId: string) => {
     navigate(`/author/${authorUserId}`);
     setQuery("");
     onClose?.();
   };
 
   const hasResults = filteredRecipes.length > 0 || filteredAuthors.length > 0;
   const resultItems = [
     ...filteredRecipes.map((recipe) => ({ type: "recipe" as const, id: recipe.id })),
     ...filteredAuthors.map((author) => ({ type: "author" as const, id: author.user_id })),
   ];

   useEffect(() => {
     setActiveIndex(0);
   }, [debouncedQuery, isOpen]);

   useEffect(() => {
     if (!isOpen) return;

     const onKeyDown = (event: KeyboardEvent) => {
       if (event.key === "Escape") {
         event.preventDefault();
         onClose?.();
         return;
       }

       if (!resultItems.length) return;

       if (event.key === "ArrowDown") {
         event.preventDefault();
         setActiveIndex((prev) => (prev + 1) % resultItems.length);
         return;
       }

       if (event.key === "ArrowUp") {
         event.preventDefault();
         setActiveIndex((prev) => (prev - 1 + resultItems.length) % resultItems.length);
         return;
       }

       if (event.key === "Enter") {
         event.preventDefault();
         const item = resultItems[activeIndex];
         if (!item) return;
         if (item.type === "recipe") {
           handleRecipeClick(item.id);
         } else {
           handleAuthorClick(item.id);
         }
       }
     };

     window.addEventListener("keydown", onKeyDown);
     return () => window.removeEventListener("keydown", onKeyDown);
   }, [activeIndex, isOpen, onClose, resultItems]);
 
   if (!isOpen) return null;
 
   return (
     <motion.div
       initial={{ opacity: 0 }}
       animate={{ opacity: 1 }}
       exit={{ opacity: 0 }}
       className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
       onClick={onClose}
     >
       <motion.div
         initial={{ opacity: 0, y: -20 }}
         animate={{ opacity: 1, y: 0 }}
         exit={{ opacity: 0, y: -20 }}
         onClick={(e) => e.stopPropagation()}
         className="max-w-2xl mx-auto mt-20 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
       >
         {/* Search Input */}
         <div className="flex items-center gap-3 p-4 border-b border-border">
           <Search className="w-5 h-5 text-muted-foreground" />
           <Input
             ref={inputRef}
             type="text"
             value={query}
             onChange={(e) => setQuery(e.target.value)}
             placeholder="Search recipes, ingredients, authors..."
             className="flex-1 border-0 focus-visible:ring-0 text-lg h-auto p-0 bg-transparent"
             role="combobox"
             aria-expanded={isOpen}
             aria-controls="global-search-results"
             aria-activedescendant={resultItems[activeIndex] ? `search-result-${resultItems[activeIndex].type}-${resultItems[activeIndex].id}` : undefined}
           />
           {query && (
             <Button
               variant="ghost"
               size="icon"
               className="h-8 w-8"
               aria-label="Clear search"
               onClick={() => setQuery("")}
             >
               <X className="w-4 h-4" />
             </Button>
           )}
         </div>
 
         {/* Results */}
         <div id="global-search-results" className="max-h-[60vh] overflow-y-auto" role="listbox">
           {debouncedQuery.length >= 2 ? (
             hasResults ? (
               <div className="p-2">
                 {/* Recipes */}
                 {filteredRecipes.length > 0 && (
                   <div className="mb-4">
                    <p className="text-[11px] font-semibold text-muted-foreground tracking-[0.16em] px-3 py-2">
                      Recipes
                    </p>
                     {filteredRecipes.map((recipe, index) => (
                       <motion.button
                         key={recipe.id}
                         whileHover={{ backgroundColor: "hsl(var(--muted) / 0.5)" }}
                         onClick={() => handleRecipeClick(recipe.id)}
                         id={`search-result-recipe-${recipe.id}`}
                         role="option"
                         aria-selected={activeIndex === index}
                         className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${
                           activeIndex === index ? "bg-muted/70 border border-primary/20" : ""
                         }`}
                       >
                         <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                           <ChefHat className="w-6 h-6 m-3 text-muted-foreground" />
                         </div>
                         <div className="flex-1 min-w-0">
                           <p className="font-medium truncate">{recipe.title}</p>
                           <div className="flex items-center gap-2 text-sm text-muted-foreground">
                             <span>{recipe.cuisine}</span>
                             <span>•</span>
                             <Clock className="w-3 h-3" />
                             <span>{recipe.totalTime}</span>
                           </div>
                         </div>
                         <span className="text-primary font-semibold">
                           {formatPrice(
                             recipe.ingredients.reduce(
                               (sum, ing) => sum + ing.quantity * ing.pricePerUnit,
                               0
                             )
                           )}
                         </span>
                       </motion.button>
                     ))}
                   </div>
                 )}
 
                 {/* Authors */}
                 {filteredAuthors.length > 0 && (
                   <div>
                    <p className="text-[11px] font-semibold text-muted-foreground tracking-[0.16em] px-3 py-2">
                      Authors
                    </p>
                     {filteredAuthors.map((author, index) => (
                       <motion.button
                         key={author.id}
                         whileHover={{ backgroundColor: "hsl(var(--muted) / 0.5)" }}
                         onClick={() => handleAuthorClick(author.user_id)}
                         id={`search-result-author-${author.user_id}`}
                         role="option"
                         aria-selected={activeIndex === filteredRecipes.length + index}
                         className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${
                           activeIndex === filteredRecipes.length + index ? "bg-muted/70 border border-primary/20" : ""
                         }`}
                       >
                         <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                           <User className="w-6 h-6 text-primary" />
                         </div>
                         <div className="flex-1 min-w-0">
                           <p className="font-medium truncate">
                             {author.display_name || "Anonymous"}
                           </p>
                           <div className="flex items-center gap-2 text-sm text-muted-foreground">
                             <span>{author.recipe_count || 0} recipes</span>
                             <span>•</span>
                             <span>{author.follower_count || 0} followers</span>
                           </div>
                         </div>
                       </motion.button>
                     ))}
                   </div>
                 )}
               </div>
             ) : (
               <div className="p-8 text-center text-muted-foreground">
                 <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
                 <p>No results found for "{debouncedQuery}"</p>
                 <p className="text-sm mt-1">Try searching for different keywords</p>
               </div>
             )
           ) : (
             <div className="p-8 text-center text-muted-foreground">
               <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
               <p>Type at least 2 characters to search</p>
             </div>
           )}
         </div>
 
         {/* Keyboard hint */}
         <div className="p-3 border-t border-border bg-muted/30 flex items-center justify-center gap-4 text-xs text-muted-foreground">
           <span>
             <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border font-mono">↑↓</kbd>
             {" "}to navigate
           </span>
           <span>
             <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border font-mono">Enter</kbd>
             {" "}to select
           </span>
           <span>
             <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border font-mono">Esc</kbd>
             {" "}to close
           </span>
         </div>
       </motion.div>
     </motion.div>
   );
 }
