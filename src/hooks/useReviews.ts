import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface Rating {
  id: string;
  user_id: string;
  recipe_id: string;
  rating: number;
  created_at: string;
}

export interface Comment {
  id: string;
  user_id: string;
  recipe_id: string;
  content: string;
  created_at: string;
  display_name?: string;
}

export function useRecipeRatings(recipeId: string) {
  const { user } = useAuth();
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRatings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("recipe_ratings")
        .select("*")
        .eq("recipe_id", recipeId);

      if (error) throw error;
      setRatings(data || []);

      if (user) {
        const myRating = data?.find(r => r.user_id === user.id);
        setUserRating(myRating?.rating || null);
      }
    } catch (error) {
      console.error("Error fetching ratings:", error);
    } finally {
      setLoading(false);
    }
  }, [recipeId, user]);

  useEffect(() => {
    fetchRatings();
  }, [fetchRatings]);

  const submitRating = async (rating: number) => {
    if (!user) {
      toast.error("Please sign in to rate recipes");
      return;
    }

    try {
      const { error } = await supabase
        .from("recipe_ratings")
        .upsert({
          user_id: user.id,
          recipe_id: recipeId,
          rating,
        }, { onConflict: "user_id,recipe_id" });

      if (error) throw error;

      setUserRating(rating);
      fetchRatings();
      toast.success("Rating submitted!");
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast.error("Failed to submit rating");
    }
  };

  const averageRating = ratings.length > 0
    ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
    : 0;

  return {
    ratings,
    userRating,
    averageRating,
    ratingCount: ratings.length,
    loading,
    submitRating,
  };
}

export function useRecipeComments(recipeId: string) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    try {
      const { data: commentsData, error } = await supabase
        .from("recipe_comments")
        .select("*")
        .eq("recipe_id", recipeId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch display names for commenters
      if (commentsData && commentsData.length > 0) {
        const userIds = [...new Set(commentsData.map(c => c.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, display_name")
          .in("user_id", userIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p.display_name]) || []);
        
        const enrichedComments = commentsData.map(c => ({
          ...c,
          display_name: profileMap.get(c.user_id) || "Anonymous",
        }));

        setComments(enrichedComments);
      } else {
        setComments([]);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  }, [recipeId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const addComment = async (content: string) => {
    if (!user) {
      toast.error("Please sign in to comment");
      return false;
    }

    if (!content.trim()) {
      toast.error("Comment cannot be empty");
      return false;
    }

    if (content.length > 1000) {
      toast.error("Comment is too long (max 1000 characters)");
      return false;
    }

    try {
      const { error } = await supabase
        .from("recipe_comments")
        .insert({
          user_id: user.id,
          recipe_id: recipeId,
          content: content.trim(),
        });

      if (error) throw error;

      fetchComments();
      toast.success("Comment added!");
      return true;
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
      return false;
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from("recipe_comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;

      fetchComments();
      toast.success("Comment deleted");
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment");
    }
  };

  return {
    comments,
    loading,
    addComment,
    deleteComment,
    currentUserId: user?.id,
  };
}
