import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SiteStats {
  recipeCount: number;
  userCount: number;
  averageRating: number;
  loading: boolean;
}

export function useStats(): SiteStats {
  const [recipeCount, setRecipeCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [
          { count: presetCount },
          { count: communityCount },
          { count: profileCount },
          { data: ratingData },
        ] = await Promise.all([
          supabase.from("preset_recipes").select("*", { count: "exact", head: true }),
          supabase.from("custom_recipes").select("*", { count: "exact", head: true }).eq("is_public", true),
          supabase.from("profiles").select("*", { count: "exact", head: true }),
          supabase.from("recipe_ratings").select("rating"),
        ]);

        setRecipeCount((presetCount ?? 0) + (communityCount ?? 0));
        setUserCount(profileCount ?? 0);

        if (ratingData && ratingData.length > 0) {
          const avg = ratingData.reduce((sum, r) => sum + (r.rating ?? 0), 0) / ratingData.length;
          setAverageRating(Math.round(avg * 10) / 10);
        }
      } catch {
        // leave defaults
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return { recipeCount, userCount, averageRating, loading };
}
