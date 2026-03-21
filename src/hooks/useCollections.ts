import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface Collection {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  cover_image_url: string | null;
  created_at: string;
  updated_at: string;
  recipe_count?: number;
}

export function useCollections() {
  const { user } = useAuth();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCollections = useCallback(async () => {
    if (!user) {
      setCollections([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("recipe_collections")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (!error && data) {
      // Get recipe counts
      const { data: counts } = await supabase
        .from("collection_recipes")
        .select("collection_id")
        .in("collection_id", data.map(c => c.id));

      const countMap: Record<string, number> = {};
      counts?.forEach(c => {
        countMap[c.collection_id] = (countMap[c.collection_id] || 0) + 1;
      });

      setCollections(data.map(c => ({ ...c, recipe_count: countMap[c.id] || 0 })));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const createCollection = useCallback(async (name: string, description?: string) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from("recipe_collections")
      .insert({ user_id: user.id, name, description: description || null })
      .select()
      .single();

    if (error) {
      toast.error("Failed to create collection");
      return null;
    }

    setCollections(prev => [{ ...data, recipe_count: 0 }, ...prev]);
    toast.success(`Collection "${name}" created!`);
    return data;
  }, [user]);

  const deleteCollection = useCallback(async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("recipe_collections")
      .delete()
      .eq("id", id);

    if (!error) {
      setCollections(prev => prev.filter(c => c.id !== id));
      toast.success("Collection deleted");
    }
  }, [user]);

  const updateCollection = useCallback(async (id: string, updates: { name?: string; description?: string; is_public?: boolean }) => {
    if (!user) return;

    const { error } = await supabase
      .from("recipe_collections")
      .update(updates)
      .eq("id", id);

    if (!error) {
      setCollections(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
      toast.success("Collection updated");
    }
  }, [user]);

  const addRecipeToCollection = useCallback(async (collectionId: string, recipeId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("collection_recipes")
      .insert({ collection_id: collectionId, recipe_id: recipeId });

    if (error) {
      if (error.code === "23505") {
        toast.info("Recipe already in this collection");
      } else {
        toast.error("Failed to add recipe");
      }
      return;
    }

    setCollections(prev => prev.map(c => 
      c.id === collectionId ? { ...c, recipe_count: (c.recipe_count || 0) + 1 } : c
    ));
    toast.success("Recipe added to collection!");
  }, [user]);

  const removeRecipeFromCollection = useCallback(async (collectionId: string, recipeId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("collection_recipes")
      .delete()
      .eq("collection_id", collectionId)
      .eq("recipe_id", recipeId);

    if (!error) {
      setCollections(prev => prev.map(c => 
        c.id === collectionId ? { ...c, recipe_count: Math.max(0, (c.recipe_count || 0) - 1) } : c
      ));
      toast.success("Recipe removed from collection");
    }
  }, [user]);

  const getCollectionRecipes = useCallback(async (collectionId: string) => {
    const { data, error } = await supabase
      .from("collection_recipes")
      .select("recipe_id, added_at")
      .eq("collection_id", collectionId)
      .order("added_at", { ascending: false });

    if (error) return [];
    return data.map(d => d.recipe_id);
  }, []);

  return {
    collections,
    loading,
    createCollection,
    deleteCollection,
    updateCollection,
    addRecipeToCollection,
    removeRecipeFromCollection,
    getCollectionRecipes,
    refetch: fetchCollections,
  };
}
