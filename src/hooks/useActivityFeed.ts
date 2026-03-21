import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface ActivityItem {
  id: string;
  user_id: string;
  activity_type: string;
  target_id: string | null;
  metadata: Record<string, any>;
  created_at: string;
  user_name?: string;
  user_avatar?: string;
}

export function useActivityFeed() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeed = useCallback(async () => {
    setLoading(true);

    // Get recent public activity
    const { data, error } = await supabase
      .from("activity_feed")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    if (!error && data) {
      // Enrich with user profiles
      const userIds = [...new Set(data.map(a => a.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", userIds);

      const profileMap: Record<string, any> = {};
      profiles?.forEach(p => {
        profileMap[p.user_id] = p;
      });

      setActivities(data.map(a => ({
        ...a,
        metadata: (a.metadata as Record<string, any>) || {},
        user_name: profileMap[a.user_id]?.display_name || "A chef",
        user_avatar: profileMap[a.user_id]?.avatar_url,
      })));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const postActivity = useCallback(async (
    activityType: string,
    targetId?: string,
    metadata?: Record<string, any>
  ) => {
    if (!user) return;

    await supabase
      .from("activity_feed")
      .insert({
        user_id: user.id,
        activity_type: activityType,
        target_id: targetId || null,
        metadata: metadata || {},
      });
  }, [user]);

  return { activities, loading, postActivity, refetch: fetchFeed };
}
