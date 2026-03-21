 import { useState, useEffect, useCallback } from "react";
 import { useAuth } from "@/hooks/useAuth";
 import { supabase } from "@/integrations/supabase/client";
 import { toast } from "sonner";
 
 export interface Author {
   id: string;
   user_id: string;
   display_name: string | null;
   avatar_url: string | null;
   bio: string | null;
   location: string | null;
   website: string | null;
   is_verified: boolean;
   created_at: string;
   follower_count?: number;
   following_count?: number;
   recipe_count?: number;
 }
 
 export function useAuthors() {
   const [authors, setAuthors] = useState<Author[]>([]);
   const [loading, setLoading] = useState(true);
 
   const fetchAuthors = useCallback(async () => {
     try {
       const { data, error } = await supabase
         .from("profiles")
         .select("*")
         .order("created_at", { ascending: false });
 
       if (error) throw error;
 
       // Get follower counts for each author
       const authorsWithCounts = await Promise.all(
         (data || []).map(async (profile) => {
           const [followerRes, followingRes, recipeRes] = await Promise.all([
             supabase
               .from("user_follows")
               .select("id", { count: "exact", head: true })
               .eq("following_id", profile.user_id),
             supabase
               .from("user_follows")
               .select("id", { count: "exact", head: true })
               .eq("follower_id", profile.user_id),
             supabase
               .from("custom_recipes")
               .select("id", { count: "exact", head: true })
               .eq("user_id", profile.user_id)
               .eq("is_public", true),
           ]);
 
           return {
             ...profile,
             is_verified: profile.is_verified || false,
             follower_count: followerRes.count || 0,
             following_count: followingRes.count || 0,
             recipe_count: recipeRes.count || 0,
           };
         })
       );
 
       setAuthors(authorsWithCounts);
     } catch (error) {
       console.error("Error fetching authors:", error);
     } finally {
       setLoading(false);
     }
   }, []);
 
   useEffect(() => {
     fetchAuthors();
   }, [fetchAuthors]);
 
   return { authors, loading, refetch: fetchAuthors };
 }
 
 export function useAuthor(userId: string | undefined) {
   const [author, setAuthor] = useState<Author | null>(null);
   const [loading, setLoading] = useState(true);
 
   useEffect(() => {
     if (!userId) {
       setLoading(false);
       return;
     }
 
     const fetchAuthor = async () => {
       try {
         const { data, error } = await supabase
           .from("profiles")
           .select("*")
           .eq("user_id", userId)
           .maybeSingle();
 
         if (error) throw error;
 
         if (data) {
           const [followerRes, followingRes, recipeRes] = await Promise.all([
             supabase
               .from("user_follows")
               .select("id", { count: "exact", head: true })
               .eq("following_id", userId),
             supabase
               .from("user_follows")
               .select("id", { count: "exact", head: true })
               .eq("follower_id", userId),
             supabase
               .from("custom_recipes")
               .select("id", { count: "exact", head: true })
               .eq("user_id", userId)
               .eq("is_public", true),
           ]);
 
           setAuthor({
             ...data,
             is_verified: data.is_verified || false,
             follower_count: followerRes.count || 0,
             following_count: followingRes.count || 0,
             recipe_count: recipeRes.count || 0,
           });
         }
       } catch (error) {
         console.error("Error fetching author:", error);
       } finally {
         setLoading(false);
       }
     };
 
     fetchAuthor();
   }, [userId]);
 
   return { author, loading };
 }
 
 export function useFollow() {
   const { user } = useAuth();
   const [following, setFollowing] = useState<Set<string>>(new Set());
   const [loading, setLoading] = useState(true);
 
   useEffect(() => {
     if (!user) {
       setFollowing(new Set());
       setLoading(false);
       return;
     }
 
     const fetchFollowing = async () => {
       try {
         const { data, error } = await supabase
           .from("user_follows")
           .select("following_id")
           .eq("follower_id", user.id);
 
         if (error) throw error;
 
         setFollowing(new Set(data?.map((f) => f.following_id) || []));
       } catch (error) {
         console.error("Error fetching following:", error);
       } finally {
         setLoading(false);
       }
     };
 
     fetchFollowing();
   }, [user]);
 
   const toggleFollow = useCallback(
     async (authorUserId: string) => {
       if (!user) {
         toast.error("Please sign in to follow authors");
         return;
       }
 
       const isFollowing = following.has(authorUserId);
 
       try {
         if (isFollowing) {
           const { error } = await supabase
             .from("user_follows")
             .delete()
             .eq("follower_id", user.id)
             .eq("following_id", authorUserId);
 
           if (error) throw error;
 
           setFollowing((prev) => {
             const updated = new Set(prev);
             updated.delete(authorUserId);
             return updated;
           });
           toast.success("Unfollowed author");
         } else {
           const { error } = await supabase.from("user_follows").insert({
             follower_id: user.id,
             following_id: authorUserId,
           });
 
           if (error) throw error;
 
           setFollowing((prev) => new Set([...prev, authorUserId]));
           toast.success("Now following author!");
         }
       } catch (error: any) {
         console.error("Error toggling follow:", error);
         toast.error(error.message || "Failed to update follow");
       }
     },
     [user, following]
   );
 
   const isFollowing = useCallback(
     (authorUserId: string) => following.has(authorUserId),
     [following]
   );
 
   return { following, toggleFollow, isFollowing, loading };
 }