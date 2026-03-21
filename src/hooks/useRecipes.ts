 import { useState, useEffect, useCallback } from "react";
 import { supabase } from "@/integrations/supabase/client";
 import { Recipe, RECIPES, RecipeIngredient, RecipeStep, NutritionInfo, DifficultyLevel, RecipeCategory } from "@/data/recipes";
 import { useAuth } from "@/hooks/useAuth";
 
 export interface DatabaseRecipe {
   id: string;
   title: string;
   description: string | null;
   cuisine: string;
   category: string;
   difficulty: string;
   servings: number;
   prep_time: number;
   cook_time: number;
   image_url: string | null;
   ingredients: RecipeIngredient[];
   steps: RecipeStep[];
   nutrition: NutritionInfo | null;
   tags: string[];
   author_id: string | null;
   is_featured: boolean;
   created_at: string;
   updated_at: string;
 }
 
 function dbRecipeToRecipe(dbRecipe: DatabaseRecipe, authorName?: string): Recipe {
   return {
     id: dbRecipe.id,
     title: dbRecipe.title,
     description: dbRecipe.description || "",
     image: dbRecipe.image_url || "/recipe-pasta.jpg",
     cuisine: dbRecipe.cuisine,
     category: dbRecipe.category as RecipeCategory,
     difficulty: dbRecipe.difficulty as DifficultyLevel,
     servings: dbRecipe.servings,
     prepTime: `${dbRecipe.prep_time} min`,
     cookTime: `${dbRecipe.cook_time} min`,
     totalTime: `${dbRecipe.prep_time + dbRecipe.cook_time} min`,
     tags: dbRecipe.tags || [dbRecipe.cuisine],
     ingredients: dbRecipe.ingredients || [],
     steps: dbRecipe.steps || [],
     nutrition: dbRecipe.nutrition || { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 },
     authorId: dbRecipe.author_id || undefined,
     authorName: authorName,
     isFeatured: dbRecipe.is_featured,
   };
 }
 
 export function usePresetRecipes() {
   const [recipes, setRecipes] = useState<Recipe[]>([]);
   const [loading, setLoading] = useState(true);
 
   useEffect(() => {
     const fetchRecipes = async () => {
       try {
         const { data, error } = await supabase
           .from("preset_recipes")
           .select("*")
           .order("created_at", { ascending: false });
 
         if (error) throw error;
 
         if (data && data.length > 0) {
           const convertedRecipes = data.map((r) => dbRecipeToRecipe(r as unknown as DatabaseRecipe));
           setRecipes(convertedRecipes);
         } else {
           // Fallback to static recipes if no preset recipes in DB
           setRecipes(RECIPES);
         }
       } catch (error) {
         console.error("Error fetching preset recipes:", error);
         // Fallback to static recipes
         setRecipes(RECIPES);
       } finally {
         setLoading(false);
       }
     };
 
     fetchRecipes();
   }, []);
 
   return { recipes, loading };
 }
 
 export function useCommunityRecipes() {
   const [recipes, setRecipes] = useState<Recipe[]>([]);
   const [loading, setLoading] = useState(true);
 
   useEffect(() => {
     const fetchRecipes = async () => {
       try {
         const { data, error } = await supabase
           .from("custom_recipes")
           .select("*")
           .eq("is_public", true)
           .order("created_at", { ascending: false });
 
         if (error) throw error;
 
         // Get author names
         const authorIds = [...new Set((data || []).map((r) => r.user_id))];
         const { data: profiles } = await supabase
           .from("profiles")
           .select("user_id, display_name")
           .in("user_id", authorIds);
 
         const authorMap = new Map(profiles?.map((p) => [p.user_id, p.display_name]) || []);
 
         const convertedRecipes = (data || []).map((r) => ({
           id: r.id,
           title: r.title,
           description: r.description || "",
           image: r.image_url || "/recipe-pasta.jpg",
           cuisine: r.cuisine,
           category: "Community" as RecipeCategory,
           difficulty: "Medium" as DifficultyLevel,
           servings: r.servings,
           prepTime: `${r.prep_time ?? 15} min`,
           cookTime: `${r.cook_time ?? 30} min`,
           totalTime: `${(r.prep_time ?? 15) + (r.cook_time ?? 30)} min`,
           tags: ["Community", r.cuisine],
           ingredients: r.ingredients as unknown as RecipeIngredient[],
           steps: r.steps as unknown as RecipeStep[],
           nutrition: (r.nutrition as unknown as NutritionInfo) || { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 },
           authorId: r.user_id,
           authorName: authorMap.get(r.user_id) || "Anonymous",
           isPublic: true,
         }));
 
         setRecipes(convertedRecipes as Recipe[]);
       } catch (error) {
         console.error("Error fetching community recipes:", error);
       } finally {
         setLoading(false);
       }
     };
 
     fetchRecipes();
   }, []);
 
   return { recipes, loading };
 }
 
 export function useAuthorRecipes(authorUserId: string | undefined) {
   const [recipes, setRecipes] = useState<Recipe[]>([]);
   const [loading, setLoading] = useState(true);
 
   useEffect(() => {
     if (!authorUserId) {
       setLoading(false);
       return;
     }
 
     const fetchRecipes = async () => {
       try {
         const { data, error } = await supabase
           .from("custom_recipes")
           .select("*")
           .eq("user_id", authorUserId)
           .eq("is_public", true)
           .order("created_at", { ascending: false });
 
         if (error) throw error;
 
         const { data: profile } = await supabase
           .from("profiles")
           .select("display_name")
           .eq("user_id", authorUserId)
           .maybeSingle();
 
         const convertedRecipes = (data || []).map((r) => ({
           id: r.id,
           title: r.title,
           description: r.description || "",
           image: r.image_url || "/recipe-pasta.jpg",
           cuisine: r.cuisine,
           category: "Community" as RecipeCategory,
           difficulty: "Medium" as DifficultyLevel,
           servings: r.servings,
           prepTime: `${r.prep_time ?? 15} min`,
           cookTime: `${r.cook_time ?? 30} min`,
           totalTime: `${(r.prep_time ?? 15) + (r.cook_time ?? 30)} min`,
           tags: ["Community", r.cuisine],
           ingredients: r.ingredients as unknown as RecipeIngredient[],
           steps: r.steps as unknown as RecipeStep[],
           nutrition: (r.nutrition as unknown as NutritionInfo) || { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 },
           authorId: r.user_id,
           authorName: profile?.display_name || "Anonymous",
         }));
 
         setRecipes(convertedRecipes as Recipe[]);
       } catch (error) {
         console.error("Error fetching author recipes:", error);
       } finally {
         setLoading(false);
       }
     };
 
     fetchRecipes();
   }, [authorUserId]);
 
   return { recipes, loading };
 }
 
 export function useAllRecipes() {
   const { user } = useAuth();
   const { recipes: presetRecipes, loading: presetLoading } = usePresetRecipes();
   const { recipes: communityRecipes, loading: communityLoading } = useCommunityRecipes();
   const [userRecipes, setUserRecipes] = useState<Recipe[]>([]);
   const [userRecipesLoading, setUserRecipesLoading] = useState(true);
 
   useEffect(() => {
     if (!user) {
       setUserRecipes([]);
       setUserRecipesLoading(false);
       return;
     }
 
     const fetchUserRecipes = async () => {
       try {
         const { data, error } = await supabase
           .from("custom_recipes")
           .select("*")
           .eq("user_id", user.id)
           .order("created_at", { ascending: false });
 
         if (error) throw error;
 
         const convertedRecipes = (data || []).map((r) => ({
           id: r.id,
           title: r.title,
           description: r.description || "",
           image: r.image_url || "/recipe-pasta.jpg",
           cuisine: r.cuisine,
           category: "Custom" as RecipeCategory,
           difficulty: "Medium" as DifficultyLevel,
           servings: r.servings,
           prepTime: `${r.prep_time ?? 15} min`,
           cookTime: `${r.cook_time ?? 30} min`,
           totalTime: `${(r.prep_time ?? 15) + (r.cook_time ?? 30)} min`,
           tags: ["My Recipe", r.cuisine],
           ingredients: r.ingredients as unknown as RecipeIngredient[],
           steps: r.steps as unknown as RecipeStep[],
           nutrition: (r.nutrition as unknown as NutritionInfo) || { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 },
           authorId: r.user_id,
           isOwn: true,
           isPublic: (r as any).is_public,
         }));
 
         setUserRecipes(convertedRecipes as Recipe[]);
       } catch (error) {
         console.error("Error fetching user recipes:", error);
       } finally {
         setUserRecipesLoading(false);
       }
     };
 
     fetchUserRecipes();
   }, [user]);
 
   // Combine all recipes, removing duplicates
   const allRecipes = [
     ...presetRecipes,
     ...communityRecipes.filter((cr) => !presetRecipes.some((pr) => pr.id === cr.id)),
     ...userRecipes.filter(
       (ur) =>
         !presetRecipes.some((pr) => pr.id === ur.id) &&
         !communityRecipes.some((cr) => cr.id === ur.id)
     ),
   ];
 
   return {
     recipes: allRecipes,
     loading: presetLoading || communityLoading || userRecipesLoading,
     presetRecipes,
     communityRecipes,
     userRecipes,
   };
 }