import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface CookingHistoryEntry {
  id: string;
  recipe_id: string;
  recipe_title: string;
  cooked_at: string;
  notes: string | null;
  rating: number | null;
}

export function useCookingHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState<CookingHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setHistory([]);
      setLoading(false);
      return;
    }

    const fetchHistory = async () => {
      const { data, error } = await supabase
        .from("cooking_history")
        .select("*")
        .eq("user_id", user.id)
        .order("cooked_at", { ascending: false })
        .limit(50);

      if (!error && data) {
        setHistory(data);
      }
      setLoading(false);
    };

    fetchHistory();
  }, [user]);

  const addToHistory = useCallback(async (recipeId: string, recipeTitle: string) => {
    if (!user) return;

    const entry = {
      user_id: user.id,
      recipe_id: recipeId,
      recipe_title: recipeTitle,
    };

    const { data, error } = await supabase
      .from("cooking_history")
      .insert(entry)
      .select()
      .single();

    if (!error && data) {
      setHistory(prev => [data, ...prev]);
    }
  }, [user]);

  const updateHistoryEntry = useCallback(async (id: string, updates: { notes?: string; rating?: number }) => {
    if (!user) return;

    const { error } = await supabase
      .from("cooking_history")
      .update(updates)
      .eq("id", id);

    if (!error) {
      setHistory(prev => prev.map(entry => 
        entry.id === id ? { ...entry, ...updates } : entry
      ));
    }
  }, [user]);

  const removeFromHistory = useCallback(async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("cooking_history")
      .delete()
      .eq("id", id);

    if (!error) {
      setHistory(prev => prev.filter(entry => entry.id !== id));
    }
  }, [user]);

  return { history, loading, addToHistory, updateHistoryEntry, removeFromHistory };
}
